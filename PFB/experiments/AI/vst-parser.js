/*
 * vst-parser.js
 * ---------------------------------------------------------------------
 * Parser indipendente per il formato binario ViSTa (.vst / "Visible
 * Scalable Terrain"), sviluppato dal JPL per il Science Activity Planner
 * (SAP) delle missioni Mars Exploration Rover (Spirit / Opportunity).
 *
 * La struttura dei campi implementata qui è stata ricostruita seguendo
 * la specifica pubblica del formato:
 *
 *   - Backes P., Powell M., Vona M., Norris J., Morrison J.,
 *     "Format for Interchange and Display of 3D Terrain Data",
 *     NASA Tech Brief NPO-30600 (JPL/Caltech, pubblicato 2004),
 *     NASA Technical Reports Server, documento 20110020460.
 *   - Vona M., Backes P., Norris J., Powell M.,
 *     "Challenges in 3D Visualization for Mars Exploration Rover
 *     Mission Science Planning", IEEE Aerospace Conference 2003
 *     (sezione 3, "Visible Scalable Terrain (ViSTa) Format").
 *
 * Layout binario (little-endian nei file MER; il byte-order è comunque
 * verificato a runtime tramite il marcatore nell'header):
 *
 *   VSTHeader            40 byte
 *   BoundingBox globale  24 byte   (xmin,ymin,zmin,xmax,ymax,zmax; f32)
 *   TextureRef  x N      2048 byte ciascuno (N = textures_count)
 *   CoordinateSystem     4096 byte
 *   Vertex      x N      20 byte ciascuno (s,t,x,y,z; f32) (N = vertex_count)
 *   LOD         x N                        (N = lods_count, crescenti in dettaglio)
 *     LODHeader          28 byte
 *     BoundingBox        24 byte
 *     Patch      x N                       (N = patches_count)
 *       PatchHeader      24 byte
 *       IndexArrayLength x N  (4 byte l'una, N = numero di array d'indici)
 *       Index            x N  (4 byte l'uno, N = numero totale di indici)
 *
 * Nessuna parte di questo file riusa codice di terze parti: la lettura
 * binaria è implementata da zero con DataView/ArrayBuffer.
 * ---------------------------------------------------------------------
 */

