/* https://pds-imaging.jpl.nasa.gov/tools/atlas/record?uri=atlas:pds3:mer:spirit:/mer2mw_0xxx/data/pancam/site0137/2p296730712xylb1dqp2288l2m1.rgb
 * app.js — collante tra il parser vst-parser.js e una scena Babylon.js.
 */
(function () {
  "use strict";

  const els = {
    vstFile: document.getElementById("vstFile"),
    texFile: document.getElementById("texFile"),
    texFileField: document.getElementById("texFileField"),
    status: document.getElementById("status"),
    headerCard: document.getElementById("headerCard"),
    headerInfo: document.getElementById("headerInfo"),
    texRefsSummary: document.getElementById("texRefsSummary"),
    texRefsInfo: document.getElementById("texRefsInfo"),
    lodCard: document.getElementById("lodCard"),
    lodSelect: document.getElementById("lodSelect"),
    lodTableBody: document.querySelector("#lodTable tbody"),
    renderCard: document.getElementById("renderCard"),
    wireframeToggle: document.getElementById("wireframeToggle"),
    cullingToggle: document.getElementById("cullingToggle"),
    normalsToggle: document.getElementById("normalsToggle"),
    textureToggle: document.getElementById("textureToggle"),
    pointSize: document.getElementById("pointSize"),
    bgColor: document.getElementById("bgColor"),
    resetCameraBtn: document.getElementById("resetCameraBtn"),
    exportObjBtn: document.getElementById("exportObjBtn"),
    exportObjField: document.getElementById("exportObjField"),
    axesCard: document.getElementById("axesCard"),
    axisMapX: document.getElementById("axisMapX"),
    axisMapY: document.getElementById("axisMapY"),
    axisMapZ: document.getElementById("axisMapZ"),
    axisGizmoCanvas: document.getElementById("axisGizmoCanvas"),
    canvas: document.getElementById("renderCanvas"),
    emptyHint: document.getElementById("emptyHint"),
    viewportHint: document.getElementById("viewportHint"),
    vstInfoCard: document.getElementById("vstInfoCard"),
    pfbLodCard: document.getElementById("pfbLodCard"),
    pfbLodDepth: document.getElementById("pfbLodDepth"),
    pfbGeosetTotal: document.getElementById("pfbGeosetTotal"),
    pfbGeosetUsed: document.getElementById("pfbGeosetUsed"),
    pfbTriCount: document.getElementById("pfbTriCount"),
    pfbTexturesCard: document.getElementById("pfbTexturesCard"),
    pfbTexturesList: document.getElementById("pfbTexturesList"),
    pfbExportCard: document.getElementById("pfbExportCard"),
    exportPfbZipBtn: document.getElementById("exportPfbZipBtn"),
    pfbInfoCard: document.getElementById("pfbInfoCard"),
    pfbModelsCard: document.getElementById("pfbModelsCard"),
    pfbModelsBody: document.getElementById("pfbModelsBody"),
    loadChoiceField: document.getElementById("loadChoiceField"),
    loadChoiceFileName: document.getElementById("loadChoiceFileName"),
    loadChoiceReplaceBtn: document.getElementById("loadChoiceReplaceBtn"),
    loadChoiceAddBtn: document.getElementById("loadChoiceAddBtn"),
    pfbAxesCard: document.getElementById("pfbAxesCard"),
    axisMapPfbX: document.getElementById("axisMapPfbX"),
    axisMapPfbY: document.getElementById("axisMapPfbY"),
    axisMapPfbZ: document.getElementById("axisMapPfbZ"),
    pfbGeomAxesCard: document.getElementById("pfbGeomAxesCard"),
    axisMapPfbGeomX: document.getElementById("axisMapPfbGeomX"),
    axisMapPfbGeomY: document.getElementById("axisMapPfbGeomY"),
    axisMapPfbGeomZ: document.getElementById("axisMapPfbGeomZ"),
    pfbGeomAxisZWarning: document.getElementById("pfbGeomAxisZWarning"),
    pfbRotationY: document.getElementById("pfbRotationY"),
    pfbRotationYValue: document.getElementById("pfbRotationYValue"),
    pfbMirrorX: document.getElementById("pfbMirrorX"),
    pfbMirrorY: document.getElementById("pfbMirrorY"),
    pfbMirrorZ: document.getElementById("pfbMirrorZ"),
    pfbCenterViewBtn: document.getElementById("pfbCenterViewBtn"),
    groundVisibleToggle: document.getElementById("groundVisibleToggle"),
    groundSiteSelect: document.getElementById("groundSiteSelect"),
    groundDriveSelect: document.getElementById("groundDriveSelect"),
    groundZSlider: document.getElementById("groundZSlider"),
    groundZValue: document.getElementById("groundZValue"),
    groundCoordsHint: document.getElementById("groundCoordsHint"),
    pfbOffsetCard: document.getElementById("pfbOffsetCard"),
    pfbOffsetX: document.getElementById("pfbOffsetX"),
    pfbOffsetY: document.getElementById("pfbOffsetY"),
    pfbOffsetZ: document.getElementById("pfbOffsetZ"),
    pfbOffsetXValue: document.getElementById("pfbOffsetXValue"),
    pfbOffsetYValue: document.getElementById("pfbOffsetYValue"),
    pfbOffsetZValue: document.getElementById("pfbOffsetZValue"),
    pfbOffsetResetBtn: document.getElementById("pfbOffsetResetBtn"),
    pfbIgnoreElevationToggle: document.getElementById("pfbIgnoreElevationToggle"),
    pfbAxisZWarning: document.getElementById("pfbAxisZWarning"),
    startSite: document.getElementById("startSite"),
    endSite: document.getElementById("endSite"),
    btnPlot: document.getElementById("btnPlot"),
    btnTable: document.getElementById("btnTable"),
    chkFullFrame: document.getElementById("chkFullFrame"),
    chkShowDriveMarkers: document.getElementById("chkShowDriveMarkers"),
    traverseStatus: document.getElementById("traverseStatus"),
    dataTableContainer: document.getElementById("dataTableContainer"),
    spnLinks: document.getElementById("spnLinks"),
    spnLinksIMGBody: document.querySelector("#spnLinksIMG tbody"),
    groundTextureWarning: document.getElementById("groundTextureWarning"),
    groundTextureFile: document.getElementById("groundTextureFile"),
    groundTextureVisibleToggle: document.getElementById("groundTextureVisibleToggle"),
    groundTexturePosX: document.getElementById("groundTexturePosX"),
    groundTexturePosZ: document.getElementById("groundTexturePosZ"),
    groundTextureSizeX: document.getElementById("groundTextureSizeX"),
    groundTextureSizeZ: document.getElementById("groundTextureSizeZ"),
    groundTextureRotation: document.getElementById("groundTextureRotation"),
    groundTexturePosXValue: document.getElementById("groundTexturePosXValue"),
    groundTexturePosZValue: document.getElementById("groundTexturePosZValue"),
    groundTextureSizeXValue: document.getElementById("groundTextureSizeXValue"),
    groundTextureSizeZValue: document.getElementById("groundTextureSizeZValue"),
    groundTextureRotationValue: document.getElementById("groundTextureRotationValue"),
    groundTextureExportBtn: document.getElementById("groundTextureExportBtn"),
  };

  let currentFormat = null;
  let vstData = null;
  let cachedTexture = null;
  let showTexture = true;
  let currentLodIndex = -1;
  let surfaceMesh = null;
  let pointsMesh = null;
  let currentAxisLength = 1;
  let modelEntries = [];
  let nextModelId = 1;
  let selectedEntryId = null;
  let pendingFile = null;
  let ignoreElevationForRoverPlacement = false;

  const GROUND_TEXTURE_CONFIG = {
    fileName: "ground-texture.jpg",
    posX: 2969,
    posZ: -2063,
    sizeX: 210,
    sizeZ: 210,
    rotationDeg: 0,
  };

  const axisMapping = { x: { target: "x", sign: 1 }, y: { target: "z", sign: 1 }, z: { target: "y", sign: 1 } };
  let transformMatrix = [[1, 0, 0], [0, 0, 0], [0, 0, 0]];
  let transformedPositions = null;
  let transformDirty = true;

//////////////////
  
  
  
// script esterno texture


  
//////////////////

  function setStatus(message, kind) { els.status.textContent = message; els.status.className = "status" + (kind ? " " + kind : ""); }
  function fmtInt(n) { return new Intl.NumberFormat("it-IT").format(n); }
  function fmtFloat(n, digits) { return Number(n).toFixed(digits === undefined ? 3 : digits); }

  function rebuildTransformMatrix() {
    const idx = { x: 0, y: 1, z: 2 };
    const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (const src of ["x", "y", "z"]) { const { target, sign } = axisMapping[src]; M[idx[target]][idx[src]] = sign; }
    transformMatrix = M;
  }
  rebuildTransformMatrix();
  function applyAxisTransform(x, y, z) { const M = transformMatrix; return [M[0][0] * x + M[0][1] * y + M[0][2] * z, M[1][0] * x + M[1][1] * y + M[1][2] * z, M[2][0] * x + M[2][1] * y + M[2][2] * z]; }
  function matrixDeterminant(M) { return M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]); }
  function buildTransformedPositions(rawPositions) { const n = rawPositions.length / 3; const out = new Float32Array(rawPositions.length); for (let i = 0; i < n; i++) { const [bx, by, bz] = applyAxisTransform(rawPositions[i * 3], rawPositions[i * 3 + 1], rawPositions[i * 3 + 2]); out[i * 3] = bx; out[i * 3 + 1] = by; out[i * 3 + 2] = bz; } return out; }
  function getTransformedPositions() { if (transformDirty || !transformedPositions) { transformedPositions = buildTransformedPositions(vstData.positions); transformDirty = false; } return transformedPositions; }

  // Mappatura "posizione": trasforma SOLO totalOffset (site/drive) per
  // collocare il modello, i dischetti e il piano di ground di riferimento.
  const pfbAxisMapping = { x: { target: "x", sign: 1 }, y: { target: "z", sign: 1 }, z: { target: "y", sign: 1 } };
  let pfbTransformMatrix = [[1, 0, 0], [0, 0, 0], [0, 0, 0]];
  function rebuildPfbTransformMatrix() { const idx = { x: 0, y: 1, z: 2 }; const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (const src of ["x", "y", "z"]) { const { target, sign } = pfbAxisMapping[src]; M[idx[target]][idx[src]] = sign; } pfbTransformMatrix = M; }
  rebuildPfbTransformMatrix();
  function applyPfbAxisTransform(x, y, z) { const M = pfbTransformMatrix; return [M[0][0] * x + M[0][1] * y + M[0][2] * z, M[1][0] * x + M[1][1] * y + M[1][2] * z, M[2][0] * x + M[2][1] * y + M[2][2] * z]; }

  // Mappatura "vertici": trasforma SOLO la geometria del file .pfb (i suoi
  // vertici, il winding delle facce e le frecce colorate X/Y/Z), del tutto
  // indipendente da quella di posizione qui sopra — la convenzione con cui
  // è orientato il file al proprio interno non è detto coincida con quella
  // del sistema di riferimento site/drive di drives.js.
  const pfbGeometryAxisMapping = { x: { target: "x", sign: 1 }, y: { target: "z", sign: 1 }, z: { target: "y", sign: 1 } };
  let pfbGeometryTransformMatrix = [[1, 0, 0], [0, 0, 0], [0, 0, 0]];
  function rebuildPfbGeometryTransformMatrix() { const idx = { x: 0, y: 1, z: 2 }; const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (const src of ["x", "y", "z"]) { const { target, sign } = pfbGeometryAxisMapping[src]; M[idx[target]][idx[src]] = sign; } pfbGeometryTransformMatrix = M; }
  rebuildPfbGeometryTransformMatrix();
  function applyPfbGeometryAxisTransform(x, y, z) { const M = pfbGeometryTransformMatrix; return [M[0][0] * x + M[0][1] * y + M[0][2] * z, M[1][0] * x + M[1][1] * y + M[1][2] * z, M[2][0] * x + M[2][1] * y + M[2][2] * z]; }

  /** Matrice di trasformazione "vertici" effettiva per UNA specifica entry:
   *  mappatura globale (.pfb) combinata con la specchiatura X/Y/Z propria di
   *  quel singolo file (entry.mirror, ±1 per asse). Specchiare un solo asse
   *  inverte il determinante (winding delle facce da correggere); specchiare
   *  due assi torna un orientamento normale (i due flip si annullano). */
  function entryGeometryMatrix(entry) {
    const m = entry.mirror || { x: 1, y: 1, z: 1 }; const G = pfbGeometryTransformMatrix;
    return [
      [G[0][0] * m.x, G[0][1] * m.y, G[0][2] * m.z],
      [G[1][0] * m.x, G[1][1] * m.y, G[1][2] * m.z],
      [G[2][0] * m.x, G[2][1] * m.y, G[2][2] * m.z],
    ];
  }
  function applyMatrix3(M, x, y, z) { return [M[0][0] * x + M[0][1] * y + M[0][2] * z, M[1][0] * x + M[1][1] * y + M[1][2] * z, M[2][0] * x + M[2][1] * y + M[2][2] * z]; }

  function windingCorrected(triangleIndices, matrix) { if (matrixDeterminant(matrix) > 0) return triangleIndices; const out = new Array(triangleIndices.length); for (let i = 0; i + 2 < triangleIndices.length; i += 3) { out[i] = triangleIndices[i]; out[i + 1] = triangleIndices[i + 2]; out[i + 2] = triangleIndices[i + 1]; } return out; }
  function transformBoundingBoxWithOrigin(bbox) { const xs = [bbox.xmin, bbox.xmax], ys = [bbox.ymin, bbox.ymax], zs = [bbox.zmin, bbox.zmax]; let min = [0, 0, 0], max = [0, 0, 0]; let first = true; for (const x of xs) for (const y of ys) for (const z of zs) { const p = applyAxisTransform(x, y, z); if (first) { min = p.slice(); max = p.slice(); first = false; } else { for (let k = 0; k < 3; k++) { if (p[k] < min[k]) min[k] = p[k]; if (p[k] > max[k]) max[k] = p[k]; } } } for (let k = 0; k < 3; k++) { if (0 < min[k]) min[k] = 0; if (0 > max[k]) max[k] = 0; } return { min: new BABYLON.Vector3(min[0], min[1], min[2]), max: new BABYLON.Vector3(max[0], max[1], max[2]) }; }

  // ---------------- Babylon base
  const engine = new BABYLON.Engine(els.canvas, true, { preserveDrawingBuffer: true, stencil: true });
  const scene = new BABYLON.Scene(engine);
  scene.useRightHandedSystem = true;

  { const c0 = BABYLON.Color3.FromHexString(els.bgColor.value); scene.clearColor = new BABYLON.Color4(c0.r, c0.g, c0.b, 1); }
  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2.4, Math.PI / 2.6, 5, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(els.canvas, true);
  camera.lowerRadiusLimit = 0.1;
  camera.wheelDeltaPercentage = 0.01;
  camera.pinchDeltaPercentage = 0.01;
  camera.panningSensibility = 120;
  camera.minZ = -10000;
  camera.maxZ = 10000;
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  function updateOrthoCameraBounds() { const aspect = engine.getRenderWidth() / engine.getRenderHeight(); const halfHeight = camera.radius; camera.orthoTop = halfHeight; camera.orthoBottom = -halfHeight; camera.orthoLeft = -halfHeight * aspect; camera.orthoRight = halfHeight * aspect; }
  scene.onBeforeRenderObservable.add(updateOrthoCameraBounds);
  const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0.2, 1, 0.1), scene); ambientLight.intensity = 0.75;
  const sunLight = new BABYLON.DirectionalLight("sunLight", new BABYLON.Vector3(-0.5, -1, -0.35), scene); sunLight.position = new BABYLON.Vector3(20, 40, 14); sunLight.intensity = 1.0;
  const shadowGenerator = new BABYLON.ShadowGenerator(2048, sunLight); shadowGenerator.useBlurExponentialShadowMap = true; shadowGenerator.blurKernel = 16; shadowGenerator.setDarkness(0.2); shadowGenerator.bias = 0.0015; shadowGenerator.normalBias = 0.02;

  function orientTowards(mesh, dir) { const d = dir.normalizeToNew(); const up = BABYLON.Vector3.Up(); const dot = BABYLON.Vector3.Dot(up, d); if (dot > 0.9999) { mesh.rotationQuaternion = BABYLON.Quaternion.Identity(); return; } if (dot < -0.9999) { mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI); return; } const axis = BABYLON.Vector3.Cross(up, d).normalize(); const angle = Math.acos(dot); mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(axis, angle); }
  const AXIS_SPECS = [{ raw: [1, 0, 0], color: new BABYLON.Color3(0.851, 0.161, 0.102) }, { raw: [0, 1, 0], color: new BABYLON.Color3(0.122, 0.612, 0.180) }, { raw: [0, 0, 1], color: new BABYLON.Color3(0.129, 0.349, 0.851) }];
  let axesMeshes = []; function buildAxes(length) { for (const m of axesMeshes) m.dispose(); axesMeshes = []; for (const spec of AXIS_SPECS) { const [tx, ty, tz] = applyAxisTransform(spec.raw[0], spec.raw[1], spec.raw[2]); const tip = new BABYLON.Vector3(tx * length, ty * length, tz * length); const mat = new BABYLON.StandardMaterial("axisMat", scene); mat.emissiveColor = spec.color; mat.disableLighting = true; const shaft = BABYLON.MeshBuilder.CreateCylinder("axis", { diameterTop: 0.1, diameterBottom: 0.1, height: length * 0.86, tessellation: 8 }, scene); shaft.position = tip.scale(0.43); orientTowards(shaft, tip); shaft.isPickable = false; shaft.material = mat; const arrow = BABYLON.MeshBuilder.CreateCylinder("axisArrow", { diameterTop: 0, diameterBottom: length * 0.045, height: length * 0.14, tessellation: 10 }, scene); arrow.position = tip.scale(0.93); orientTowards(arrow, tip); arrow.isPickable = false; arrow.material = mat; axesMeshes.push(shaft, arrow); } } buildAxes(1);

  // ------------------------------------------------- PIANO GROUND + PIANO TEXTURE SEPARATI
  const GROUND_SIZE = 4000;
  const groundMat = new BABYLON.StandardMaterial("groundPlaneMat", scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.55, 0.55, 0.5);
  groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
  groundMat.alpha = 0.25;
  groundMat.backFaceCulling = false;
  const groundPlane = BABYLON.MeshBuilder.CreateGround("groundPlane", { width: GROUND_SIZE, height: GROUND_SIZE, subdivisions: 1 }, scene);
  groundPlane.material = groundMat;
  groundPlane.receiveShadows = true;

  const groundTextureMat = new BABYLON.StandardMaterial("groundTextureMat", scene);
  groundTextureMat.specularColor = new BABYLON.Color3(0.06, 0.06, 0.06);
  groundTextureMat.specularPower = 64;
  groundTextureMat.backFaceCulling = false;

  function makeCheckerTexture(sceneRef) {
    const size = 512; const dt = new BABYLON.DynamicTexture("checkerTexture", { width: size, height: size }, sceneRef, true);
    const ctx = dt.getContext(); const cells = 8; const cs = size / cells;
    for (let y = 0; y < cells; y++) { for (let x = 0; x < cells; x++) { ctx.fillStyle = ((x + y) % 2 === 0) ? "#3a404d" : "#2b303a"; ctx.fillRect(x * cs, y * cs, cs, cs); } }
    dt.update(); dt.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE; dt.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE; return dt;
  }
  const defaultTexture = makeCheckerTexture(scene);
  groundTextureMat.diffuseTexture = defaultTexture;

  const groundTexturePlane = BABYLON.MeshBuilder.CreateGround("groundTexturePlane", { width: 1, height: 1, subdivisions: 1 }, scene);
  groundTexturePlane.material = groundTextureMat;
  groundTexturePlane.position.y = 0.1; // sempre appena sopra il ground, mai sotto il terreno
  groundTexturePlane.isPickable = false;
  groundTexturePlane.receiveShadows = true;

  // ------------------------------------------------- MENU CONTESTUALE (TASTO DESTRO)
  const contextMenu = document.createElement("div");
  contextMenu.id = "vstContextMenu";
  contextMenu.style.cssText = `
    position: absolute;
    display: none;
    background: #2b303a;
    color: #e0e0e0;
    border: 1px solid #4a5060;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.6);
    z-index: 10000;
    min-width: 120px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    overflow: hidden;
  `;
  
  const menuItemCenter = document.createElement("div");
  menuItemCenter.textContent = "Centra";
  menuItemCenter.style.cssText = `padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #4a5060; transition: background 0.1s;`;
  menuItemCenter.addEventListener("mouseenter", () => { menuItemCenter.style.background = "#3a404d"; });
  menuItemCenter.addEventListener("mouseleave", () => { menuItemCenter.style.background = "transparent"; });
  
  const menuItemMove = document.createElement("div");
  menuItemMove.textContent = "Sposta";
  menuItemMove.style.cssText = `padding: 8px 12px; cursor: pointer; transition: background 0.1s;`;
  menuItemMove.addEventListener("mouseenter", () => { menuItemMove.style.background = "#3a404d"; });
  menuItemMove.addEventListener("mouseleave", () => { menuItemMove.style.background = "transparent"; });

  contextMenu.appendChild(menuItemCenter);
  contextMenu.appendChild(menuItemMove);
  document.body.appendChild(contextMenu);

  let currentPickedPoint = null;

  els.canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const rect = els.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const pickResult = scene.pick(x, y, (mesh) => {
      // Escludiamo elementi UI o di riferimento dal picking del menu contestuale
      if (mesh === groundPlane || mesh === groundTexturePlane) return false;
      if (mesh.name.startsWith("cornerMarker") || mesh.name.startsWith("driveMarker")) return false;
      if (mesh.name.startsWith("axis") || mesh.name.startsWith("gizmo") || mesh.name.startsWith("pfbAxis")) return false;
      return true; // Accetta le mesh del modello (VST o PFB)
    });

    if (pickResult.hit && pickResult.pickedPoint) {
      currentPickedPoint = pickResult.pickedPoint.clone();
      contextMenu.style.left = `${e.clientX}px`;
      contextMenu.style.top = `${e.clientY}px`;
      contextMenu.style.display = "block";
    } else {
      contextMenu.style.display = "none";
    }
  });

  document.addEventListener("click", (e) => {
    if (!contextMenu.contains(e.target)) {
      contextMenu.style.display = "none";
    }
  });

  menuItemCenter.addEventListener("click", () => {
    if (currentPickedPoint) {
      camera.target = currentPickedPoint;
      contextMenu.style.display = "none";
    }
  });

  menuItemMove.addEventListener("click", () => {
    if (currentPickedPoint) {
      // Sposta la camera mantenendo lo stesso offset relativo, ma centrando il punto cliccato
      const offset = camera.position.subtract(camera.target);
      camera.target = currentPickedPoint.clone();
      camera.position = currentPickedPoint.add(offset);
      contextMenu.style.display = "none";
    }
  });
  // ------------------------------------------------- FINE MENU CONTESTUALE

  // STATO FIX ASPECT
  let currentGroundAspect = 1;
  let currentGroundObjectUrl = null;
  function setGroundTextureWarning(visible) { els.groundTextureWarning.style.display = visible ? "" : "none"; }

  function applyTextureAspectFix() {
    const tex = groundTextureMat.diffuseTexture;
    if (!tex || !currentGroundAspect) return;
    const sizeX = Number(els.groundTextureSizeX.value) || 1;
    const sizeZ = Number(els.groundTextureSizeZ.value) || 1;
    if (sizeX <= 0 || sizeZ <= 0) return;
    const planeAspect = sizeX / sizeZ;
    const imageAspect = currentGroundAspect;

    tex.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    tex.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
    tex.hasAlpha = true;

    if (imageAspect > planeAspect) {
      tex.uScale = 1;
      tex.vScale = imageAspect / planeAspect;
      tex.uOffset = 0;
      tex.vOffset = (1 - tex.vScale) / 2;
    } else {
      tex.vScale = 1;
      tex.uScale = planeAspect / imageAspect;
      tex.vOffset = 0;
      tex.uOffset = (1 - tex.uScale) / 2;
    }
  }

  function applyGroundTextureImage(texture) {
    if (groundTextureMat.diffuseTexture && groundTextureMat.diffuseTexture !== defaultTexture && groundTextureMat.diffuseTexture !== texture) {
      groundTextureMat.diffuseTexture.dispose();
    }
    groundTextureMat.diffuseTexture = texture;
    const size = texture.getSize();
    if (size && size.width && size.height) currentGroundAspect = size.width / size.height;
    applyTextureAspectFix();
    groundTexturePlane.setEnabled(els.groundTextureVisibleToggle.checked);
    setGroundTextureWarning(false);
  }

  function tryLoadDefaultGroundTexture() {
    if (!GROUND_TEXTURE_CONFIG.fileName) return;
    new BABYLON.Texture("./" + GROUND_TEXTURE_CONFIG.fileName, scene, false, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
      (tex) => applyGroundTextureImage(tex),
      () => setGroundTextureWarning(true)
    );
  }

  function applyGroundTextureTransform() {
    const posX = Number(els.groundTexturePosX.value);
    const posZ = Number(els.groundTexturePosZ.value);
    const sizeX = Number(els.groundTextureSizeX.value);
    const sizeZ = Number(els.groundTextureSizeZ.value);
    const rotationDeg = Number(els.groundTextureRotation.value);
    groundTexturePlane.position.x = posX;
    groundTexturePlane.position.z = posZ;
    // Y resta fissa a 0.1
    groundTexturePlane.scaling.x = Math.max(1, sizeX);
    groundTexturePlane.scaling.z = Math.max(1, sizeZ);
    groundTexturePlane.rotation.y = BABYLON.Tools.ToRadians(rotationDeg);
    els.groundTexturePosXValue.textContent = fmtFloat(posX, 0);
    els.groundTexturePosZValue.textContent = fmtFloat(posZ, 0);
    els.groundTextureSizeXValue.textContent = fmtFloat(sizeX, 0);
    els.groundTextureSizeZValue.textContent = fmtFloat(sizeZ, 0);
    els.groundTextureRotationValue.textContent = fmtFloat(rotationDeg, 1);
    applyTextureAspectFix();
  }

  els.groundTexturePosX.value = String(GROUND_TEXTURE_CONFIG.posX);
  els.groundTexturePosZ.value = String(GROUND_TEXTURE_CONFIG.posZ);
  els.groundTextureSizeX.value = String(GROUND_TEXTURE_CONFIG.sizeX);
  els.groundTextureSizeZ.value = String(GROUND_TEXTURE_CONFIG.sizeZ);
  els.groundTextureRotation.value = String(GROUND_TEXTURE_CONFIG.rotationDeg);
  applyGroundTextureTransform();
  tryLoadDefaultGroundTexture();

  for (const el of [els.groundTexturePosX, els.groundTexturePosZ, els.groundTextureSizeX, els.groundTextureSizeZ, els.groundTextureRotation]) {
    el.addEventListener("input", applyGroundTextureTransform);
  }

  function getDrivesTable() { return (typeof drives !== "undefined") ? drives : null; }
  const groundDriveBase = { x: 0, y: 0, z: 0 };
  function applyGroundPosition() {
    const zOffset = Number(els.groundZSlider.value);
    groundPlane.position.x = groundDriveBase.x;
    groundPlane.position.z = groundDriveBase.z;
    groundPlane.position.y = groundDriveBase.y + zOffset;
    // la texture resta indipendente, non la tocchiamo qui
    els.groundZValue.textContent = fmtFloat(zOffset, 1);
  }
  function updateGroundPositionFromDrive() {
    const table = getDrivesTable(); const site = els.groundSiteSelect.value; const drive = els.groundDriveSelect.value;
    const rec = table && site !== "" && drive !== "" && table[site] ? table[site][drive] : null;
    if (rec && rec.totalOffset) { const [bx, by, bz] = applyPfbAxisTransform(rec.totalOffset.x, rec.totalOffset.y, rec.totalOffset.z); groundDriveBase.x = bx; groundDriveBase.y = by; groundDriveBase.z = bz; }
    else { groundDriveBase.x = 0; groundDriveBase.y = 0; groundDriveBase.z = 0; }
    applyGroundPosition();
  }
  function populateGroundDriveOptions() { const table = getDrivesTable(); const site = els.groundSiteSelect.value; els.groundDriveSelect.innerHTML = ""; if (!table || !table[site]) return; for (const d of Object.keys(table[site]).sort((a, b) => Number(a) - Number(b))) { const opt = document.createElement("option"); opt.value = d; opt.textContent = d; els.groundDriveSelect.appendChild(opt); } }
  function populateGroundSiteOptions() { const table = getDrivesTable(); els.groundSiteSelect.innerHTML = ""; if (!table) return; for (const s of Object.keys(table).sort((a, b) => Number(a) - Number(b))) { const opt = document.createElement("option"); opt.value = s; opt.textContent = s; els.groundSiteSelect.appendChild(opt); } populateGroundDriveOptions(); }
  populateGroundSiteOptions(); updateGroundPositionFromDrive();
  els.groundSiteSelect.addEventListener("change", () => { populateGroundDriveOptions(); updateGroundPositionFromDrive(); });
  els.groundDriveSelect.addEventListener("change", updateGroundPositionFromDrive);
  els.groundZSlider.addEventListener("input", applyGroundPosition);
  els.groundVisibleToggle.addEventListener("change", () => { groundPlane.setEnabled(els.groundVisibleToggle.checked); });
  els.groundTextureVisibleToggle.addEventListener("change", () => { groundTexturePlane.setEnabled(els.groundTextureVisibleToggle.checked && !!groundTextureMat.diffuseTexture); });

  function applyTextureFile(file) {
    if (!file) return;
    if (!file.type || file.type.indexOf("image/") !== 0) { setStatus("Il file selezionato non è un'immagine valida.", "error"); return; }
    setStatus("Caricamento in corso…", "idle");
    if (currentGroundObjectUrl) URL.revokeObjectURL(currentGroundObjectUrl);
    const objectUrl = URL.createObjectURL(file);
    currentGroundObjectUrl = objectUrl;
    const texture = new BABYLON.Texture(objectUrl, scene, false, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
      function onLoaded() {
        const size = texture.getSize();
        if (size && size.width && size.height) currentGroundAspect = size.width / size.height;
        if (groundTextureMat.diffuseTexture && groundTextureMat.diffuseTexture !== defaultTexture) groundTextureMat.diffuseTexture.dispose();
        groundTextureMat.diffuseTexture = texture;
        applyTextureAspectFix();
        groundTexturePlane.setEnabled(els.groundTextureVisibleToggle.checked);
        setStatus("Texture applicata: " + file.name + " (" + size.width + "×" + size.height + "px) aspect " + currentGroundAspect.toFixed(3), "idle");
      },
      function onError() { URL.revokeObjectURL(objectUrl); texture.dispose(); setStatus("Errore: impossibile decodificare l'immagine.", "error"); }
    );
  }
  els.groundTextureFile.addEventListener("change", () => { const file = els.groundTextureFile.files && els.groundTextureFile.files[0]; if (!file) return; applyTextureFile(file); });
  els.groundTextureExportBtn.addEventListener("click", () => {
    const cfg = { fileName: GROUND_TEXTURE_CONFIG.fileName, posX: Number(els.groundTexturePosX.value), posZ: Number(els.groundTexturePosZ.value), sizeX: Number(els.groundTextureSizeX.value), sizeZ: Number(els.groundTextureSizeZ.value), rotationDeg: Number(els.groundTextureRotation.value), };
    const src = "// Incolla questo blocco al posto di GROUND_TEXTURE_CONFIG in app.js\n" + "const GROUND_TEXTURE_CONFIG = {\n" + ` fileName: ${JSON.stringify(cfg.fileName)},\n` + ` posX: ${cfg.posX},\n` + ` posZ: ${cfg.posZ},\n` + ` sizeX: ${cfg.sizeX},\n` + ` sizeZ: ${cfg.sizeZ},\n` + ` rotationDeg: ${cfg.rotationDeg},\n` + "};\n";
    const blob = new Blob([src], { type: "text/javascript" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "ground-texture-config.js"; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  });

  const CORNER_MARKER_DISTANCE = 3000;
  const cornerMarkerMat = new BABYLON.StandardMaterial("cornerMarkerMat", scene); cornerMarkerMat.emissiveColor = new BABYLON.Color3(1, 0.55, 0); cornerMarkerMat.disableLighting = true;
  for (const sx of [-1, 1]) { for (const sz of [-1, 1]) { const corner = BABYLON.MeshBuilder.CreateCylinder("cornerMarker", { diameterTop: 4, diameterBottom: 4, height: 500, tessellation: 12 }, scene); corner.material = cornerMarkerMat; corner.isPickable = false; corner.position.set(sx * CORNER_MARKER_DISTANCE, 0, sz * CORNER_MARKER_DISTANCE); } }

  const DRIVE_MARKER_Y = 0.05; let driveMarkerMeshes = [];
  function siteNumToSiteCouple(value) { if (value < 0 || value >= 36 * 26 + 100) return "debug error"; if (value < 100) return value.toString().padStart(2, "0"); const alphabetOffset = "A".charCodeAt(0); const adjustedValue = value - 100; const firstValue = Math.floor(adjustedValue / 36); const firstChar = String.fromCharCode(alphabetOffset + firstValue); const secondValue = adjustedValue % 36; const secondChar = secondValue < 10 ? secondValue.toString() : String.fromCharCode(alphabetOffset + (secondValue - 10)); return firstChar + secondChar; }
  function findIMGfile(filesAvail, camera, sol, site, drive) { const results = []; if (!filesAvail) return results; const cameras = camera ? [camera] : Object.keys(filesAvail); for (const cam of cameras) { const sols = sol ? [sol] : Object.keys(filesAvail[cam] || {}); for (const s of sols) { const bySite = filesAvail[cam] && filesAvail[cam][s]; if (bySite && bySite[site] && bySite[site][drive]) { results.push(...bySite[site][drive].map(filename => ({ filename, camera: cam, sol: s, site, drive }))); } } } return results; }
  function find3Dfiles(filesData, solNorm, siteChars, driveChars, extension, allowedCameras) { const matchingFiles = []; for (const sol in (filesData || {})) { if (solNorm && sol !== solNorm) continue; const siteData = filesData[sol]; for (const site in siteData) { if (siteChars && site !== siteChars) continue; const driveData = siteData[site]; for (const drive in driveData) { if (driveChars && drive !== driveChars) continue; const extData = driveData[drive]; for (const ext in extData) { if (extension && ext !== extension) continue; let filtered = extData[ext]; if (extension === "vst" && allowedCameras) { filtered = filtered.filter(obj => { const cameraPart = obj.filename[1] && obj.filename[1].toLowerCase(); return cameraPart && allowedCameras.includes(cameraPart); }); } matchingFiles.push(...filtered); } } } } return matchingFiles; }
  function clearDriveMarkers() { for (const m of driveMarkerMeshes) m.dispose(); driveMarkerMeshes = []; }
  function showDriveMarkerInfo(meta) {
    const siteNorm = `site${String(meta.site).padStart(4, "0")}`;
    let html = "<br>" + `Site: ${meta.site}, Drive: ${meta.drive} (prodotti '${meta.couple}', sol ${meta.solNumberNorm})<br>` + `x: ${fmtFloat(meta.x, 2)}, y: ${fmtFloat(meta.y, 2)}<br><br>` + `VST/PFB files per ${siteNorm}/drive${meta.drive}:<br>` + `<a target="_blank" href="https://planetarydata.jpl.nasa.gov/img/data/mer/spirit/mer2mw_0xxx/data/navcam/${siteNorm}">Folder navcam</a><br>` + `<a target="_blank" href="https://planetarydata.jpl.nasa.gov/img/data/mer/spirit/mer2mw_0xxx/data/pancam/${siteNorm}">Folder pancam</a><br>` + `<a target="_blank" href="https://planetarydata.jpl.nasa.gov/img/data/mer/spirit/mer2mw_0xxx/data/hazcam/${siteNorm}">Folder hazcams</a><br>`;
    const siteCode = meta.couple.substring(0, 2), driveCode = meta.couple.substring(2, 4);
    for (const f of find3Dfiles(filesAvailability3d, null, siteCode, driveCode, "vst", "pn")) { html += `<a target="_blank" href="https://planetarydata.jpl.nasa.gov/img/data/mer/spirit/${f.filepath.toLowerCase()}${f.filename.toLowerCase()}">${f.filename.toLowerCase()}</a><br>`; }
    for (const f of find3Dfiles(filesAvailability3d, null, siteCode, driveCode, "pfb", "pn")) { html += `<a target="_blank" href="https://planetarydata.jpl.nasa.gov/img/data/mer/spirit/${f.filepath.toLowerCase()}${f.filename.toLowerCase()}">${f.filename.toLowerCase()}</a><br>`; }
    els.spnLinks.innerHTML = html; els.spnLinksIMGBody.innerHTML = ""; const BASE = "https://planetarydata.jpl.nasa.gov/img/data/mer/spirit"; const camFolder = { pancam: "/mer2po_0xxx/", navcam: "/mer2no_0xxx/", hazcam: "/mer2ho_0xxx/" }; for (const IMG of (meta.IMGFilesFound || [])) { if (els.chkFullFrame.checked && IMG.filename.toUpperCase().indexOf("FFL") < 0) continue; const jpgFolder = BASE + camFolder[IMG.camera] + "browse/" + IMG.sol + "/rdr/"; const imgFolder = BASE + camFolder[IMG.camera] + "data/" + IMG.sol + "/rdr/"; const f = IMG.filename.toLowerCase(); const thumbName = f.substr(0, 11) + "thn" + f.substr(14, f.length - 14); const tr = document.createElement("tr"); const imgLink = document.createElement("a"); imgLink.href = imgFolder + f + ".img"; imgLink.target = "_blank"; imgLink.textContent = f + ".img"; const jpgLink = document.createElement("a"); jpgLink.href = jpgFolder + f + ".img.jpg"; jpgLink.target = "_blank"; jpgLink.textContent = f + ".img.jpg"; const thumb = document.createElement("img"); thumb.src = jpgFolder + thumbName + ".img.jpg"; thumb.style.maxWidth = "120px"; const tdImg = document.createElement("td"); tdImg.appendChild(imgLink); const tdJpg = document.createElement("td"); tdJpg.appendChild(jpgLink); const tdThumb = document.createElement("td"); tdThumb.appendChild(thumb); tr.appendChild(tdImg); tr.appendChild(tdJpg); tr.appendChild(tdThumb); els.spnLinksIMGBody.appendChild(tr); }
  }
  function placeDriveMarkers3D(startSite, endSite) {
    clearDriveMarkers(); const table = getDrivesTable(); if (!table || Object.keys(table).length === 0) { els.traverseStatus.textContent = "Nessun dato drives disponibile."; return; }
    const MINSIZE_WITHOUT = 8, MINSIZE = 15, MAXSIZE = 40; let siteIdx = 0, count = 0;
    Object.keys(table).forEach(site => { if (siteIdx >= startSite && siteIdx <= endSite) { Object.keys(table[site]).forEach(drive => { const driveData = table[site][drive]; if (!driveData.totalOffset || typeof driveData.totalOffset.x === "undefined" || typeof driveData.totalOffset.y === "undefined") return; const siteCode = siteNumToSiteCouple(site); const driveCode = siteNumToSiteCouple(drive); const couple = siteCode + driveCode; const vstFilesCount = find3Dfiles(filesAvailability3d, null, siteCode, driveCode, "vst", "pn").length; const pfbFilesCount = find3Dfiles(filesAvailability3d, null, siteCode, driveCode, "pfb", "pn").length; const htFilesCount = find3Dfiles(filesAvailability3d, null, siteCode, driveCode, "ht", "pn").length; const IMGFilesFound = findIMGfile(filesAvailabilityIMG, null, null, siteCode, driveCode); const solNumberNorm = (IMGFilesFound[0] && IMGFilesFound[0].sol) || "n/a"; const isPrimary = (drive === "0"); let diameter, color; if (isPrimary) { diameter = 1.6; color = new BABYLON.Color3(0.85, 0.1, 0.1); } else { let sizeFinal = (vstFilesCount > 0 || pfbFilesCount > 0 || htFilesCount > 0) ? MINSIZE : MINSIZE_WITHOUT; sizeFinal = Math.min(MAXSIZE, sizeFinal + vstFilesCount + pfbFilesCount + htFilesCount); diameter = 0.3 + sizeFinal * 0.025; color = pfbFilesCount > 0 ? new BABYLON.Color3(0.9, 0.85, 0.05) : new BABYLON.Color3(0.15, 0.35, 0.9); } const [bx, , bz] = applyPfbAxisTransform(driveData.totalOffset.x, driveData.totalOffset.y, driveData.totalOffset.z); const disc = BABYLON.MeshBuilder.CreateDisc("driveMarker_" + site + "_" + drive, { radius: diameter / 2, tessellation: 24 }, scene); disc.rotation.x = Math.PI / 2; disc.position.set(bx, DRIVE_MARKER_Y, bz); const mat = new BABYLON.StandardMaterial("driveMarkerMat_" + site + "_" + drive, scene); mat.emissiveColor = color; mat.diffuseColor = color; mat.specularColor = new BABYLON.Color3(0, 0, 0); mat.backFaceCulling = false; disc.material = mat; disc.metadata = { site, drive, couple, solNumberNorm, IMGFilesFound, x: driveData.totalOffset.x, y: driveData.totalOffset.y, }; disc.actionManager = new BABYLON.ActionManager(scene); disc.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => showDriveMarkerInfo(disc.metadata))); disc.setEnabled(els.chkShowDriveMarkers.checked); driveMarkerMeshes.push(disc); count++; }); } siteIdx++; });
    els.traverseStatus.textContent = `Creati ${count} dischetti (site ${startSite}–${endSite}).`;
  }
  els.btnPlot.addEventListener("click", () => { placeDriveMarkers3D(parseInt(els.startSite.value, 10), parseInt(els.endSite.value, 10)); });
  els.chkShowDriveMarkers.addEventListener("change", () => { for (const m of driveMarkerMeshes) m.setEnabled(els.chkShowDriveMarkers.checked); });

  function countFilesTable(solData) { const result = []; for (const site in solData) { if (site === "sol") continue; for (const drive in solData[site]) { const vstCount = solData[site][drive].vst ? solData[site][drive].vst.length : 0; const pfbCount = solData[site][drive].pfb ? solData[site][drive].pfb.length : 0; const htCount = solData[site][drive].ht ? solData[site][drive].ht.length : 0; if (pfbCount > 0) result.push({ sol: solData.sol, site, drive, vstCount, pfbCount, htCount }); } } return result; }
  function generateDataTable(data) { const table = document.createElement("table"); table.setAttribute("border", "1"); const thead = document.createElement("thead"); const headerRow = document.createElement("tr"); ["Sol", "Site", "Drive", "HT", "VST", "PFB", "VST/HT", "Hazcam", "Navcam", "Pancam"].forEach(text => { const th = document.createElement("th"); th.textContent = text; headerRow.appendChild(th); }); thead.appendChild(headerRow); table.appendChild(thead); const tbody = document.createElement("tbody"); const baseUrl = "https://planetarydata.jpl.nasa.gov/img/data/mer/spirit/mer2mw_0xxx/data/"; data.forEach(row => { const tr = document.createElement("tr"); [row.sol, row.site, row.drive, row.htCount, row.vstCount, row.pfbCount, (row.vstCount / row.pfbCount).toFixed(1)].forEach(text => { const td = document.createElement("td"); td.textContent = text; tr.appendChild(td); }); for (const cam of ["hazcam", "navcam", "pancam"]) { const td = document.createElement("td"); const a = document.createElement("a"); a.href = baseUrl + cam + "/site" + String(row.site).padStart(4, "0"); a.target = "_blank"; a.textContent = "folder"; td.appendChild(a); tr.appendChild(td); } tbody.appendChild(tr); }); table.appendChild(tbody); return table; }
  function sortTableData(data) { return data.sort((a, b) => { if (parseInt(a.sol, 10) !== parseInt(b.sol, 10)) return parseInt(a.sol, 10) - parseInt(b.sol, 10); if (a.site !== b.site) return a.site.localeCompare(b.site); return a.drive.localeCompare(b.drive); }); }
  function processDataTable() { const tableData = []; for (const sol in filesAvailability3d) { const solData = filesAvailability3d[sol]; solData.sol = sol.replace("sol", ""); const count = countFilesTable(solData); if (count.length > 0) tableData.push(...count); } els.dataTableContainer.innerHTML = ""; els.dataTableContainer.appendChild(generateDataTable(sortTableData(tableData))); }
  els.btnTable.addEventListener("click", processDataTable);

  function updateGroundCoordsHint(pointerX, pointerY) {
    const ray = scene.createPickingRay(pointerX, pointerY, BABYLON.Matrix.Identity(), camera);
    const plane = BABYLON.Plane.FromPositionAndNormal(new BABYLON.Vector3(0, groundPlane.position.y, 0), BABYLON.Vector3.Up());
    const distance = ray.intersectsPlane(plane);
    if (distance !== null && distance >= 0) { const p = ray.origin.add(ray.direction.scale(distance)); els.groundCoordsHint.textContent = `X: ${fmtFloat(p.x, 2)} · Y: ${fmtFloat(p.z, 2)}`; } else { els.groundCoordsHint.textContent = "X: — · Y: —"; }
  }
  scene.onPointerObservable.add((pointerInfo) => { if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) { updateGroundCoordsHint(scene.pointerX, scene.pointerY); } });

  const gizmoEngine = new BABYLON.Engine(els.axisGizmoCanvas, true, { preserveDrawingBuffer: true, alpha: true });
  const gizmoScene = new BABYLON.Scene(gizmoEngine); gizmoScene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
  const gizmoCamera = new BABYLON.ArcRotateCamera("gizmoCam", -Math.PI / 2.4, Math.PI / 2.6, 3.4, BABYLON.Vector3.Zero(), gizmoScene);
  const gizmoLight = new BABYLON.HemisphericLight("gizmoLight", new BABYLON.Vector3(0.3, 1, 0.2), gizmoScene); gizmoLight.intensity = 1;
  let gizmoMeshes = []; function buildGizmoAxes() { for (const m of gizmoMeshes) m.dispose(); gizmoMeshes = []; for (const spec of AXIS_SPECS) { const [tx, ty, tz] = applyAxisTransform(spec.raw[0], spec.raw[1], spec.raw[2]); const tip = new BABYLON.Vector3(tx, ty, tz); const mat = new BABYLON.StandardMaterial("gizmoMat", gizmoScene); mat.emissiveColor = spec.color; mat.disableLighting = true; const shaft = BABYLON.MeshBuilder.CreateCylinder("gizmoShaft", { diameterTop: 0.05, diameterBottom: 0.05, height: 0.8, tessellation: 8 }, gizmoScene); shaft.position = tip.scale(0.4); orientTowards(shaft, tip); shaft.material = mat; const arrow = BABYLON.MeshBuilder.CreateCylinder("gizmoArrow", { diameterTop: 0, diameterBottom: 0.16, height: 0.32, tessellation: 10 }, gizmoScene); arrow.position = tip.scale(0.92); orientTowards(arrow, tip); arrow.material = mat; gizmoMeshes.push(shaft, arrow); } } buildGizmoAxes();
  function renderLoopTick() { scene.render(); gizmoCamera.alpha = camera.alpha; gizmoCamera.beta = camera.beta; gizmoScene.render(); }
  engine.runRenderLoop(renderLoopTick); window.addEventListener("resize", () => { engine.resize(); gizmoEngine.resize(); });
  els.canvas.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false }); document.addEventListener("gesturestart", (e) => e.preventDefault()); document.addEventListener("gesturechange", (e) => e.preventDefault());

  function frameCameraOnBounds(bbox) { const t = transformBoundingBoxWithOrigin(bbox); const center = BABYLON.Vector3.Center(t.min, t.max); const size = Math.max(t.max.x - t.min.x, t.max.y - t.min.y, t.max.z - t.min.z, 0.001); camera.target = center; camera.radius = size * 1.1; camera.lowerRadiusLimit = size * 0.01; camera.upperRadiusLimit = size * 50; currentAxisLength = size * 0.35; buildAxes(currentAxisLength); }
  function disposeCurrentMeshes() { if (surfaceMesh) { shadowGenerator.removeShadowCaster(surfaceMesh); surfaceMesh.dispose(false, true); surfaceMesh = null; } if (pointsMesh) { pointsMesh.dispose(false, true); pointsMesh = null; } }
  function buildMeshesForLod(lodIndex) {
    disposeCurrentMeshes(); const lod = vstData.lods[lodIndex]; const geo = VST.buildLodGeometry(lod); const positions = getTransformedPositions();
    if (geo.triangleIndices.length > 0) {
      const indices = windingCorrected(geo.triangleIndices, transformMatrix);
      const vertexData = new BABYLON.VertexData(); vertexData.positions = positions; vertexData.uvs = vstData.uvs; vertexData.indices = indices;
      const normals = []; BABYLON.VertexData.ComputeNormals(vertexData.positions, vertexData.indices, normals); vertexData.normals = normals;
      surfaceMesh = new BABYLON.Mesh("vst_surface_lod" + lodIndex, scene); vertexData.applyToMesh(surfaceMesh, true);
      const mat = new BABYLON.StandardMaterial("vst_mat", scene); mat.backFaceCulling = els.cullingToggle.checked; mat.twoSidedLighting = true; mat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05); mat.diffuseColor = new BABYLON.Color3(0.72, 0.66, 0.58); mat.diffuseTexture = (showTexture && cachedTexture) ? cachedTexture : null; mat.wireframe = els.wireframeToggle.checked; surfaceMesh.material = mat; surfaceMesh.receiveShadows = true; shadowGenerator.addShadowCaster(surfaceMesh, true); if (els.normalsToggle.checked) surfaceMesh.convertToFlatShadedMesh();
    }
    if (geo.pointIndices.length > 0) {
      const pointPositions = new Float32Array(geo.pointIndices.length * 3);
      for (let i = 0; i < geo.pointIndices.length; i++) { const vi = geo.pointIndices[i]; pointPositions[i * 3 + 0] = positions[vi * 3 + 0]; pointPositions[i * 3 + 1] = positions[vi * 3 + 1]; pointPositions[i * 3 + 2] = positions[vi * 3 + 2]; }
      const pointIdx = new Uint32Array(geo.pointIndices.length); for (let i = 0; i < pointIdx.length; i++) pointIdx[i] = i;
      const pvd = new BABYLON.VertexData(); pvd.positions = pointPositions; pvd.indices = pointIdx; pointsMesh = new BABYLON.Mesh("vst_points_lod" + lodIndex, scene); pvd.applyToMesh(pointsMesh);
      const pmat = new BABYLON.StandardMaterial("vst_points_mat", scene); pmat.fillMode = BABYLON.Material.PointFillMode; pmat.pointSize = Number(els.pointSize.value); pmat.emissiveColor = new BABYLON.Color3(0.9, 0.65, 0.4); pmat.disableLighting = true; pointsMesh.material = pmat;
    }
    els.pointSize.disabled = !pointsMesh; els.viewportHint.style.display = "block"; els.emptyHint.style.display = "none";
  }

  function parseSiteDriveFromFilename(name) { const m = name.match(/_(\d+)_ffl_(\d+)_/i); if (!m) return null; return { site: m[1], drive: m[2] }; }
  function frameOnMeshes(meshList) {
    if (!meshList || meshList.length === 0) return; let min = new BABYLON.Vector3(Infinity, Infinity, Infinity); let max = new BABYLON.Vector3(-Infinity, -Infinity, -Infinity);
    for (const m of meshList) { m.computeWorldMatrix(true); const bb = m.getBoundingInfo().boundingBox; min = BABYLON.Vector3.Minimize(min, bb.minimumWorld); max = BABYLON.Vector3.Maximize(max, bb.maximumWorld); }
    const center = BABYLON.Vector3.Center(min, max); const size = Math.max(max.x - min.x, max.y - min.y, max.z - min.z, 0.001); const newRadius = size * 1.1; currentAxisLength = size * 0.35; buildAxes(currentAxisLength);
    const fps = 60, frames = 45; const easing = new BABYLON.CubicEase(); easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    const targetAnim = new BABYLON.Animation("camTargetAnim", "target", fps, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT); targetAnim.setKeys([{ frame: 0, value: camera.target.clone() }, { frame: frames, value: center }]); targetAnim.setEasingFunction(easing);
    const radiusAnim = new BABYLON.Animation("camRadiusAnim", "radius", fps, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT); radiusAnim.setKeys([{ frame: 0, value: camera.radius }, { frame: frames, value: newRadius }]); radiusAnim.setEasingFunction(easing);
    camera.lowerRadiusLimit = Math.min(camera.lowerRadiusLimit, size * 0.01); camera.upperRadiusLimit = Math.max(camera.upperRadiusLimit, size * 50); scene.stopAnimation(camera); scene.beginDirectAnimation(camera, [targetAnim, radiusAnim], 0, frames, false);
  }
  function disposeEntryMeshes(entry) { for (const m of entry.meshes) { shadowGenerator.removeShadowCaster(m); m.dispose(false, true); } entry.meshes = []; }
  function updateEntryPosition(entry) {
    const table = getDrivesTable(); const bySite = entry.site != null ? table && table[entry.site] : null; const rec = (bySite && entry.drive != null) ? bySite[entry.drive] : null;
    if (rec && rec.totalOffset) {
      const rawZ = ignoreElevationForRoverPlacement ? 0 : rec.totalOffset.z;
      const [mx, my, mz] = applyPfbAxisTransform(rec.totalOffset.x, rec.totalOffset.y, rawZ);
      entry.xyMarker.position.set(mx, my, mz);
      entry.xyMarker.setEnabled(true);
    }
    else { entry.xyMarker.setEnabled(false); }
    const off = entry.manualOffset || { x: 0, y: 0, z: 0 };
    const [offX, offY, offZ] = applyPfbAxisTransform(off.x, off.y, off.z);
    let baseX = 0, baseY = 0, baseZ = 0;
    if (entry.placement === "rover" && rec && rec.totalOffset && rec.euler) {
      const rawZ = ignoreElevationForRoverPlacement ? 0 : rec.totalOffset.z;
      const [bx, by, bz] = applyPfbAxisTransform(rec.totalOffset.x, rec.totalOffset.y, rawZ);
      baseX = bx; baseY = by; baseZ = bz;
    }
    // Rotazione manuale attorno alla verticale (asse Y di Babylon), sempre
    // applicata indipendentemente dal placement: ruota il modello su sé
    // stesso senza spostarne il centro.
    entry.root.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, entry.rotationY || 0);
    entry.root.position.set(baseX + offX, baseY + offY, baseZ + offZ);
  }
  function disposeEntryAxes(entry) { for (const m of entry.axesMeshes) m.dispose(); entry.axesMeshes = []; }
  function buildEntryAxes(entry, length) {
    disposeEntryAxes(entry);
    const M = entryGeometryMatrix(entry);
    for (const spec of AXIS_SPECS) { const [tx, ty, tz] = applyMatrix3(M, spec.raw[0], spec.raw[1], spec.raw[2]); const tip = new BABYLON.Vector3(tx * length, ty * length, tz * length); const mat = new BABYLON.StandardMaterial("pfbAxisMat_" + entry.id, scene); mat.emissiveColor = spec.color; mat.disableLighting = true; const shaft = BABYLON.MeshBuilder.CreateCylinder("pfbAxis_" + entry.id, { diameterTop: 0.1, diameterBottom: 0.1, height: length * 0.86, tessellation: 8 }, scene); shaft.parent = entry.root; shaft.position = tip.scale(0.43); orientTowards(shaft, tip); shaft.isPickable = false; shaft.material = mat; const arrow = BABYLON.MeshBuilder.CreateCylinder("pfbAxisArrow_" + entry.id, { diameterTop: 0, diameterBottom: length * 0.045, height: length * 0.14, tessellation: 10 }, scene); arrow.parent = entry.root; arrow.position = tip.scale(0.93); orientTowards(arrow, tip); arrow.isPickable = false; arrow.material = mat; entry.axesMeshes.push(shaft, arrow); }
  }
  function buildEntryMeshes(entry) {
    disposeEntryMeshes(entry); const assembled = PFBScene.assembleScene(entry.tree, entry.lodDepth); entry.assembled = assembled; let totalTri = 0; const minV = new BABYLON.Vector3(Infinity, Infinity, Infinity); const maxV = new BABYLON.Vector3(-Infinity, -Infinity, -Infinity);
    const M = entryGeometryMatrix(entry);
    assembled.groups.forEach((g, idx) => { if (g.positions.length === 0) return; const n = g.positions.length / 3; const positions = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const [x, y, z] = applyMatrix3(M, g.positions[i * 3], g.positions[i * 3 + 1], g.positions[i * 3 + 2]); positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z; minV.x = Math.min(minV.x, x); maxV.x = Math.max(maxV.x, x); minV.y = Math.min(minV.y, y); maxV.y = Math.max(maxV.y, y); minV.z = Math.min(minV.z, z); maxV.z = Math.max(maxV.z, z); } const indices = windingCorrected(g.indices, M); const vd = new BABYLON.VertexData(); vd.positions = positions; vd.uvs = g.uvs; vd.indices = indices; const normals = []; BABYLON.VertexData.ComputeNormals(positions, indices, normals); vd.normals = normals; const mesh = new BABYLON.Mesh("pfb_" + entry.id + "_group_" + g.textureIndex, scene); vd.applyToMesh(mesh); mesh.parent = entry.root; const mat = new BABYLON.StandardMaterial("pfb_mat_" + entry.id + "_" + idx, scene); mat.backFaceCulling = els.cullingToggle.checked; mat.twoSidedLighting = true; mat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05); mat.diffuseColor = new BABYLON.Color3(0.7, 0.65, 0.58); const texInfo = entry.textureImages.get(g.textureIndex); mat.diffuseTexture = (showTexture && texInfo && texInfo.babylonTexture) ? texInfo.babylonTexture : null; mat.wireframe = els.wireframeToggle.checked; mesh.material = mat; mesh.receiveShadows = true; shadowGenerator.addShadowCaster(mesh, true); if (els.normalsToggle.checked) mesh.convertToFlatShadedMesh(); entry.meshes.push(mesh); totalTri += indices.length / 3; });
    const size = (minV.x <= maxV.x) ? Math.max(maxV.x - minV.x, maxV.y - minV.y, maxV.z - minV.z, 0.001) : 100; buildEntryAxes(entry, size * 0.35); updateEntryPosition(entry); els.pointSize.disabled = true; els.viewportHint.style.display = "block"; els.emptyHint.style.display = "none";
    if (entry.id === selectedEntryId) { els.pfbGeosetTotal.textContent = fmtInt(entry.tree.geosets.length); els.pfbGeosetUsed.textContent = fmtInt(assembled.instanceCount); els.pfbTriCount.textContent = fmtInt(totalTri); }
  }
  function renderPfbTexturesList(entry) {
    els.pfbTexturesList.innerHTML = ""; if (entry.tree.textures.length === 0) { const p = document.createElement("p"); p.style.cssText = "font-size:0.75rem; color:var(--muted); margin:0;"; p.textContent = "Questo modello non referenzia alcuna texture."; els.pfbTexturesList.appendChild(p); return; }
    entry.tree.textures.forEach((tex, i) => { const field = document.createElement("div"); field.className = "field"; const label = document.createElement("label"); label.className = "field-label"; label.textContent = tex.fileName || ("texture " + i); const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.addEventListener("change", (ev) => { const file = ev.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { const old = entry.textureImages.get(i); if (old && old.babylonTexture) old.babylonTexture.dispose(); const babylonTexture = new BABYLON.Texture(reader.result, scene); entry.textureImages.set(i, { fileName: file.name, dataUrl: reader.result, babylonTexture }); const mesh = entry.meshes.find(m => m.name === "pfb_" + entry.id + "_group_" + i); if (mesh && mesh.material) mesh.material.diffuseTexture = showTexture ? babylonTexture : null; }; reader.readAsDataURL(file); }); field.appendChild(label); field.appendChild(input); els.pfbTexturesList.appendChild(field); });
  }
  function renderModelsTable() {
    els.pfbModelsBody.innerHTML = ""; for (const entry of modelEntries) { const tr = document.createElement("tr"); tr.className = entry.id === selectedEntryId ? "active" : ""; const tdName = document.createElement("td"); tdName.textContent = entry.fileName; const tdSiteDrive = document.createElement("td"); tdSiteDrive.textContent = entry.site != null ? `${entry.site}/${entry.drive}` : "n/d"; const tdCheck = document.createElement("td"); const check = document.createElement("input"); check.type = "checkbox"; check.checked = entry.placement === "rover"; check.disabled = entry.site == null; check.addEventListener("click", (e) => e.stopPropagation()); check.addEventListener("change", () => { entry.placement = check.checked ? "rover" : "origin"; updateEntryPosition(entry); }); tdCheck.appendChild(check); const tdVisible = document.createElement("td"); const visCheck = document.createElement("input"); visCheck.type = "checkbox"; visCheck.checked = entry.visible; visCheck.addEventListener("click", (e) => e.stopPropagation()); visCheck.addEventListener("change", () => { entry.visible = visCheck.checked; entry.root.setEnabled(entry.visible); }); tdVisible.appendChild(visCheck); tr.appendChild(tdName); tr.appendChild(tdSiteDrive); tr.appendChild(tdCheck); tr.appendChild(tdVisible); tr.addEventListener("click", () => selectEntry(entry.id)); els.pfbModelsBody.appendChild(tr); }
  }
  function selectEntry(id) {
    selectedEntryId = id; renderModelsTable(); const entry = modelEntries.find(e => e.id === id); if (!entry) return; els.pfbLodDepth.max = String(entry.maxLodDepth); els.pfbLodDepth.value = String(entry.lodDepth); els.pfbGeosetTotal.textContent = fmtInt(entry.tree.geosets.length); els.pfbGeosetUsed.textContent = fmtInt(entry.assembled ? entry.assembled.instanceCount : 0); let tri = 0; if (entry.assembled) for (const g of entry.assembled.groups) tri += g.indices.length / 3; els.pfbTriCount.textContent = fmtInt(tri); renderPfbTexturesList(entry);
    const off = entry.manualOffset || { x: 0, y: 0, z: 0 }; els.pfbOffsetX.value = String(off.x); els.pfbOffsetY.value = String(off.y); els.pfbOffsetZ.value = String(off.z); els.pfbOffsetXValue.textContent = fmtFloat(off.x, 0); els.pfbOffsetYValue.textContent = fmtFloat(off.y, 0); els.pfbOffsetZValue.textContent = fmtFloat(off.z, 0);
    const rotDeg = BABYLON.Tools.ToDegrees(entry.rotationY || 0); els.pfbRotationY.value = String(rotDeg); els.pfbRotationYValue.textContent = fmtFloat(rotDeg, 1);
    const mirror = entry.mirror || { x: 1, y: 1, z: 1 }; els.pfbMirrorX.checked = mirror.x < 0; els.pfbMirrorY.checked = mirror.y < 0; els.pfbMirrorZ.checked = mirror.z < 0;
  }
  function addPfbEntry(tree, fileName) {
    const id = nextModelId++; const root = new BABYLON.TransformNode("pfb_root_" + id, scene);
    const xyMarkerMat = new BABYLON.StandardMaterial("pfbXYMarkerMat_" + id, scene); xyMarkerMat.diffuseColor = new BABYLON.Color3(0, 0, 0); xyMarkerMat.specularColor = new BABYLON.Color3(0, 0, 0); xyMarkerMat.emissiveColor = new BABYLON.Color3(0.02, 0.02, 0.02);
    const xyMarker = BABYLON.MeshBuilder.CreateCylinder("pfbXYMarker_" + id, { diameterTop: 1, diameterBottom: 1, height: 500, tessellation: 16 }, scene); xyMarker.material = xyMarkerMat; xyMarker.isPickable = false;
    const siteDrive = parseSiteDriveFromFilename(fileName); const maxLodDepth = Math.max(0, PFBScene.maxLodChildren(tree) - 1);
    const entry = { id, fileName, tree, root, xyMarker, meshes: [], axesMeshes: [], assembled: null, textureImages: new Map(), lodDepth: maxLodDepth, maxLodDepth, site: siteDrive ? siteDrive.site : null, drive: siteDrive ? siteDrive.drive : null, placement: "origin", visible: true, manualOffset: { x: 0, y: 0, z: 0 }, rotationY: 0, mirror: { x: 1, y: 1, z: 1 }, };
    modelEntries.push(entry); buildEntryMeshes(entry); renderModelsTable(); selectEntry(entry.id); frameOnMeshes(entry.meshes); return entry;
  }
  function disposeAllPfbEntries() { for (const entry of modelEntries) { disposeEntryMeshes(entry); entry.root.dispose(); entry.textureImages.forEach(t => { if (t.babylonTexture) t.babylonTexture.dispose(); }); } modelEntries = []; selectedEntryId = null; renderModelsTable(); }
  function updateCardVisibility() {
    const hasVst = vstData !== null; const hasPfb = modelEntries.length > 0;
    els.headerCard.style.display = hasVst ? "" : "none"; els.lodCard.style.display = hasVst ? "" : "none"; els.vstInfoCard.style.display = hasVst ? "" : "none"; els.exportObjField.style.display = hasVst ? "" : "none"; els.texFileField.style.display = hasVst ? "" : "none";
    els.pfbModelsCard.style.display = hasPfb ? "" : "none"; els.pfbOffsetCard.style.display = hasPfb ? "" : "none"; els.pfbLodCard.style.display = hasPfb ? "" : "none"; els.pfbTexturesCard.style.display = hasPfb ? "" : "none"; els.pfbExportCard.style.display = hasPfb ? "" : "none"; els.pfbInfoCard.style.display = hasPfb ? "" : "none";
    els.renderCard.style.display = (hasVst || hasPfb) ? "" : "none"; els.axesCard.style.display = hasVst ? "" : "none"; els.pfbAxesCard.style.display = hasPfb ? "" : "none"; els.pfbGeomAxesCard.style.display = hasPfb ? "" : "none";
  }
  function loadPfbFile(file) {
    setStatus(`Lettura di "${file.name}" (${fmtInt(file.size)} byte)…`);
    const reader = new FileReader(); reader.onerror = () => setStatus("Impossibile leggere il file selezionato.", "err");
    reader.onload = () => { try { const buf = reader.result; const tree = PFB.parsePFB(buf); currentFormat = "pfb";
      if (modelEntries.length === 0 && !vstData) { axisMapping.x = { target: "x", sign: 1 }; axisMapping.y = { target: "z", sign: 1 }; axisMapping.z = { target: "y", sign: 1 }; rebuildTransformMatrix(); renderAxisMappingUI(); transformDirty = true; }
      showTexture = true; els.textureToggle.checked = true; els.textureToggle.disabled = false; const entry = addPfbEntry(tree, file.name);
      setStatus(`File.pfb analizzato: ${fmtInt(tree.nodes.length)} nodi, ${fmtInt(tree.geosets.length)} geoset, ${fmtInt(tree.textures.length)} texture referenziate.` + (entry.site != null ? ` Site/drive rilevati: ${entry.site}/${entry.drive}.` : " Site/drive non rilevati dal nome file."), "ok"); updateCardVisibility();
    } catch (err) { console.error(err); const detail = (err && err.name === "PFBParseError") ? err.message : ("Errore inatteso: " + err.message); setStatus("Impossibile interpretare il file come.pfb Performer.\n" + detail, "err"); } };
    reader.readAsArrayBuffer(file);
  }
  async function exportPfbZip() {
    const entry = modelEntries.find(e => e.id === selectedEntryId); if (!entry || !entry.assembled) return; setStatus("Preparazione dello ZIP…"); engine.stopRenderLoop();
    try { const zip = new JSZip(); const objLines = ["# esportato da ViSTa/PFB Viewer", "mtllib model.mtl"]; const mtlLines = []; let vOffset = 0, groupIdx = 0;
      for (const g of entry.assembled.groups) { if (g.positions.length === 0) continue; const matName = "mat" + groupIdx; objLines.push(`g group${groupIdx}`, `usemtl ${matName}`); const texInfo = g.textureIndex >= 0 ? entry.textureImages.get(g.textureIndex) : null; mtlLines.push(`newmtl ${matName}`, "Kd 0.700 0.650 0.580"); if (texInfo) { const ext = (texInfo.fileName.split(".").pop() || "png").toLowerCase(); const imgName = `textures/tex${g.textureIndex}.${ext}`; mtlLines.push(`map_Kd ${imgName}`); zip.file(imgName, texInfo.dataUrl.split(",")[1], { base64: true }); } mtlLines.push(""); const n = g.positions.length / 3; for (let i = 0; i < n; i++) objLines.push(`v ${g.positions[i * 3]} ${g.positions[i * 3 + 1]} ${g.positions[i * 3 + 2]}`); for (let i = 0; i < n; i++) objLines.push(`vt ${g.uvs[i * 2] || 0} ${g.uvs[i * 2 + 1] || 0}`); for (let i = 0; i + 2 < g.indices.length; i += 3) { const a = g.indices[i] + 1 + vOffset, b = g.indices[i + 1] + 1 + vOffset, c = g.indices[i + 2] + 1 + vOffset; objLines.push(`f ${a}/${a} ${b}/${b} ${c}/${c}`); } vOffset += n; groupIdx++; }
      zip.file("model.obj", objLines.join("\n")); zip.file("model.mtl", mtlLines.join("\n")); const blob = await zip.generateAsync({ type: "blob" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "model_pfb.zip"; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); setStatus("ZIP esportato (model.obj + model.mtl + texture).", "ok");
    } catch (err) { console.error(err); setStatus("Errore nell'esportazione ZIP: " + err.message, "err"); } finally { engine.runRenderLoop(renderLoopTick); }
  }

  function renderHeaderPanel(data) {
    const h = data.header; els.headerInfo.innerHTML = ""; const rows = [["Implementazione", h.implId], ["Versione", `${h.major}.${h.minor}`], ["Byte order", h.littleEndian ? "little-endian" : "big-endian" + (h.byteOrderRecognized ? "" : " (presunto)")], ["Texture referenziate", fmtInt(h.texturesCount)], ["Vertici totali", fmtInt(h.vertexCount)], ["LOD", fmtInt(h.lodsCount)], ["Dimensione file", fmtInt(data.fileSize) + " byte"], ["Byte non consumati", fmtInt(data.trailingBytes)], ["BBox X", `${fmtFloat(data.boundingBox.xmin)} … ${fmtFloat(data.boundingBox.xmax)} m`], ["BBox Y", `${fmtFloat(data.boundingBox.ymin)} … ${fmtFloat(data.boundingBox.ymax)} m`], ["BBox Z", `${fmtFloat(data.boundingBox.zmin)} … ${fmtFloat(data.boundingBox.zmax)} m`], ];
    for (const [k, v] of rows) { const dt = document.createElement("dt"); dt.textContent = k; const dd = document.createElement("dd"); dd.textContent = v; els.headerInfo.appendChild(dt); els.headerInfo.appendChild(dd); }
    els.texRefsSummary.textContent = `Riferimenti texture (${data.textureRefs.length})`; els.texRefsInfo.innerHTML = ""; data.textureRefs.forEach((ref, i) => { const dt = document.createElement("dt"); dt.textContent = "#" + i; const dd = document.createElement("dd"); dd.textContent = ref || "(vuoto)"; els.texRefsInfo.appendChild(dt); els.texRefsInfo.appendChild(dd); }); els.headerCard.style.display = "";
  }
  function renderLodPanel(data) {
    els.lodSelect.innerHTML = ""; els.lodTableBody.innerHTML = ""; data.lods.forEach((lod, i) => { const opt = document.createElement("option"); opt.value = String(i); opt.textContent = `LOD ${i} — ${fmtInt(lod.triangleCount)} triangoli`; els.lodSelect.appendChild(opt); const tr = document.createElement("tr"); tr.innerHTML = `<td>${i}</td><td>${fmtInt(lod.vertexCount)}</td><td>${fmtInt(lod.patchesCount)}</td><td>${fmtInt(lod.triangleCount)}</td><td>${fmtInt(lod.pointCount)}</td>`; els.lodTableBody.appendChild(tr); }); const defaultIndex = data.lods.length - 1; els.lodSelect.value = String(defaultIndex); els.lodCard.style.display = ""; els.renderCard.style.display = ""; els.axesCard.style.display = ""; selectLod(defaultIndex);
  }
  function selectLod(index) {
    currentLodIndex = index; Array.from(els.lodTableBody.children).forEach((tr, i) => { tr.classList.toggle("active", i === index); });
    try { buildMeshesForLod(index); setStatus(`LOD ${index} costruito: ${fmtInt(vstData.lods[index].triangleCount)} triangoli, ${fmtInt(vstData.lods[index].pointCount)} punti.`, "ok"); } catch (err) { console.error(err); setStatus("Errore nella costruzione della mesh: " + err.message, "err"); }
  }

  els.vstFile.addEventListener("change", (ev) => { const file = ev.target.files[0]; if (!file) return; const hasExisting = vstData !== null || modelEntries.length > 0; if (hasExisting) { pendingFile = file; els.loadChoiceFileName.textContent = file.name; els.loadChoiceField.style.display = ""; } else { proceedLoad(file, true); } ev.target.value = ""; });
  function proceedLoad(file, replaceAll) { if (replaceAll) { disposeCurrentMeshes(); disposeAllPfbEntries(); vstData = null; currentFormat = null; } if (file.name.toLowerCase().endsWith(".pfb")) loadPfbFile(file); else loadVstFile(file); }
  els.loadChoiceReplaceBtn.addEventListener("click", () => { els.loadChoiceField.style.display = "none"; if (pendingFile) proceedLoad(pendingFile, true); pendingFile = null; });
  els.loadChoiceAddBtn.addEventListener("click", () => { els.loadChoiceField.style.display = "none"; if (pendingFile) proceedLoad(pendingFile, false); pendingFile = null; });

  function loadVstFile(file) {
    setStatus(`Lettura di "${file.name}" (${fmtInt(file.size)} byte)…`); disposeCurrentMeshes(); vstData = null;
    const reader = new FileReader(); reader.onerror = () => setStatus("Impossibile leggere il file selezionato.", "err");
    reader.onload = () => { try { const buf = reader.result; vstData = VST.parseVST(buf); currentFormat = "vst"; setStatus(`File analizzato correttamente: ${fmtInt(vstData.header.vertexCount)} vertici, ${fmtInt(vstData.header.lodsCount)} LOD, ${fmtInt(vstData.header.texturesCount)} texture referenziate.`, "ok");
      axisMapping.x = { target: "x", sign: 1 }; axisMapping.y = { target: "z", sign: 1 }; axisMapping.z = { target: "y", sign: 1 }; rebuildTransformMatrix(); renderAxisMappingUI(); transformDirty = true;
      if (cachedTexture) { cachedTexture.dispose(); cachedTexture = null; } showTexture = true; els.textureToggle.checked = true; els.textureToggle.disabled = true;
      renderHeaderPanel(vstData); frameCameraOnBounds(vstData.boundingBox); renderLodPanel(vstData); els.texFile.disabled = false; els.texFile.value = ""; updateCardVisibility();
    } catch (err) { console.error(err); vstData = null; currentFormat = null; const detail = (err && err.name === "VSTParseError") ? err.message : ("Errore inatteso: " + err.message); setStatus("Impossibile interpretare il file come.vst ViSTa.\n" + detail, "err"); updateCardVisibility(); } };
    reader.readAsArrayBuffer(file);
  }

  els.texFile.addEventListener("change", (ev) => { const file = ev.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { if (cachedTexture) cachedTexture.dispose(); cachedTexture = new BABYLON.Texture(reader.result, scene); showTexture = true; els.textureToggle.checked = true; els.textureToggle.disabled = false; if (surfaceMesh && surfaceMesh.material) { surfaceMesh.material.diffuseTexture = cachedTexture; } else if (currentLodIndex >= 0) { selectLod(currentLodIndex); } }; reader.readAsDataURL(file); });
  els.lodSelect.addEventListener("change", () => selectLod(Number(els.lodSelect.value)));
  els.wireframeToggle.addEventListener("change", () => { if (surfaceMesh && surfaceMesh.material) surfaceMesh.material.wireframe = els.wireframeToggle.checked; for (const entry of modelEntries) for (const m of entry.meshes) if (m.material) m.material.wireframe = els.wireframeToggle.checked; });
  els.cullingToggle.addEventListener("change", () => { if (surfaceMesh && surfaceMesh.material) surfaceMesh.material.backFaceCulling = els.cullingToggle.checked; for (const entry of modelEntries) for (const m of entry.meshes) if (m.material) m.material.backFaceCulling = els.cullingToggle.checked; });
  els.normalsToggle.addEventListener("change", () => { if (currentLodIndex >= 0) selectLod(currentLodIndex); for (const entry of modelEntries) buildEntryMeshes(entry); });
  els.textureToggle.addEventListener("change", () => { showTexture = els.textureToggle.checked; if (surfaceMesh && surfaceMesh.material) { surfaceMesh.material.diffuseTexture = (showTexture && cachedTexture) ? cachedTexture : null; } for (const entry of modelEntries) { for (const m of entry.meshes) { if (!m.material) continue; const texIdx = Number(m.name.slice(m.name.lastIndexOf("_group_") + 7)); const texInfo = entry.textureImages.get(texIdx); m.material.diffuseTexture = (showTexture && texInfo && texInfo.babylonTexture) ? texInfo.babylonTexture : null; } } });
  function axisMappingValue(entry) { return entry.target + (entry.sign > 0 ? "+" : "-"); }
  function renderAxisMappingUI() { els.axisMapX.value = axisMappingValue(axisMapping.x); els.axisMapY.value = axisMappingValue(axisMapping.y); els.axisMapZ.value = axisMappingValue(axisMapping.z); }
  renderAxisMappingUI();
  function onAxisMappingChange(sourceAxis, rawValue) { const newTarget = rawValue[0]; const newSign = rawValue[1] === "+" ? 1 : -1; const oldTarget = axisMapping[sourceAxis].target; if (newTarget !== oldTarget) { const other = ["x", "y", "z"].find(a => a !== sourceAxis && axisMapping[a].target === newTarget); if (other) axisMapping[other].target = oldTarget; } axisMapping[sourceAxis] = { target: newTarget, sign: newSign }; rebuildTransformMatrix(); renderAxisMappingUI(); transformDirty = true; buildAxes(currentAxisLength); buildGizmoAxes(); if (currentLodIndex >= 0) selectLod(currentLodIndex); }
  els.axisMapX.addEventListener("change", () => onAxisMappingChange("x", els.axisMapX.value)); els.axisMapY.addEventListener("change", () => onAxisMappingChange("y", els.axisMapY.value)); els.axisMapZ.addEventListener("change", () => onAxisMappingChange("z", els.axisMapZ.value));
  function pfbAxisMappingValue(entry) { return entry.target + (entry.sign > 0 ? "+" : "-"); }
  /** Fabbrica di un "controller" per una card di mappatura assi (3 select +
   *  eventuale avviso Z→Y): riusata identica per la mappatura "posizione" e
   *  per quella "vertici", che restano due oggetti/matrici indipendenti. */
  function makeAxisMappingController(mapping, selects, warningEl, rebuildFn, onChanged) {
    function render() {
      selects.x.value = pfbAxisMappingValue(mapping.x);
      selects.y.value = pfbAxisMappingValue(mapping.y);
      selects.z.value = pfbAxisMappingValue(mapping.z);
      if (warningEl) warningEl.style.display = (mapping.z.target === "y") ? "none" : "";
    }
    function onChange(sourceAxis, rawValue) {
      const newTarget = rawValue[0]; const newSign = rawValue[1] === "+" ? 1 : -1;
      const oldTarget = mapping[sourceAxis].target;
      if (newTarget !== oldTarget) {
        const other = ["x", "y", "z"].find(a => a !== sourceAxis && mapping[a].target === newTarget);
        if (other) mapping[other].target = oldTarget;
      }
      mapping[sourceAxis] = { target: newTarget, sign: newSign };
      rebuildFn(); render(); onChanged();
    }
    selects.x.addEventListener("change", () => onChange("x", selects.x.value));
    selects.y.addEventListener("change", () => onChange("y", selects.y.value));
    selects.z.addEventListener("change", () => onChange("z", selects.z.value));
    render();
    return { render };
  }

  const positionAxisController = makeAxisMappingController(
    pfbAxisMapping,
    { x: els.axisMapPfbX, y: els.axisMapPfbY, z: els.axisMapPfbZ },
    els.pfbAxisZWarning,
    rebuildPfbTransformMatrix,
    () => {
      for (const entry of modelEntries) updateEntryPosition(entry);
      updateGroundPositionFromDrive();
      if (driveMarkerMeshes.length > 0) placeDriveMarkers3D(parseInt(els.startSite.value, 10), parseInt(els.endSite.value, 10));
    }
  );

  const geometryAxisController = makeAxisMappingController(
    pfbGeometryAxisMapping,
    { x: els.axisMapPfbGeomX, y: els.axisMapPfbGeomY, z: els.axisMapPfbGeomZ },
    els.pfbGeomAxisZWarning,
    rebuildPfbGeometryTransformMatrix,
    () => { for (const entry of modelEntries) buildEntryMeshes(entry); }
  );
  els.pointSize.addEventListener("input", () => { if (pointsMesh && pointsMesh.material) pointsMesh.material.pointSize = Number(els.pointSize.value); });
  els.bgColor.addEventListener("input", () => { const c = BABYLON.Color3.FromHexString(els.bgColor.value); scene.clearColor = new BABYLON.Color4(c.r, c.g, c.b, 1); });
  els.resetCameraBtn.addEventListener("click", () => { const entry = modelEntries.find(e => e.id === selectedEntryId); if (entry) frameOnMeshes(entry.meshes); else if (vstData) frameCameraOnBounds(vstData.boundingBox); });
  els.pfbLodDepth.addEventListener("input", () => { const entry = modelEntries.find(e => e.id === selectedEntryId); if (!entry) return; entry.lodDepth = Number(els.pfbLodDepth.value); buildEntryMeshes(entry); });
  els.exportPfbZipBtn.addEventListener("click", exportPfbZip);
  function onPfbOffsetSliderInput(axis, slider, valueLabel) { const entry = modelEntries.find(e => e.id === selectedEntryId); if (!entry) return; if (!entry.manualOffset) entry.manualOffset = { x: 0, y: 0, z: 0 }; entry.manualOffset[axis] = Number(slider.value); valueLabel.textContent = fmtFloat(entry.manualOffset[axis], 0); updateEntryPosition(entry); }
  els.pfbOffsetX.addEventListener("input", () => onPfbOffsetSliderInput("x", els.pfbOffsetX, els.pfbOffsetXValue)); els.pfbOffsetY.addEventListener("input", () => onPfbOffsetSliderInput("y", els.pfbOffsetY, els.pfbOffsetYValue)); els.pfbOffsetZ.addEventListener("input", () => onPfbOffsetSliderInput("z", els.pfbOffsetZ, els.pfbOffsetZValue));
  els.pfbRotationY.addEventListener("input", () => { const entry = modelEntries.find(e => e.id === selectedEntryId); if (!entry) return; const deg = Number(els.pfbRotationY.value); entry.rotationY = BABYLON.Tools.ToRadians(deg); els.pfbRotationYValue.textContent = fmtFloat(deg, 1); updateEntryPosition(entry); });
  function onPfbMirrorToggle(axis, checkbox) { const entry = modelEntries.find(e => e.id === selectedEntryId); if (!entry) return; if (!entry.mirror) entry.mirror = { x: 1, y: 1, z: 1 }; entry.mirror[axis] = checkbox.checked ? -1 : 1; buildEntryMeshes(entry); }
  els.pfbMirrorX.addEventListener("change", () => onPfbMirrorToggle("x", els.pfbMirrorX));
  els.pfbMirrorY.addEventListener("change", () => onPfbMirrorToggle("y", els.pfbMirrorY));
  els.pfbMirrorZ.addEventListener("change", () => onPfbMirrorToggle("z", els.pfbMirrorZ));
  els.pfbCenterViewBtn.addEventListener("click", () => { const entry = modelEntries.find(e => e.id === selectedEntryId); if (entry) frameOnMeshes(entry.meshes); });
  els.pfbOffsetResetBtn.addEventListener("click", () => { const entry = modelEntries.find(e => e.id === selectedEntryId); if (!entry) return; entry.manualOffset = { x: 0, y: 0, z: 0 }; entry.rotationY = 0; els.pfbOffsetX.value = "0"; els.pfbOffsetY.value = "0"; els.pfbOffsetZ.value = "0"; els.pfbRotationY.value = "0"; els.pfbOffsetXValue.textContent = "0"; els.pfbOffsetYValue.textContent = "0"; els.pfbOffsetZValue.textContent = "0"; els.pfbRotationYValue.textContent = "0"; updateEntryPosition(entry); });
  els.pfbIgnoreElevationToggle.addEventListener("change", () => { ignoreElevationForRoverPlacement = els.pfbIgnoreElevationToggle.checked; for (const entry of modelEntries) updateEntryPosition(entry); });
  function exportCurrentLodAsObj() {
    if (currentLodIndex < 0) return; const lod = vstData.lods[currentLodIndex]; const geo = VST.buildLodGeometry(lod); const lines = ["# esportato da ViSTa Viewer — LOD " + currentLodIndex, "# vertici: " + (vstData.header.vertexCount) + ", triangoli: " + fmtInt(lod.triangleCount), ];
    const n = vstData.header.vertexCount; for (let i = 0; i < n; i++) { lines.push(`v ${vstData.positions[i * 3]} ${vstData.positions[i * 3 + 1]} ${vstData.positions[i * 3 + 2]}`); } for (let i = 0; i < n; i++) { lines.push(`vt ${vstData.uvs[i * 2]} ${vstData.uvs[i * 2 + 1]}`); }
    for (let i = 0; i + 2 < geo.triangleIndices.length; i += 3) { const a = geo.triangleIndices[i] + 1; const b = geo.triangleIndices[i + 1] + 1; const c = geo.triangleIndices[i + 2] + 1; lines.push(`f ${a}/${a} ${b}/${b} ${c}/${c}`); } for (const p of geo.pointIndices) { lines.push(`p ${p + 1}`); }
    const blob = new Blob([lines.join("\n")], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `vst_lod${currentLodIndex}.obj`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }
  els.exportObjBtn.addEventListener("click", exportCurrentLodAsObj);

  // ------------------------------------------ testi info e pannelli collassabili
  //
  // Delegato su document: funziona anche per markup presente da subito nella
  // pagina, senza bisogno di riferimenti espliciti in els. Un pulsante "i"
  // mostra/nasconde il blocco di testo esplicativo collegato tramite
  // data-info="<id>"; un pulsante ▾/▸ collassa/espande un pannello tramite
  // data-collapse="<id>", aggiornando la propria freccia di conseguenza.
  document.addEventListener("click", (e) => {
    const infoBtn = e.target.closest(".info-btn");
    if (infoBtn) {
      const ids = infoBtn.dataset.info.split(/\s+/).filter(Boolean);
      const targets = ids.map(id => document.getElementById(id)).filter(Boolean);
      const nowHidden = targets.length ? !targets[0].hidden : true;
      for (const t of targets) t.hidden = nowHidden;
      return;
    }
    const collapseBtn = e.target.closest(".collapse-btn");
    if (collapseBtn) {
      const target = document.getElementById(collapseBtn.dataset.collapse);
      if (target) {
        target.hidden = !target.hidden;
        collapseBtn.textContent = target.hidden ? "▸" : "▾";
      }
    }
  });
  
  
  // ============================================================================
  // SEZIONE: RICERCA, DOWNLOAD E CONVERSIONE TEXTURE NASA
  // ============================================================================

  // ==========================================
  // 1. CONFIG PROXY
  // ==========================================
  const PROXY_BASE = "https://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=";
  function proxify(url) {
    return PROXY_BASE + encodeURIComponent(url);
  }

  // ==========================================
  // 2. STATO GLOBALE PER INFERENZA PERCORSO
  // ==========================================
  let inferredBaseHttpUrl = null;

  // ==========================================
  // 3. UI: CREAZIONE DINAMICA DELLE PROGRESS BAR
  // ==========================================
  function ensureProgressUI() {
    let container = document.getElementById("nasaProgressContainer");
    if (container) return container;

    container = document.createElement("div");
    container.id = "nasaProgressContainer";
    container.style.cssText = "margin-top: 10px; font-size: 0.85rem; color: var(--text, #e0e0e0);";

    const globalLabel = document.createElement("div");
    globalLabel.id = "progressGlobalText";
    globalLabel.textContent = "In attesa...";

    const globalBarWrap = document.createElement("div");
    globalBarWrap.style.cssText = "background:#3a404d; height:8px; border-radius:4px; overflow:hidden; margin-top:4px;";
    const globalBar = document.createElement("div");
    globalBar.id = "progressGlobalBar";
    globalBar.style.cssText = "background:#4caf50; height:100%; width:0%; transition: width 0.2s;";
    globalBarWrap.appendChild(globalBar);

    const singleLabel = document.createElement("div");
    singleLabel.id = "progressSingleText";
    singleLabel.textContent = "";
    singleLabel.style.marginTop = "8px";

    const singleBarWrap = document.createElement("div");
    singleBarWrap.style.cssText = "background:#3a404d; height:6px; border-radius:3px; overflow:hidden; margin-top:4px;";
    const singleBar = document.createElement("div");
    singleBar.id = "progressSingleBar";
    singleBar.style.cssText = "background:#2196f3; height:100%; width:0%; transition: width 0.2s;";
    singleBarWrap.appendChild(singleBar);

    container.appendChild(globalLabel);
    container.appendChild(globalBarWrap);
    container.appendChild(singleLabel);
    container.appendChild(singleBarWrap);

    const btn = document.getElementById("btnTextureDownload");
    if (btn && btn.parentNode) {
      btn.parentNode.insertBefore(container, btn.nextSibling);
    } else {
      document.body.appendChild(container);
    }
    return container;
  }

  function setGlobalProgress(done, total, extraText = "") {
    const bar = document.getElementById("progressGlobalBar");
    const text = document.getElementById("progressGlobalText");
    if (!bar || !text) return;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    bar.style.width = pct + "%";
    text.textContent = `Texture: ${done}/${total} (${pct}%)${extraText ? " — " + extraText : ""}`;
  }

  function setSingleProgress(loaded, total, fileName) {
    const bar = document.getElementById("progressSingleBar");
    const text = document.getElementById("progressSingleText");
    if (!bar || !text) return;
    if (total <= 0 || !Number.isFinite(total)) {
      bar.style.width = "100%";
      bar.style.animation = "none";
      text.textContent = `Scaricamento: ${fileName}...`;
      return;
    }
    const pct = Math.round((loaded / total) * 100);
    bar.style.width = pct + "%";
    text.textContent = `Scaricamento: ${fileName} — ${pct}% (${(loaded/1024).toFixed(0)}/${(total/1024).toFixed(0)} KB)`;
  }

  function clearSingleProgress() {
    const bar = document.getElementById("progressSingleBar");
    const text = document.getElementById("progressSingleText");
    if (bar) { bar.style.width = "0%"; }
    if (text) text.textContent = "";
  }

  // ==========================================
  // 4. VERIFICA ESISTENZA FILE (HEAD / Range fallback)
  // ==========================================
  async function checkUrlExists(httpUrl) {
    try {
      const resHead = await fetch(proxify(httpUrl), { method: "HEAD" }).catch(() => null);
      if (resHead && resHead.ok) return true;

      const resRange = await fetch(proxify(httpUrl), { 
        method: "GET", 
        headers: { "Range": "bytes=0-0" } 
      }).catch(() => null);
      if (resRange && (resRange.ok || resRange.status === 206)) return true;

      return false;
    } catch (e) {
      return false;
    }
  }

  // ==========================================
  // 5. DOWNLOAD CON PROGRESS TRACKING
  // ==========================================
  async function downloadWithProgress(httpUrl, onProgress) {
console.log("Scarico:", httpUrl.toLowerCase());    
    const res = await fetch(/*proxify(*/httpUrl.toLowerCase()/*)*/); // debug
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
console.log("Scaricato:", res)    
    const contentLength = res.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    if (!res.body || !res.body.getReader) {
      const blob = await res.blob();
console.log("Scaricato blob: ", blob)    
      if (onProgress) onProgress(blob.size, blob.size);
      return blob;
    }
    
    const reader = res.body.getReader();
    const chunks = [];
    let loaded = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      if (onProgress) onProgress(loaded, total);
    }
    
    return new Blob(chunks);
  }

  // ==========================================
  // 6. RICERCA API NASA (Fedele al codice funzionante + Logging dettagliato)
  // ==========================================
  function buildSearchQuery(fragment) {
    const escaped = fragment.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    return {
      query: {
        bool: {
          must: [
            {
              bool: {
                should: [
                  { regexp: { uri: { value: `.*${escaped}.*`, case_insensitive: true } } }
                ]
              }
            },
            { exists: { field: "gather.uri" } }
          ]
        }
      },
      from: 0,
      size: 1, // Usiamo 1 perché ci serve solo il primo risultato migliore per il download automatico
      sort: [
        { "gather.time.start_time": "desc", uri: "asc", release_id_num: "desc" }
      ],
      collapse: { field: "uri" },
      track_total_hits: true,
      _source: ["uri", "gather.uri"]
    };
  }

  function buildReadableUrl(uri) {
    const base = "https://pds-imaging.jpl.nasa.gov/api/data/";
    const safe = encodeURI(uri)
      .replace(/\?/g, "%3F")
      .replace(/#/g, "%23");
    return base + safe;
  }

  async function searchNasaTextureUrl(textureName) {
    console.log(`\n🔍 [API SEARCH] Avvio ricerca per: "${textureName}"`);
    
    const query = buildSearchQuery(textureName);
    console.log("📤 [API SEARCH] Query JSON inviata:", JSON.stringify(query, null, 2));

    const apiUrl = "https://pds-imaging.jpl.nasa.gov/api/search/atlas/_search";
    const proxyUrl = proxify(apiUrl);
    console.log(`🌐 [API SEARCH] URL Proxy richiesto: ${proxyUrl}`);

    try {
      const res = await fetch(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query)
      });

      console.log(`📥 [API SEARCH] Risposta HTTP: ${res.status} ${res.statusText}`);

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const data = await res.json();
      console.log("📦 [API SEARCH] Dati grezzi ricevuti (primi 500 char):", JSON.stringify(data).substring(0, 500) + "...");

      const total = typeof data.hits?.total === "object"
        ? data.hits.total.value
        : data.hits?.total;

      const hits = data.hits?.hits || [];
      console.log(`📊 [API SEARCH] Totale hit trovati: ${total}, mostrati: ${hits.length}`);

      if (hits.length > 0) {
        const s = hits[0]._source || {};
        const uri = s.uri || s["gather.uri"] || "";
        console.log(`🎯 [API SEARCH] URI estratto dal primo risultato: "${uri}"`);
        
        if (uri) {
          const finalUrl = buildReadableUrl(uri);
          console.log(`✅ [API SEARCH] URL finale costruito: ${finalUrl}`);
          
          // Aggiorna il percorso inferito per le texture successive
          const lastSlash = uri.lastIndexOf('/');
          if (lastSlash !== -1) {
            const baseUri = uri.substring(0, lastSlash + 1);
            inferredBaseHttpUrl = buildReadableUrl(baseUri);
            console.log(`💡 [API SEARCH] Percorso inferito aggiornato a: ${inferredBaseHttpUrl}`);
          }
          
          return finalUrl;
        }
      } else {
        console.log("⚠️ [API SEARCH] Nessun risultato trovato (hits.length === 0).");
      }
      return null;
    } catch (err) {
      console.error("❌ [API SEARCH] Errore critico durante la ricerca:", err);
      return null;
    }
  }
  
  // ==========================================
  // 6. RICERCA API NASA (Senza Regex, usa Wildcard per ricerca semplice)
  // ==========================================
  function buildSearchQuery(fragment) {
    return {
      query: {
        bool: {
          must: [
            {
              // Usiamo wildcard invece di regexp: è più sicuro, non richiede escaping 
              // e cerca semplicemente la stringa contenuta tra due asterischi (*)
              wildcard: {
                uri: {
                  value: `*${fragment}*`,
                  case_insensitive: true
                }
              }
            },
            { exists: { field: "gather.uri" } }
          ]
        }
      },
      from: 0,
      size: 1, // Ci serve solo il primo risultato migliore
      sort: [
        { "gather.time.start_time": "desc", uri: "asc", release_id_num: "desc" }
      ],
      collapse: { field: "uri" },
      track_total_hits: true,
      _source: ["uri", "gather.uri"]
    };
  }

  function buildReadableUrl(uri) {
    const base = "https://pds-imaging.jpl.nasa.gov/api/data/";
    const safe = encodeURI(uri)
      .replace(/\?/g, "%3F")
      .replace(/#/g, "%23");
    return base + safe;
  }

  async function searchNasaTextureUrl(textureName) {
    console.log(`\n🔍 [API SEARCH] Avvio ricerca per: "${textureName}"`);
    
    const query = buildSearchQuery(textureName);
    console.log("📤 [API SEARCH] Query JSON inviata:", JSON.stringify(query, null, 2));

    const apiUrl = "https://pds-imaging.jpl.nasa.gov/api/search/atlas/_search";
    const proxyUrl = apiUrl;//proxify(apiUrl);
    console.log(`🌐 [API SEARCH] URL Proxy richiesto: ${proxyUrl}`);

    try {
      const res = await fetch(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query)
      });

      console.log(`📥 [API SEARCH] Risposta HTTP: ${res.status} ${res.statusText}`);

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const data = await res.json();
      console.log("📦 [API SEARCH] Dati grezzi ricevuti (anteprima):", JSON.stringify(data).substring(0, 600) + "...");

      const total = typeof data.hits?.total === "object"
        ? data.hits.total.value
        : data.hits?.total;

      const hits = data.hits?.hits || [];
      console.log(`📊 [API SEARCH] Totale hit trovati: ${total}, mostrati: ${hits.length}`);

      if (hits.length > 0) {
        const s = hits[0]._source || {};
        const uri = s.uri || s["gather.uri"] || "";
        console.log(`🎯 [API SEARCH] URI estratto dal primo risultato: "${uri}"`);
        
        if (uri) {
          const finalUrl = buildReadableUrl(uri);
          console.log(`✅ [API SEARCH] URL finale costruito: ${finalUrl}`);
          
          // Aggiorna il percorso inferito per le texture successive
          const lastSlash = uri.lastIndexOf('/');
          if (lastSlash !== -1) {
            const baseUri = uri.substring(0, lastSlash + 1);
            inferredBaseHttpUrl = buildReadableUrl(baseUri);
            console.log(`💡 [API SEARCH] Percorso inferito aggiornato a: ${inferredBaseHttpUrl}`);
          }
          
          return finalUrl;
        }
      } else {
        console.log("⚠️ [API SEARCH] Nessun risultato trovato (hits.length === 0).");
      }
      return null;
    } catch (err) {
      console.error("❌ [API SEARCH] Errore critico durante la ricerca:", err);
      return null;
    }
  }   

  // ==========================================
  // 7. DECODER SGI IRIS (Corretto: non capovolge)
  // ==========================================
  function decodeSGI(arrayBuffer) {
    const dv = new DataView(arrayBuffer);
    if (dv.byteLength < 512) throw new Error('Header mancante o file troppo corto');
    const magic = dv.getUint16(0, false);
    if (magic !== 0x01DA) throw new Error('Magic diverso: non sembra un file IRIS RGB');
    const storage = dv.getUint8(2);
    const bpc = dv.getUint8(3);
    const xsize = dv.getUint16(6, false);
    const ysize = dv.getUint16(8, false);
    const zsize = dv.getUint16(10, false);

    if (storage === 1) throw new Error('RLE (storage=1) non supportato');
    if (bpc !== 1) throw new Error('Solo 8-bit per canale (bpc=1) supportati');
    if (xsize === 0 || ysize === 0) throw new Error('Dimensioni non valide');

    const headerSize = 512;
    const expected = xsize * ysize * zsize;
    const available = dv.byteLength - headerSize;
    if (available < expected) throw new Error(`Dati immagine incompleti: attesi ${expected} byte, trovati ${available}`);

    const data = new Uint8Array(arrayBuffer, headerSize);
    const canvas = document.createElement('canvas');
    canvas.width = xsize; canvas.height = ysize;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(xsize, ysize);
    const out = img.data;

    if (zsize === 1) {
      for (let y = 0; y < ysize; y++) {
        const sgiY = ysize - 1 - y; // FIX: SGI parte dal basso
        const rowOff = sgiY * xsize;
        for (let x = 0; x < xsize; x++) {
          const v = data[rowOff + x];
          const i = (y * xsize + x) * 4;
          out[i] = v; out[i+1] = v; out[i+2] = v; out[i+3] = 255;
        }
      }
    } else if (zsize >= 3) {
      const planeSize = xsize * ysize;
      for (let c = 0; c < 3; c++) {
        const planeOff = c * planeSize;
        for (let y = 0; y < ysize; y++) {
          const sgiY = ysize - 1 - y; // FIX: SGI parte dal basso
          const rowOff = sgiY * xsize;
          for (let x = 0; x < xsize; x++) {
            const v = data[planeOff + rowOff + x];
            const i = (y * xsize + x) * 4;
            out[i + c] = v;
            if (c === 2) out[i+3] = 255;
          }
        }
      }
    } else {
      throw new Error('zsize non gestito: ' + zsize);
    }
    ctx.putImageData(img, 0, 0);
    return { canvas, meta: { xsize, ysize, zsize, bpc, storage } };
  }

  // ==========================================
  // 8. CONVERTITORE FORMATI PLANETARI -> PNG
  // ==========================================
  function canvasToPngBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Impossibile generare il Blob PNG dal canvas"));
      }, 'image/png');
    });
  }

  async function convertPlanetaryToPngBlob(blob, fileName) {
    if (blob.type && (blob.type.startsWith('image/png') || blob.type.startsWith('image/jpeg') || blob.type.startsWith('image/webp'))) {
      return blob;
    }

    const arrayBuffer = await blob.arrayBuffer();

    try {
      if (arrayBuffer.byteLength >= 2) {
        const magic = new DataView(arrayBuffer).getUint16(0, false);
        if (magic === 0x01DA) {
          console.log(`[Decoder] Decodifica SGI IRIS in corso per: ${fileName}`);
          const result = decodeSGI(arrayBuffer);
          console.log(`[Decoder] ✅ SGI decodificato con successo: ${fileName}`);
          return await canvasToPngBlob(result.canvas);
        }
      }
    } catch (e) {
      console.warn(`[Decoder] Fallimento SGI per ${fileName}:`, e.message);
    }

    throw new Error(`FORMATO_NON_SUPPORTATO: Il file '${fileName}' non è un'immagine web valida né un formato SGI decodificabile.`);
  }

  // ==========================================
  // 9. APPLICA TEXTURE ALLA ENTRY (Blob locale)
  // ==========================================
  function applyTextureToEntry(entry, index, textureName, blob) {
    const objectUrl = URL.createObjectURL(blob);
    const babylonTexture = new BABYLON.Texture(objectUrl, scene, false, true);
    babylonTexture.crossOrigin = "anonymous";

    const old = entry.textureImages.get(index);
    if (old) {
      if (old.babylonTexture) old.babylonTexture.dispose();
      if (old.objectUrl) URL.revokeObjectURL(old.objectUrl);
    }

    entry.textureImages.set(index, {
      fileName: textureName,
      dataUrl: objectUrl,
      objectUrl: objectUrl,
      babylonTexture: babylonTexture
    });

    const targetMeshes = entry.meshes.filter(m => m.name === `pfb_${entry.id}_group_${index}`);
    targetMeshes.forEach(mesh => {
      if (mesh && mesh.material) {
        mesh.material.diffuseTexture = showTexture ? babylonTexture : null;
      }
    });

    const field = els.pfbTexturesList.children[index];
    if (field) {
      const label = field.querySelector(".field-label");
      if (label) {
        label.textContent = `${textureName} (OK)`;
        label.style.color = "#4caf50";
        label.style.fontWeight = "bold";
      }
    }
  }

  // ==========================================
  // 10. FUNZIONE PRINCIPALE: DOWNLOAD E APPLICAZIONE (con logging dettagliato)
  // ==========================================
  async function downloadAndApplyTextures() {
    ensureProgressUI();
    
    const entry = modelEntries.find(e => e.id === selectedEntryId);
    if (!entry || !entry.tree.textures || entry.tree.textures.length === 0) {
      setStatus("Nessuna texture da cercare per il modello selezionato.", "error");
      setGlobalProgress(0, 0);
      return;
    }

    const totalTextures = entry.tree.textures.length;
    let completedCount = 0;
    let apiSearchCount = 0;
    let directSuccessCount = 0;

    const pathInput = document.getElementById("inpTexturePath");
    let userBaseHttpUrl = pathInput ? pathInput.value.trim() : "";
    if (userBaseHttpUrl && !userBaseHttpUrl.endsWith("/")) {
      userBaseHttpUrl += "/";
    }

    console.log("═══════════════════════════════════════════════════════════");
    console.log("🚀 AVVIO RICERCA TEXTURE NASA");
    console.log(`📊 Texture totali da elaborare: ${totalTextures}`);
    console.log(`📁 Percorso utente fornito: ${userBaseHttpUrl || "(nessuno)"}`);
    console.log(`📁 Percorso inferito precedente: ${inferredBaseHttpUrl || "(nessuno)"}`);
    console.log("═══════════════════════════════════════════════════════════");

    setGlobalProgress(0, totalTextures, "avvio...");

    for (let i = 0; i < totalTextures; i++) {
      const tex = entry.tree.textures[i];
      const texName = tex.fileName || `texture_${i}`;
      
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📦 TEXTURE ${i + 1}/${totalTextures}: ${texName}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      setGlobalProgress(completedCount, totalTextures, `elaborazione: ${texName}`);

      const existing = entry.textureImages.get(i);
      if (existing && existing.babylonTexture) {
        console.log(`⏭️ SKIP: Texture già caricata in precedenza`);
        completedCount++;
        setGlobalProgress(completedCount, totalTextures, `saltata: ${texName}`);
        continue;
      }

      let resolvedHttpUrl = null;
      let methodUsed = "none";

      // Helper per capire la camera dal nome file (convenzione MER)
      const isNavcam = texName.toLowerCase().includes('2n') || texName.toLowerCase().includes('mer2no');
      const isPancam = texName.toLowerCase().includes('2p') || texName.toLowerCase().includes('mer2po');
      const isHazcam = texName.toLowerCase().includes('2h') || texName.toLowerCase().includes('mer2ho');

      // TENTATIVO 1: Percorso utente (se fornito, ha la priorità assoluta)
      if (userBaseHttpUrl) {
        const testUrl = userBaseHttpUrl + encodeURI(texName).replace(/#/g, "%23");
        console.log(`🔍 Tentativo 1 - Percorso utente: ${testUrl}`);
        if (await checkUrlExists(testUrl)) {
          console.log(`✅ Trovata (percorso utente): ${testUrl}`);
          resolvedHttpUrl = testUrl;
          methodUsed = "user-path";
          directSuccessCount++;
          inferredBaseHttpUrl = userBaseHttpUrl; 
        }
      }

      // TENTATIVO 2: Percorso inferito (SOLO se ha senso con la camera del file)
      if (!resolvedHttpUrl && inferredBaseHttpUrl && inferredBaseHttpUrl !== userBaseHttpUrl) {
        // Controllo di coerenza: se il file è Navcam ma il percorso inferito è Pancam, salta l'inferenza!
        let skipInference = false;
        if (isNavcam && !inferredBaseHttpUrl.toLowerCase().includes('navcam') && !inferredBaseHttpUrl.toLowerCase().includes('mer2no')) skipInference = true;
        if (isPancam && !inferredBaseHttpUrl.toLowerCase().includes('pancam') && !inferredBaseHttpUrl.toLowerCase().includes('mer2po')) skipInference = true;
        if (isHazcam && !inferredBaseHttpUrl.toLowerCase().includes('hazcam') && !inferredBaseHttpUrl.toLowerCase().includes('mer2ho')) skipInference = true;

        if (skipInference) {
          console.log(`⏭️ SKIP Inferenza: Il file sembra ${isNavcam ? 'Navcam' : isPancam ? 'Pancam' : 'Hazcam'}, ma il percorso inferito no.`);
        } else {
          const testUrl = inferredBaseHttpUrl + encodeURI(texName).replace(/#/g, "%23");
          console.log(`🔍 Tentativo 2 - Percorso inferito: ${testUrl}`);
          if (await checkUrlExists(testUrl)) {
            console.log(`✅ Trovata (percorso inferito): ${testUrl}`);
            resolvedHttpUrl = testUrl;
            methodUsed = "inferred";
            directSuccessCount++;
          }
        }
      }

      // TENTATIVO 3: Ricerca API (Fallback o se l'inferenza è stata saltata)
      if (!resolvedHttpUrl) {
        console.log(`🔍 Tentativo 3 - Ricerca API NASA per: ${texName}`);
        apiSearchCount++;
        setGlobalProgress(completedCount, totalTextures, `ricerca API: ${texName}`);
        
        const foundUrl = await searchNasaTextureUrl(texName);
        if (foundUrl) {
          console.log(`✅ Trovata (via API): ${foundUrl}`);
          resolvedHttpUrl = foundUrl;
          methodUsed = "api";
        }
      }

      // DOWNLOAD E CONVERSIONE
      if (resolvedHttpUrl) {
        console.log(`📥 AVVIO DOWNLOAD da: ${resolvedHttpUrl}`);
        try {
          const rawBlob = await downloadWithProgress(resolvedHttpUrl, (loaded, total) => {
            setSingleProgress(loaded, total, texName);
          });
          
          console.log(`✅ DOWNLOAD COMPLETATO - Dimensione: ${(rawBlob.size / 1024).toFixed(2)} KB, MIME: ${rawBlob.type || "(non specificato)"}`);
          
          // 💾 SALVATAGGIO LOCALE
          try {
            const downloadUrl = URL.createObjectURL(rawBlob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = texName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
          } catch (saveErr) {
            console.warn(`⚠️ Errore salvataggio locale:`, saveErr.message);
          }
          
          // CONVERSIONE
          let finalBlob = null;
          let conversionSuccess = false;
          
          try {
            finalBlob = await convertPlanetaryToPngBlob(rawBlob, texName);
            conversionSuccess = true;
            console.log(`✅ CONVERSIONE COMPLETATA - Dimensione PNG: ${(finalBlob.size / 1024).toFixed(2)} KB`);
          } catch (convErr) {
            console.error(`❌ CONVERSIONE FALLITA: ${convErr.message}`);
            
            // 🚨 FIX CRUCIALE: Se abbiamo usato il percorso inferito e ha fallito, 
            // significa che era un falso positivo (es. pagina HTML di errore).
            // Cancelliamo l'inferenza e forziamo la ricerca API per questo file!
            if (methodUsed === "inferred") {
              console.log(`🔄 L'inferenza era sbagliata. Cancello percorso inferito e riprovo con API...`);
              inferredBaseHttpUrl = null; 
              methodUsed = "none"; // Reset per forzare il blocco API qui sotto
            }
          }

          // Se la conversione è fallita E abbiamo annullato l'inferenza, riprova SUBITO con l'API
          if (!conversionSuccess && methodUsed === "none") {
             console.log(`🔍 Tentativo 3 (Ritardo) - Ricerca API NASA per: ${texName}`);
             apiSearchCount++;
             const foundUrl = await searchNasaTextureUrl(texName);
             if (foundUrl) {
               console.log(`✅ Trovata (via API di recupero): ${foundUrl}`);
               // Ripeti il download con l'URL corretto
               const retryBlob = await downloadWithProgress(foundUrl, (loaded, total) => setSingleProgress(loaded, total, texName));
               try {
                 finalBlob = await convertPlanetaryToPngBlob(retryBlob, texName);
                 conversionSuccess = true;
                 methodUsed = "api";
               } catch (e) {
                 console.error(`❌ Anche la ricerca API ha restituito un file non valido per ${texName}`);
               }
             }
          }

          // APPLICAZIONE A BABYLON.JS
          if (conversionSuccess && finalBlob) {
            console.log(`🎨 APPLICAZIONE TEXTURE al modello`);
            applyTextureToEntry(entry, i, texName, finalBlob);
            completedCount++;
            setGlobalProgress(completedCount, totalTextures, `✓ ${texName} (${methodUsed})`);
            clearSingleProgress();
          } else {
            console.log(`⚠️ Texture NON applicata (nessun metodo ha restituito un file valido)`);
            completedCount++;
            setGlobalProgress(completedCount, totalTextures, `✗ fallita: ${texName}`);
            clearSingleProgress();
          }
          
        } catch (err) {
          console.error(`❌ ERRORE CRITICO durante il download:`, err);
          completedCount++;
          setGlobalProgress(completedCount, totalTextures, `✗ errore download: ${texName}`);
          clearSingleProgress();
        }
      } else {
        console.log(`❌ TEXTURE NON TROVATA con nessun metodo`);
        completedCount++;
        setGlobalProgress(completedCount, totalTextures, `✗ non trovata: ${texName}`);
      }
    }
    
    clearSingleProgress();
    setGlobalProgress(completedCount, totalTextures, `completato`);

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🏁 RICERCA COMPLETATA");
    console.log(`📊 Riepilogo finale:`);
    console.log(`   - Texture elaborate: ${completedCount}/${totalTextures}`);
    console.log(`   - Scaricate direttamente: ${directSuccessCount}`);
    console.log(`   - Trovate via API: ${apiSearchCount}`);
    console.log("═══════════════════════════════════════════════════════════\n");

    const summary = `${completedCount}/${totalTextures} texture · ${directSuccessCount} scaricate direttamente · ${apiSearchCount} via API`;
    setStatus(`Ricerca completata: ${summary}`, completedCount > 0 ? "ok" : "idle");
  }

  // ==========================================
  // 11. LISTENER PULSANTE
  // ==========================================
  const btnTextureDownload = document.getElementById("btnTextureDownload");
  if (btnTextureDownload) {
    btnTextureDownload.addEventListener("click", () => {
      btnTextureDownload.disabled = true;
      const originalText = btnTextureDownload.textContent || "Cerca Texture NASA";
      btnTextureDownload.textContent = "Elaborazione...";
      
      downloadAndApplyTextures().finally(() => {
        btnTextureDownload.disabled = false;
        btnTextureDownload.textContent = originalText;
      });
    });
  } else {
    console.warn("⚠️ Pulsante 'btnTextureDownload' non trovato nel DOM.");
  }  
  
/////////////////////
  // ============================================================================
  // SEZIONE: CARICAMENTO MULTIPLO TEXTURE DA LOCALE
  // ============================================================================

  // ==========================================
  // 12. FUNZIONE PRINCIPALE: CARICA TEXTURE LOCALI
  // ==========================================
  async function loadLocalTextures(fileList) {
    const entry = modelEntries.find(e => e.id === selectedEntryId);
    if (!entry || !entry.tree.textures || entry.tree.textures.length === 0) {
      setStatus("Nessun modello PFB selezionato a cui applicare le texture.", "error");
      return;
    }

    const files = Array.from(fileList);
    if (files.length === 0) {
      setStatus("Nessun file selezionato.", "idle");
      return;
    }

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("📁 CARICAMENTO TEXTURE DA LOCALE");
    console.log(`📊 File selezionati: ${files.length}`);
    console.log(`🎯 Texture richieste dal modello: ${entry.tree.textures.length}`);
    console.log("═══════════════════════════════════════════════════════════");

    setStatus(`Elaborazione di ${files.length} file locali in corso...`, "idle");

    // Costruisce una mappa indicizzata per nome (lowercase) delle texture richieste
    const requiredTextures = new Map();
    entry.tree.textures.forEach((tex, index) => {
      const name = (tex.fileName || `texture_${index}`).toLowerCase();
      requiredTextures.set(name, { index, tex });
    });

    let appliedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const skippedFiles = [];
    const appliedFiles = [];

    for (const file of files) {
      // Normalizza il nome: estrae solo il nome file (senza percorso) e lowercase
      const rawName = file.name;
      const baseName = rawName.split(/[\\/]/).pop(); // Gestisce sia / che \ (Windows)
      const normalizedName = baseName.toLowerCase();

      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📄 FILE LOCALE: ${rawName}`);
      console.log(`   → Nome normalizzato: ${normalizedName}`);
      console.log(`   → Dimensione: ${(file.size / 1024).toFixed(2)} KB`);
      console.log(`   → MIME type: ${file.type || "(non specificato)"}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      // Verifica se il file corrisponde a una texture richiesta
      const match = requiredTextures.get(normalizedName);
      if (!match) {
        console.log(`⏭️ SKIP: Nessun match con le texture richieste dal modello`);
        skippedCount++;
        skippedFiles.push(baseName);
        continue;
      }

      console.log(`✅ MATCH TROVATO: corrisponde a texture #${match.index} (${match.tex.fileName})`);

      try {
        // Tenta la conversione (SGI IRIS → PNG)
        console.log(`🔄 Conversione in corso...`);
        const finalBlob = await convertPlanetaryToPngBlob(file, baseName);
        console.log(`✅ Conversione completata — Dimensione PNG: ${(finalBlob.size / 1024).toFixed(2)} KB`);

        // Applica al modello
        console.log(`🎨 Applicazione al modello...`);
        applyTextureToEntry(entry, match.index, baseName, finalBlob);
        
        appliedCount++;
        appliedFiles.push(baseName);
        console.log(`✅ TEXTURE APPLICATA con successo`);

      } catch (err) {
        console.error(`❌ ERRORE conversione/applicazione per ${baseName}:`, err.message);
        errorCount++;
      }
    }

    // Riepilogo finale
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🏁 CARICAMENTO LOCALE COMPLETATO");
    console.log(`📊 Riepilogo:`);
    console.log(`   - File analizzati: ${files.length}`);
    console.log(`   - ✓ Texture applicate: ${appliedCount}`);
    console.log(`   - ⏭️ File ignorati (nessun match): ${skippedCount}`);
    console.log(`   - ❌ Errori: ${errorCount}`);
    
    if (skippedFiles.length > 0 && skippedFiles.length <= 10) {
      console.log(`   📋 File ignorati: ${skippedFiles.join(", ")}`);
    } else if (skippedFiles.length > 10) {
      console.log(`   📋 Primi 10 ignorati: ${skippedFiles.slice(0, 10).join(", ")}... (+${skippedFiles.length - 10} altri)`);
    }
    console.log("═══════════════════════════════════════════════════════════\n");

    // Messaggio di stato visibile all'utente
    let statusMsg = `Locale: ${appliedCount} applicate`;
    if (skippedCount > 0) statusMsg += `, ${skippedCount} ignorati`;
    if (errorCount > 0) statusMsg += `, ${errorCount} errori`;
    
    setStatus(statusMsg, appliedCount > 0 ? "ok" : (errorCount > 0 ? "error" : "idle"));
  }

  // ==========================================
  // 13. LISTENER PER INPUT FILE MULTIPLO LOCALE
  // ==========================================
  const btnLocalTextures = document.getElementById("btnLocalTextures");
  const inpLocalTextures = document.getElementById("inpLocalTextures");

  if (btnLocalTextures && inpLocalTextures) {
    // Click sul pulsante → apre il selettore file
    btnLocalTextures.addEventListener("click", () => {
      inpLocalTextures.click();
    });

    // Selezione dei file completata
    inpLocalTextures.addEventListener("change", (ev) => {
      const files = ev.target.files;
      if (!files || files.length === 0) return;
      
      // Disabilita il pulsante durante l'elaborazione
      btnLocalTextures.disabled = true;
      const originalText = btnLocalTextures.textContent || "📁 Carica Texture Locali";
      btnLocalTextures.textContent = "Elaborazione...";
      
      loadLocalTextures(files).finally(() => {
        btnLocalTextures.disabled = false;
        btnLocalTextures.textContent = originalText;
        // Reset dell'input per permettere di ricaricare gli stessi file se necessario
        inpLocalTextures.value = "";
      });
    });
  } else {
    console.warn("⚠️ Elementi 'btnLocalTextures' e/o 'inpLocalTextures' non trovati nel DOM.");
  }
    
  
})();