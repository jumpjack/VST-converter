// Constants and utility functions

// Geoset Binding
const BindNames = {
    0 : "undefined",
    1: "PFGS_OFF",
    2: "PFGS_PER_VERTEX",
    3: "PFGS_PER_PRIM",
    4: "PFGS_OVERALL"
};

// Primitive types
const PrimTypeNames = {
    0:  "undefined",
    1: "PFGS_TRISTRIPS",
    2: "PFGS_TRIS",
    3: "PFGS_POINTS",
    4: "PFGS_LINES",
    5: "PFGS_LINESTRIPS",
    6: "PFGS_FLAT_LINESTRIPS",
    7: "PFGS_QUADS",
    8: "PFGS_FLAT_TRISTRIPS",
    9: "PFGS_POLYS",
   10: "PFGS_TRIFANS",
   11: "PFGS_FLAT_TRIFANS"
};

// On/Off
const OO = {
    0: "PF_OFF",
    1: "PF_ON"
};

const DrawModeNames = {
    2: "PFGS_FLATSHADE",
    3: "PFGS_WIREFRAME",
    4: "PFGS_COMPILE_GL",
    6: "PFGS_DRAW_GLOBJ"
};

const BBoxModeNames = {
    1: "PFBOUND_STATIC",
    2: "PFBOUND_DYNAMIC"
};

const L_NAMES = {
  0: "Material",1:"Texture",2:"TexEnv",3:"GeoState",4:"Length List",5:"Vertex List",
  6:"Color List",7:"Normal List",8:"TexCoord List",9:"Index List",10:"GeoSet",11:"User Data",12:"Node"
};

const NodeTypes = [
    "LightPoint", "Text", "Geode", "Billboard", "LightSource", "Group", "SCS", "DCS",
    "Partition", "Scene", "Switch", "LOD", "Sequence", "Layer", "Morph", "ASD", "FCS",
    "DoubleDCS", "DoubleFCS", "DoubleSCS", "IBRnode", "SubdivSurface", "TorusSurface",
    "NurbsSurface", "NurbCurve2d", "Line2d", "PieceWisePolyCurve2d", "PieceWisePolySurface",
    "PlaneSurface", "SphereSurface", "ConeSurface", "CylinderSurface", "Line3d",
    "NurbCurve3d", "PieceWisePolyCurve3d", "HsplineSurface", "SweptSurface",
    "FrenetSweptSurface", "CoonsSurface", "CompositeCurve3d", "Circle2d", "SuperQuadCurve2d",
    "RuledSurface", "Circle3d", "SuperQuadCurve3d", "OrientedLine3d"
];

const N_CUSTOM = 0x10000000;
const N_CUSTOM_MASK = 0x0fff0000;
const N_CUSTOM_SHIFT = 16;

const PFBOUND_DYNAMIC = 1;
const PFB_SWITCH_OFF = -2;
const PFB_SWITCH_ON = -1;

const NODE_NAMES = [
  "LightPoint", "Text", "Geode", "Billboard", "LightSource", "Group", "SCS", "DCS",
  "Partition", "Scene", "Switch", "LOD", "Sequence", "Layer", "Morph", "ASD", "FCS",
  "DoubleDCS", "DoubleFCS", "DoubleSCS", "IBRnode", "SubdivSurface", "TorusSurface",
  "NurbsSurface", "NurbCurve2d", "Line2d", "PieceWisePolyCurve2d", "PieceWisePolySurface",
  "PlaneSurface", "SphereSurface", "ConeSurface", "CylinderSurface", "Line3d",
  "NurbCurve3d", "PieceWisePolyCurve3d", "HsplineSurface", "SweptSurface",
  "FrenetSweptSurface", "CoonsSurface", "CompositeCurve3d", "Circle2d", "SuperQuadCurve2d",
  "RuledSurface", "Circle3d", "SuperQuadCurve3d", "OrientedLine3d"
];

const SLIST_IDS = new Set([4,5,6,7,8,9]);
const UNIT_SIZES = { L_LLIST:4, L_VLIST:12, L_CLIST:16, L_NLIST:12, L_TLIST:8, L_ILIST:2 };

// Utility functions
function readInt32v(view, offset, little) { return view.getInt32(offset, little); }
function readUint32v(view, offset, little) { return view.getUint32(offset, little); }
function readFloat32v(view, offset, little) { return view.getFloat32(offset, little); }
function toHex32(n) { return '0x' + (n >>> 0).toString(16).padStart(8,'0'); }

function bytesToHex(bytes, maxChars) {
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
  if (maxChars && hex.length > maxChars) return hex.slice(0,maxChars) + '...';
  return hex;
}

function bytesToTextString(bytes) {
  let out = "";
  for (let i=0;i<bytes.length;i++){
    const b = bytes[i];
    if (b >= 32 && b <= 126) out += String.fromCharCode(b); else out += ".";
  }
  return out;
}

function toInt32LE(raw) {
    const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
    const count = raw.byteLength / 4;
    const result = [];
    for (let i = 0; ((i < count - 32) && (i + 4 < count - 32)); i++) {
        result.push(view.getInt32(i * 4, true));
    }
    return result;
}

function toHex32LE(raw) {
    const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
    const count = raw.byteLength / 4;
    const result = [];
    for (let i = 0; ((i < count - 32) && (i + 4 < count - 32)); i++) {
        const val = view.getUint32(i * 4, true);
        result.push("0x" + val.toString(16).padStart(8, "0"));
    }
    return result;
}

function th(txt) {
    const e = document.createElement("th");
    e.textContent = txt;
    e.style.border = "1px solid #777";
    e.style.padding = "4px 6px";
    e.style.background = "#eee";
    return e;
}

function td(txt) {
    const e = document.createElement("td");
    e.textContent = txt;
    e.style.border = "1px solid #ccc";
    e.style.padding = "4px 6px";
    return e;
}

function getListByName(json, targetName) {
    if (!json || !Array.isArray(json.lists)) return null;
    const name = targetName.toLowerCase();
    return json.lists.find(item =>
        item &&
        typeof item.list_name === "string" &&
        item.list_name.toLowerCase() === name
    ) || null;
}