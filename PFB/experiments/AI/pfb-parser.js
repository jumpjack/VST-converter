/*
 * pfb-parser.js — parser da zero per il formato binario "Performer Fast
 * Binary" (.pfb) di SGI IRIS/OpenGL Performer.
 *
 * Non esiste documentazione ufficiale pubblica del formato. Questa
 * implementazione è stata ricostruita studiando il codice sorgente reale di
 * OpenPfb (Jean-Christophe Hoelt, CNRS-IRIT, 2006, licenza LGPLv2,
 * https://github.com/j3k0/OpenPFB) — un loader C++ funzionante e
 * indipendente dal repository "VST-converter" di jumpjack — e verificata
 * byte per byte contro due file .pfb reali (dataset MER, forniti dall'utente).
 * Nessun codice è stato copiato da OpenPfb: solo la comprensione del layout
 * binario è stata riutilizzata e reimplementata qui da zero in JavaScript.
 */
(function (global) {
  "use strict";

  class PFBParseError extends Error {
    constructor(msg, offset) {
      super(offset !== undefined ? `${msg} (offset 0x${offset.toString(16)})` : msg);
      this.name = "PFBParseError";
    }
  }

  class Cursor {
    constructor(buf) {
      this.buf = buf;
      this.view = new DataView(buf);
      this.o = 0;
      this.le = true;
    }
    get remaining() { return this.buf.byteLength - this.o; }
    need(n, what) {
      if (this.remaining < n) throw new PFBParseError(`Fine inaspettata leggendo "${what}"`, this.o);
    }
    u32(what) { this.need(4, what||'u32'); const v = this.view.getUint32(this.o, this.le); this.o += 4; return v; }
    i32(what) { this.need(4, what||'i32'); const v = this.view.getInt32(this.o, this.le); this.o += 4; return v; }
    f32(what) { this.need(4, what||'f32'); const v = this.view.getFloat32(this.o, this.le); this.o += 4; return v; }
    bytes(n, what) { this.need(n, what||'bytes'); const v = new Uint8Array(this.buf, this.o, n); this.o += n; return v; }
    skip(n) { this.need(n, 'skip'); this.o += n; }
    seek(pos) { this.o = pos; }
  }

  function readCString(cur, length) {
    const bytes = cur.bytes(length, 'string');
    let end = bytes.length;
    for (let i = 0; i < bytes.length; i++) if (bytes[i] === 0) { end = i; break; }
    let s = '';
    for (let i = 0; i < end; i++) s += String.fromCharCode(bytes[i]);
    return s;
  }

  // Legge una "PfbString": lunghezza(u32) + N byte (nessun terminatore garantito)
  function readPfbString(cur) {
    let length = cur.u32('string.length');
    if (length === 0xffffffff) length = 0;
    if (length > 0x10000) throw new PFBParseError('Lunghezza stringa non plausibile: ' + length, cur.o);
    if (length === 0) return '';
    return readCString(cur, length);
  }

  // ---- liste numeriche generiche (Length/Vertex/Color/Normal/Texcoord) ----
  function readNumericList(cur, floatsPerEntry, isFloat) {
    const size = cur.u32('list.size');
    cur.skip(8); // due int32 non identificati
    const out = isFloat ? new Float32Array(size * floatsPerEntry) : new Uint32Array(size * floatsPerEntry);
    for (let i = 0; i < out.length; i++) {
      out[i] = isFloat ? cur.f32() : cur.u32();
    }
    return { count: size, data: out };
  }

  function readListBlock(cur, floatsPerEntry, isFloat) {
    const numLists = cur.u32('block.numLists');
    const totalSize = cur.u32('block.totalSize');
    const blockEnd = cur.o + totalSize;
    const lists = [];
    for (let i = 0; i < numLists; i++) lists.push(readNumericList(cur, floatsPerEntry, isFloat));
    cur.seek(blockEnd); // il totalSize dichiarato è la fonte di verità
    return lists;
  }

  // ---------------------------------------------------------------- Materiali
  function readMaterial(cur) {
    const type = cur.u32('material.type');
    if (type !== 1 && type !== 2) throw new PFBParseError('Tipo materiale non supportato: ' + type, cur.o);
    const data2 = cur.f32();
    const shininess = cur.f32();
    const specular = [cur.f32(), cur.f32(), cur.f32()];
    const diffuse = [cur.f32(), cur.f32(), cur.f32()];
    const diffuseBis = [cur.f32(), cur.f32(), cur.f32()];
    const ambient = [cur.f32(), cur.f32(), cur.f32()];
    const data8 = [cur.i32(), cur.i32()];
    const data9 = cur.i32();
    return { type, shininess, specular, diffuse, diffuseBis, ambient };
  }

  function readMaterialsBlock(cur) {
    const num = cur.u32(), totalSize = cur.u32();
    const end = cur.o + totalSize;
    const out = [];
    for (let i = 0; i < num; i++) out.push(readMaterial(cur));
    cur.seek(end);
    return out;
  }

  // ---------------------------------------------------------------- Texture
  function readTexture(cur) {
    const fileName = readPfbString(cur);
    cur.skip(232); // blocco parametri non decodificato (wrap/filtri/matrice texture): verificato byte per byte su file reali
    return { fileName };
  }

  function readTexturesBlock(cur) {
    const num = cur.u32(), totalSize = cur.u32();
    const end = cur.o + totalSize;
    const out = [];
    for (let i = 0; i < num; i++) out.push(readTexture(cur));
    cur.seek(end); // rete di sicurezza: alcuni file hanno padding extra dopo l'ultima texture
    return out;
  }

  // ---------------------------------------------------------------- GeoState
  // Flusso chiave/valore con alcune chiavi "speciali" che portano payload
  // aggiuntivo (osservazione empirica, non documentata). Chiavi note:
  const GEOSTATE_KEY = {
    TRANSPARENCY: 1, ALPHAFUNC: 4, ENLIGHTING: 5, ENTEXTURE: 6,
    CULLFACE: 8, ENCOLORTABLE: 10, ENLPOINTSTATE: 12, FRONTMTL: 15,
    TEXTURE: 17, TEXENV: 18,
  };
  function readGeoState(cur) {
    const values = {};
    let nextKey = 0;
    while (true) {
      let key;
      if (nextKey !== 0) { key = nextKey; nextKey = 0; }
      else key = cur.i32('geostate.key');
      if (key === -1) break;
      const value = cur.i32('geostate.value');
      values[key] = value;
      if (key === 6 || key === 13) {
        const one = cur.i32();
        if (one === 1) cur.skip(8);
        else nextKey = one;
      }
      if (key === 17 || key === 18 || key === 25) {
        let one = cur.i32();
        if (one === -1) {
          const two = cur.i32();
          if (two !== -1) { cur.seek(cur.o - 4); break; }
          cur.i32(); // valore scartato
        } else {
          nextKey = one;
        }
      }
    }
    return values;
  }

  function readGeoStatesBlock(cur) {
    const num = cur.u32(), totalSize = cur.u32();
    const end = cur.o + totalSize;
    const out = [];
    for (let i = 0; i < num; i++) out.push(readGeoState(cur));
    cur.seek(end);
    return out;
  }

  // ---------------------------------------------------------------- GeoSet
  const GEOSET_RECORD_SIZE = 128; // dimensione della porzione compresa, vedi sotto
  function readGeoSetRaw(cur) {
    const start = cur.o;
    const stripType = cur.u32();
    const numStrip = cur.u32();
    const lengthListId = cur.i32();
    cur.skip(12 * 5); // 5 blocchi int32[3] non decodificati (probabili bind-mode per coord/normal/color/texcoord/extra)
    const geostateId = cur.i32();
    cur.skip(4); // data6b
    cur.skip(8); // data7[2]
    cur.skip(4); // data8
    const mask = cur.u32();
    cur.skip(4); // data9
    cur.skip(4); // num
    const bbox = [cur.f32(), cur.f32(), cur.f32(), cur.f32(), cur.f32(), cur.f32()];
    const consumed = cur.o - start;
    return { stripType, numStrip, lengthListId, geostateId, mask, bbox, consumed };
  }

  function readGeoSetsBlock(cur) {
    const num = cur.u32(), totalSize = cur.u32();
    const end = cur.o + totalSize;
    const sizePerSet = num > 0 ? Math.floor(totalSize / num) : 0;
    const out = [];
    for (let i = 0; i < num; i++) {
      const recStart = cur.o;
      const g = readGeoSetRaw(cur);
      cur.seek(recStart + sizePerSet); // salta eventuale padding di versione
      out.push(g);
    }
    cur.seek(end);
    return out;
  }

  // ---------------------------------------------------------------- Nodi
  const NODE_TYPE = { GEODE: 2, GROUP: 5, SCS: 6, DCS: 7, LOD: 11 };

  function readChildren(cur) {
    const n = cur.u32('children.count');
    const arr = new Array(n);
    for (let i = 0; i < n; i++) arr[i] = cur.u32();
    return arr;
  }

  function readNode(cur) {
    const nodeSizeWords = cur.u32('node.size'); // lunghezza (in parole da 4 byte) da qui fino all'inizio del nome
    const bodyStart = cur.o;
    const type = cur.u32('node.type');
    const node = { type, children: [], geosets: [], matrix: null, ranges: null, center: null };

    switch (type) {
      case NODE_TYPE.GEODE: {
        const n = cur.u32();
        for (let i = 0; i < n; i++) node.geosets.push(cur.u32());
        break;
      }
      case NODE_TYPE.GROUP:
        node.children = readChildren(cur);
        break;
      case NODE_TYPE.SCS: {
        const m = new Array(16);
        for (let i = 0; i < 16; i++) m[i] = cur.f32();
        node.matrix = m;
        node.children = readChildren(cur);
        break;
      }
      case NODE_TYPE.DCS: {
        cur.skip(4); // mask
        const m = new Array(16);
        for (let i = 0; i < 16; i++) m[i] = cur.f32();
        node.matrix = m;
        node.children = readChildren(cur);
        break;
      }
      case NODE_TYPE.LOD: {
        const numRanges = cur.u32();
        const ranges = new Array(numRanges + 1);
        for (let i = 0; i < numRanges + 1; i++) ranges[i] = cur.f32();
        cur.skip((numRanges + 1) * 4); // seconda serie di float, scopo ignoto (letta e scartata anche in OpenPfb)
        node.center = [cur.f32(), cur.f32(), cur.f32()];
        cur.skip(8); // due int32, probabilmente -1 -1
        node.ranges = ranges;
        node.children = readChildren(cur);
        break;
      }
      default:
        throw new PFBParseError('Tipo nodo non supportato: ' + type, cur.o);
    }

    // Il nome si trova sempre a un offset assoluto noto (bodyStart + nodeSizeWords*4),
    // indipendentemente da eventuali campi non completamente decodificati sopra.
    const namePos = bodyStart + nodeSizeWords * 4;
    cur.seek(namePos);
    node.name = readPfbString(cur);
    return node;
  }

  function readNodesBlock(cur) {
    const num = cur.u32(), totalSize = cur.u32();
    const end = cur.o + totalSize;
    const out = [];
    for (let i = 0; i < num; i++) out.push(readNode(cur));
    cur.seek(end);
    return out;
  }

  // ---------------------------------------------------------------- Header + dispatch
  function readHeader(cur) {
    const magic = cur.u32('magic');
    if (magic === 0xdb0ace00) cur.le = true;
    else if (magic === 0x00ce0adb) cur.le = false;
    else throw new PFBParseError('Firma iniziale non valida per un file .pfb (atteso 0xdb0ace00)', 0);
    cur.skip(12); // 3 campi non identificati
  }

  function parsePFB(arrayBuffer, opts) {
    opts = opts || {};
    const cur = new Cursor(arrayBuffer);
    readHeader(cur);

    const tree = {
      lengthLists: [], vertexLists: [], colorLists: [], normalLists: [], texcoordLists: [],
      materials: [], textures: [], geostates: [], geosets: [], nodes: [],
      unknownBlocks: [],
    };

    while (cur.remaining >= 8) {
      const blockStart = cur.o;
      const type = cur.u32('block.type');
      switch (type) {
        case 4: tree.lengthLists = readListBlock(cur, 1, false); break;
        case 5: tree.vertexLists = readListBlock(cur, 3, true); break;
        case 6: tree.colorLists = readListBlock(cur, 4, true); break;
        case 7: tree.normalLists = readListBlock(cur, 3, true); break;
        case 8: tree.texcoordLists = readListBlock(cur, 2, true); break;
        case 0: tree.materials = readMaterialsBlock(cur); break;
        case 1: tree.textures = readTexturesBlock(cur); break;
        case 3: tree.geostates = readGeoStatesBlock(cur); break;
        case 10: tree.geosets = readGeoSetsBlock(cur); break;
        case 12: tree.nodes = readNodesBlock(cur); break;
        default: {
          // Blocco non compreso (es. tipo 2 TexEnv, 9 sconosciuto, 17/18/27...):
          // saltato in sicurezza usando il campo totalSize, sempre presente.
          const count = cur.u32('block.count(sconosciuto)');
          const totalSize = cur.u32('block.totalSize(sconosciuto)');
          tree.unknownBlocks.push({ type, count, totalSize, offset: blockStart });
          cur.seek(cur.o + totalSize);
        }
      }
    }
    return tree;
  }

  global.PFB = { parsePFB, PFBParseError };
})(typeof window !== 'undefined' ? window : globalThis);