(function (global) {
  "use strict";

  const HEADER_SIZE = 40;
  const BBOX_SIZE = 24;
  const TEXTURE_REF_SIZE = 2048;
  const COORD_SYSTEM_SIZE = 4096;
  const VERTEX_SIZE = 20; // s,t,x,y,z (5 float32)
  const LOD_HEADER_SIZE = 28;
  const PATCH_HEADER_SIZE = 24;

  const PATCH_TYPE_TRIANGLE_STRIPS = 0;
  const PATCH_TYPE_POINT_CLOUD = 1;

  /** Errore dedicato per problemi di parsing del file .vst. */
  class VSTParseError extends Error {
    constructor(message, offset) {
      super(offset !== undefined ? `${message} (offset 0x${offset.toString(16)})` : message);
      this.name = "VSTParseError";
      this.offset = offset;
    }
  }

  /** Cursore di lettura sequenziale su un ArrayBuffer, con controllo dei limiti. */
  class Cursor {
    constructor(arrayBuffer, littleEndian) {
      this.buffer = arrayBuffer;
      this.view = new DataView(arrayBuffer);
      this.offset = 0;
      this.littleEndian = littleEndian !== false;
    }

    get remaining() {
      return this.buffer.byteLength - this.offset;
    }

    assertAvailable(n, what) {
      if (this.remaining < n) {
        throw new VSTParseError(
          `Fine inaspettata del file durante la lettura di "${what}" (richiesti ${n} byte, disponibili ${this.remaining})`,
          this.offset
        );
      }
    }

    readBytes(n, what) {
      this.assertAvailable(n, what || "blocco di byte");
      const bytes = new Uint8Array(this.buffer, this.offset, n);
      this.offset += n;
      return bytes;
    }

    readU32(what) {
      this.assertAvailable(4, what || "intero a 32 bit");
      const v = this.view.getUint32(this.offset, this.littleEndian);
      this.offset += 4;
      return v;
    }

    readF32(what) {
      this.assertAvailable(4, what || "float a 32 bit");
      const v = this.view.getFloat32(this.offset, this.littleEndian);
      this.offset += 4;
      return v;
    }

    skip(n) {
      this.assertAvailable(n, "padding riservato");
      this.offset += n;
    }
  }

  /** Decodifica un blocco di byte come stringa ASCII, troncata al primo NUL. */
  function bytesToAsciiString(bytes) {
    let end = bytes.length;
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0) { end = i; break; }
    }
    let s = "";
    for (let i = 0; i < end; i++) {
      const c = bytes[i];
      s += (c >= 0x20 && c < 0x7f) ? String.fromCharCode(c) : "";
    }
    return s.trim();
  }

  function readBoundingBox(cur) {
    return {
      xmin: cur.readF32("bbox.xmin"), ymin: cur.readF32("bbox.ymin"), zmin: cur.readF32("bbox.zmin"),
      xmax: cur.readF32("bbox.xmax"), ymax: cur.readF32("bbox.ymax"), zmax: cur.readF32("bbox.zmax"),
    };
  }

  function readHeader(cur) {
    const magicBytes = cur.readBytes(4, "magic VST\\0");
    const magic = String.fromCharCode(magicBytes[0], magicBytes[1], magicBytes[2]);
    if (magic !== "VST" || magicBytes[3] !== 0) {
      throw new VSTParseError(
        `Firma iniziale non valida: atteso "VST\\0", trovato byte [${Array.from(magicBytes).join(",")}]. Il file non sembra un .vst ViSTa.`,
        0
      );
    }

    const orderBytes = cur.readBytes(4, "marcatore byte-order");
    let littleEndian;
    if (orderBytes[0] === 0 && orderBytes[1] === 1 && orderBytes[2] === 2 && orderBytes[3] === 3) {
      littleEndian = true;
    } else if (orderBytes[0] === 3 && orderBytes[1] === 2 && orderBytes[2] === 1 && orderBytes[3] === 0) {
      littleEndian = false;
    } else {
      // Marcatore non riconosciuto: si assume little-endian (caso comune nei file MER)
      // ma si segnala l'anomalia al chiamante.
      littleEndian = true;
    }
    cur.littleEndian = littleEndian;

    const major = cur.readU32("versione maggiore");
    const minor = cur.readU32("versione minore");
    const implIdBytes = cur.readBytes(4, "implementation id");
    const implId = bytesToAsciiString(implIdBytes) || "(vuoto)";
    cur.skip(8); // riservato
    const texturesCount = cur.readU32("textures_count");
    const vertexCount = cur.readU32("vertex_count");
    const lodsCount = cur.readU32("lods_count");

    return {
      magic, littleEndian, major, minor, implId,
      texturesCount, vertexCount, lodsCount,
      byteOrderRecognized: (orderBytes[0] === 0 || orderBytes[0] === 3),
    };
  }

  function readTextureRefs(cur, count) {
    const refs = [];
    for (let i = 0; i < count; i++) {
      const bytes = cur.readBytes(TEXTURE_REF_SIZE, `TextureRef[${i}]`);
      refs.push(bytesToAsciiString(bytes) || "(riferimento vuoto)");
    }
    return refs;
  }

  function readVertexPool(cur, count) {
    // Layout intercalato nel file: s,t,x,y,z per ciascun vertice.
    // Per efficienza costruiamo direttamente typed array separati per
    // posizioni (x,y,z) e coordinate texture (s,t), pronti per Babylon.js.
    cur.assertAvailable(count * VERTEX_SIZE, "pool dei vertici");
    const positions = new Float32Array(count * 3);
    const uvs = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const s = cur.readF32();
      const t = cur.readF32();
      const x = cur.readF32();
      const y = cur.readF32();
      const z = cur.readF32();
      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      uvs[i * 2 + 0] = s;
      uvs[i * 2 + 1] = t;
    }
    return { positions, uvs };
  }

  function readPatch(cur, patchIndex) {
    cur.skip(8); // riservato
    const patchType = cur.readU32(`patch[${patchIndex}].type`);
    const textureIndex = cur.readU32(`patch[${patchIndex}].textureIndex`);
    const numArrays = cur.readU32(`patch[${patchIndex}].numIndexArrays`);
    const totalIndexCount = cur.readU32(`patch[${patchIndex}].totalIndexCount`);

    const arrayLengths = new Uint32Array(numArrays);
    let sumLengths = 0;
    for (let i = 0; i < numArrays; i++) {
      arrayLengths[i] = cur.readU32(`patch[${patchIndex}].indexArrayLength[${i}]`);
      sumLengths += arrayLengths[i];
    }
    if (sumLengths !== totalIndexCount) {
      throw new VSTParseError(
        `Incoerenza nel patch ${patchIndex}: la somma delle lunghezze degli array (${sumLengths}) ` +
        `non corrisponde al totale dichiarato (${totalIndexCount})`,
        cur.offset
      );
    }

    const allIndices = new Uint32Array(totalIndexCount);
    for (let i = 0; i < totalIndexCount; i++) {
      allIndices[i] = cur.readU32();
    }

    const arrays = [];
    let cursorIdx = 0;
    for (let i = 0; i < numArrays; i++) {
      const len = arrayLengths[i];
      arrays.push(allIndices.subarray(cursorIdx, cursorIdx + len));
      cursorIdx += len;
    }

    return { patchType, textureIndex, arrays };
  }

  function readLod(cur, lodIndex) {
    const startOffset = cur.offset;
    const declaredSize = cur.readU32(`lod[${lodIndex}].size`);
    cur.skip(8); // riservato
    const vertexCount = cur.readU32(`lod[${lodIndex}].vertexCount`);
    const threshold = cur.readF32(`lod[${lodIndex}].threshold`);
    const patchesCount = cur.readU32(`lod[${lodIndex}].patchesCount`);
    const highestVertex = cur.readU32(`lod[${lodIndex}].highestVertex`);
    const boundingBox = readBoundingBox(cur);

    const patches = [];
    for (let p = 0; p < patchesCount; p++) {
      patches.push(readPatch(cur, p));
    }

    let triangleCount = 0;
    let pointCount = 0;
    for (const patch of patches) {
      for (const arr of patch.arrays) {
        if (patch.patchType === PATCH_TYPE_POINT_CLOUD) pointCount += arr.length;
        else triangleCount += Math.max(0, arr.length - 2);
      }
    }

    return {
      index: lodIndex, declaredSize, actualSize: cur.offset - startOffset,
      vertexCount, threshold, patchesCount, highestVertex, boundingBox,
      patches, triangleCount, pointCount,
    };
  }

  /**
   * Analizza un ArrayBuffer contenente un file .vst e restituisce una
   * struttura dati JS pronta per essere trasformata in geometria Babylon.js.
   */
  function parseVST(arrayBuffer) {
    const cur = new Cursor(arrayBuffer, true);

    const header = readHeader(cur);
    const boundingBox = readBoundingBox(cur);
    const textureRefs = readTextureRefs(cur, header.texturesCount);
    cur.readBytes(COORD_SYSTEM_SIZE, "CoordinateSystem");
    const { positions, uvs } = readVertexPool(cur, header.vertexCount);

    const lods = [];
    for (let i = 0; i < header.lodsCount; i++) {
      lods.push(readLod(cur, i));
    }

    return {
      header, boundingBox, textureRefs, positions, uvs, lods,
      fileSize: arrayBuffer.byteLength,
      bytesConsumed: cur.offset,
      trailingBytes: arrayBuffer.byteLength - cur.offset,
    };
  }

  /**
   * Converte una singola triangle strip (array di indici) nell'elenco di
   * triangoli "flat" (liste di 3 indici ciascuno) richiesto da Babylon.js,
   * applicando l'alternanza di verso standard delle triangle strip.
   */
  function stripToTriangleList(strip, out) {
    for (let i = 0; i + 2 < strip.length; i++) {
      if (i % 2 === 0) {
        out.push(strip[i], strip[i + 1], strip[i + 2]);
      } else {
        out.push(strip[i + 1], strip[i], strip[i + 2]);
      }
    }
  }

  /**
   * Costruisce, per un dato LOD, gli indici dei triangoli (tutte le
   * triangle-strip patch appiattite) e l'elenco separato di indici punto
   * (per le eventuali point-cloud patch).
   */
  function buildLodGeometry(lod) {
    const triangleIndices = [];
    const pointIndices = [];
    const texturesUsed = new Set();

    for (const patch of lod.patches) {
      texturesUsed.add(patch.textureIndex);
      if (patch.patchType === PATCH_TYPE_POINT_CLOUD) {
        for (const arr of patch.arrays) {
          for (let i = 0; i < arr.length; i++) pointIndices.push(arr[i]);
        }
      } else {
        for (const arr of patch.arrays) {
          stripToTriangleList(arr, triangleIndices);
        }
      }
    }

    return { triangleIndices, pointIndices, texturesUsed: Array.from(texturesUsed) };
  }

  global.VST = {
    parseVST,
    buildLodGeometry,
    VSTParseError,
    PATCH_TYPE_TRIANGLE_STRIPS,
    PATCH_TYPE_POINT_CLOUD,
  };

})(window);
