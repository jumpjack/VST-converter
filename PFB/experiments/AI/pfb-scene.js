/*
 * pfb-scene.js — assembla l'albero grezzo prodotto da pfb-parser.js in una
 * scena pronta per il rendering: percorre la gerarchia di nodi (Group/SCS/
 * DCS/LOD/Geode) accumulando le trasformazioni dei genitori, e per ogni
 * Geode costruisce la geometria dei suoi geoset (usando la corrispondenza
 * posizionale geoset[i] <-> vertexList[i]/colorList[i]/normalList[i]/
 * texcoordList[i], osservata empiricamente su file .pfb reali), applicando
 * la stessa conversione triangle-strip -> lista di triangoli già usata per
 * i file .vst. I triangoli vengono raggruppati per texture risolta tramite
 * geoset.geostateId -> geostate[TEXTURE=17] -> textures[i], così da produrre
 * poche mesh (una per texture) invece di centinaia di piccole mesh.
 */
(function (global) {
  "use strict";

  const NODE_TYPE = { GEODE: 2, GROUP: 5, SCS: 6, DCS: 7, LOD: 11 };

  function identityMatrix() {
    return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  }

  // Moltiplicazione riga-per-matrice (convenzione a vettore riga: v' = v * M),
  // coerente con l'euristica dedotta per analogia con Open Inventor/SGI e
  // con la convenzione nativa di Babylon.js. Anche la composizione
  // genitore/figlio segue lo stesso ordine: child * parent.
  function multiplyRowMajor(a, b) {
    const r = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) sum += a[i * 4 + k] * b[k * 4 + j];
        r[i * 4 + j] = sum;
      }
    }
    return r;
  }

  function transformPoint(m, x, y, z) {
    // vettore riga [x,y,z,1] moltiplicato per la matrice: v' = v * M
    return [
      x * m[0] + y * m[4] + z * m[8] + m[12],
      x * m[1] + y * m[5] + z * m[9] + m[13],
      x * m[2] + y * m[6] + z * m[10] + m[14],
    ];
  }

  function transformDirection(m, x, y, z) {
    // come sopra ma senza traslazione, per normali (assume assenza di scala non uniforme)
    return [
      x * m[0] + y * m[4] + z * m[8],
      x * m[1] + y * m[5] + z * m[9],
      x * m[2] + y * m[6] + z * m[10],
    ];
  }

  function stripToTriangles(strip, out) {
    for (let i = 0; i + 2 < strip.length; i++) {
      if (i % 2 === 0) out.push(strip[i], strip[i + 1], strip[i + 2]);
      else out.push(strip[i + 1], strip[i], strip[i + 2]);
    }
  }

  function resolveTexture(tree, geoset) {
    const gs = tree.geostates[geoset.geostateId];
    if (!gs) return -1;
    const texIdx = gs[17]; // chiave GeoState "TEXTURE"
    return (texIdx === undefined || texIdx < 0 || texIdx >= tree.textures.length) ? -1 : texIdx;
  }

  /**
   * Costruisce la lista di indici locali (già espansi da strip a triangoli)
   * per un geoset, usando la sua lengthList per spezzare correttamente la
   * lista piatta di vertici/normali/texcoord in singole strip.
   */
  function geosetLocalIndices(tree, geosetIndex) {
    const g = tree.geosets[geosetIndex];
    const lengths = tree.lengthLists[g.lengthListId];
    const triIndices = [];
    if (!lengths) return triIndices;
    let cursor = 0;
    for (let s = 0; s < lengths.count; s++) {
      const len = lengths.data[s];
      const strip = [];
      for (let k = 0; k < len; k++) strip.push(cursor + k);
      stripToTriangles(strip, triIndices);
      cursor += len;
    }
    return triIndices;
  }

  /**
   * Percorre la gerarchia dei nodi a partire da rootIndex, applicando le
   * trasformazioni SCS/DCS incontrate, e restituisce un array di "istanze
   * geoset": { geosetIndex, worldMatrix }.
   *
   * Nodo pfLOD: la documentazione ufficiale OpenGL Performer (Programmer's
   * Guide, cap. 3, "pfLOD Nodes") è esplicita: "A level-of-detail node
   * specifies how its children are to be displayed, BASED ON THE VISUAL
   * RANGE from the viewpoint" — i figli di un LOD sono rappresentazioni
   * ALTERNATIVE (stesso contenuto, dettaglio diverso), selezionate una alla
   * volta in base alla distanza, MAI unite fra loro. lodDepth sceglie quale
   * figlio prendere ad ogni nodo LOD incontrato (0 = massimo dettaglio,
   * valori più alti = dettaglio via via più basso; il valore viene sempre
   * limitato al numero di figli realmente disponibili in quel nodo).
   *
   * Instancing: OpenGL Performer supporta "shared instancing" (lo stesso
   * nodo può comparire come figlio di più genitori, cap. 3 "Instancing").
   * Per questo NON si scarta un nodo già visitato: si limita solo la
   * profondità di ricorsione, come protezione contro dati malformati.
   */
  function collectGeosetInstances(tree, rootIndex, lodDepth) {
    const instances = [];
    const MAX_DEPTH = 500;
    function visit(nodeIndex, parentMatrix, depth) {
      if (depth > MAX_DEPTH) return; // protezione contro dati malformati/ciclici
      const node = tree.nodes[nodeIndex];
      if (!node) return;
      let matrix = parentMatrix;
      if ((node.type === NODE_TYPE.SCS || node.type === NODE_TYPE.DCS) && node.matrix) {
        matrix = multiplyRowMajor(node.matrix, parentMatrix);
      }
      if (node.type === NODE_TYPE.GEODE) {
        for (const gi of node.geosets) instances.push({ geosetIndex: gi, worldMatrix: matrix });
      }
      if (node.type === NODE_TYPE.LOD && node.children.length > 0) {
        const idx = Math.max(0, Math.min(lodDepth, node.children.length - 1));
        visit(node.children[idx], matrix, depth + 1);
      } else {
        for (const childIndex of node.children) visit(childIndex, matrix, depth + 1);
      }
    }
    visit(rootIndex, identityMatrix(), 0);
    return instances;
  }

  function findRootNodes(tree) {
    const referenced = new Set();
    for (const n of tree.nodes) for (const c of n.children) referenced.add(c);
    return tree.nodes.map((n, i) => i).filter(i => !referenced.has(i));
  }

  /** Conta quanti livelli LOD distinti esistono nel file (il massimo numero
   *  di figli fra tutti i nodi LOD), utile per limitare la UI di scelta. */
  function maxLodChildren(tree) {
    let max = 1;
    for (const n of tree.nodes) if (n.type === NODE_TYPE.LOD) max = Math.max(max, n.children.length);
    return max;
  }

  /**
   * Assembla l'intera scena in un array di gruppi, uno per texture risolta
   * (o "senza texture" per i geoset che non ne referenziano una), ciascuno
   * con positions/normals/uvs/indices pronti per una VertexData Babylon.
   * lodDepth (default 0 = massimo dettaglio) sceglie quale figlio prendere
   * ad ogni nodo LOD incontrato nella gerarchia.
   */
  function assembleScene(tree, lodDepth) {
    lodDepth = lodDepth || 0;
    const roots = findRootNodes(tree);
    let instances = [];
    for (const r of roots) instances = instances.concat(collectGeosetInstances(tree, r, lodDepth));

    const groups = new Map(); // textureIndex(-1 se nessuna) -> { positions:[], normals:[], uvs:[], indices:[] }
    function getGroup(texIdx) {
      if (!groups.has(texIdx)) groups.set(texIdx, { positions: [], normals: [], uvs: [], indices: [], textureIndex: texIdx });
      return groups.get(texIdx);
    }

    let totalTriangles = 0;
    for (const inst of instances) {
      const g = tree.geosets[inst.geosetIndex];
      const vList = tree.vertexLists[inst.geosetIndex];
      const nList = tree.normalLists[inst.geosetIndex];
      const tList = tree.texcoordLists[inst.geosetIndex];
      if (!vList) continue;
      const texIdx = resolveTexture(tree, g);
      const group = getGroup(texIdx);
      const baseVertex = group.positions.length / 3;

      for (let i = 0; i < vList.count; i++) {
        const [x, y, z] = transformPoint(inst.worldMatrix, vList.data[i*3], vList.data[i*3+1], vList.data[i*3+2]);
        group.positions.push(x, y, z);
        if (nList && i < nList.count) {
          const [nx, ny, nz] = transformDirection(inst.worldMatrix, nList.data[i*3], nList.data[i*3+1], nList.data[i*3+2]);
          group.normals.push(nx, ny, nz);
        } else {
          group.normals.push(0, 0, 0); // verranno ricalcolate se mancanti
        }
        if (tList && i < tList.count) group.uvs.push(tList.data[i*2], tList.data[i*2+1]);
        else group.uvs.push(0, 0);
      }

      const localTris = geosetLocalIndices(tree, inst.geosetIndex);
      for (const li of localTris) group.indices.push(baseVertex + li);
      totalTriangles += localTris.length / 3;
    }

    return {
      groups: Array.from(groups.values()),
      instanceCount: instances.length,
      totalTriangles,
    };
  }

  global.PFBScene = { assembleScene, multiplyRowMajor, transformPoint, identityMatrix, maxLodChildren };
})(typeof window !== 'undefined' ? window : globalThis);
