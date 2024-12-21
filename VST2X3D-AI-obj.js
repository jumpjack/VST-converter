/* 0.10.0
 * added routines  to convert to obj, BROKEN CONVERSION TO X3D!!!
 * *

/* 0.7.0
 * Added list of links to raw textures, jpg textures, textures folders
*/



/* 0.6.0 update:
 * Implemented extraction of texture from .IMG loaded together with VST locally;
   * known bug: kaitai struct does not support yet this file format:
   * FORMAT='HALF' <<<<<<<<<<<
   * TYPE='IMAGE'
   * BUFSIZ=512
   * DIM=3 <<<<<<<<<
   * EOL=0
   * RECSIZE=512
   * ORG='BSQ'
   * NL=256
   * NS=256
   * NB=1 <<<<<<<<<<<<
   * N1=256
   * N2=256
*/
BASE_IMG_URL = "";
//BASE_IMG_URL_NAVCAM = "https://planetarydata.jpl.nasa.gov/w10n/mer2-m-navcam-5-disparity-ops-v1.0/mer2no_0xxx/";
BASE_IMG_URL_NAVCAM = "https://planetarydata.jpl.nasa.gov/img/data/mer/spirit/mer2no_0xxx/";
BASE_IMG_URL_PANCAM = "https://planetarydata.jpl.nasa.gov/img/data/mer/spirit/mer2po_0xxx/";
BASE_IMG_URL_HAZCAM = "https://planetarydata.jpl.nasa.gov/img/data/mer/spirit/mer2ho_0xxx/";
IMG_RAW_FOLDER = "data/";
IMG_JPG_FOLDER = "browse/";
SOL_FOLDER = "sol#SOLNUMBER#/rdr/"; // sol must be determined from VST // DEBUG!!   (Sol number is in .lbl of .vst file)
BASE_VST_URL = "https://planetarydata.jpl.nasa.gov/img/data/mer/spirit/mer2mw_0xxx/";
VST_CAMERA_FOLDER = "data/navcam/"; // (navcam --> mer2no_0xxx for images) // DEBUG: add other cameras!
VST_FOLDER_SITE_NAME = "site0137/";  // DEBUG! Site number is in filename (137=B1)
product_name_no_ext = "2n292378085vilb128f0006l0m1"; // 2n292377885vilb126f0006l0m1 = small vst for testing, sol 1870  // DEBUG
//     2n292377885vilb126f0006l0m1
//     2n292378085vilb128f0006l0m1
base_VST_filename = BASE_VST_URL + VST_CAMERA_FOLDER + VST_FOLDER_SITE_NAME + product_name_no_ext;

let angles = 0;
let solNumber = 0;
let x3d = null;
wireframeEnabled = false;
let rawIMGfileContents = null;
let extractedVicarData = "";


let filesObj = [];
let filesMtl = [];
let filesTexture = [];



const   OPPORTUNITY = "1"; // First letter of filename
const   SPIRIT = "2";
const   roverName = ["","opportunity", "spirit"];

 proxyURL = "https://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=";

x3dShapes = [];
rotatedShapes = [];

const graphicalProducts = [
 "RAD",
 "RAL",
 "RSL",
 "EFF",
 "ESF",
 "EDN",
 "ILF",
 "ILL",
 "FFL",
 "MRD",
 "MRL",
 "RFD",
 "RFL",
 "IOF",
 "IOL",
 "IFF",
 "IFL",
 "IFS",
 "CCD",
 "CCL",
 "CFD",
 "CFL",
 "ITH",
 "THN"
];


            let lods = [];


// Strutture dati VST
class VSTHeader {
    constructor(dataView, offset = 0) {
        this.label = dataView.getInt32(offset, true);
        this.byteOrder = dataView.getInt32(offset + 4, true);
        this.versionMajor = dataView.getInt32(offset + 8, true);
        this.versionMinor = dataView.getInt32(offset + 12, true);
        this.implementation = dataView.getInt32(offset + 16, true);
        this.res1 = dataView.getInt32(offset + 20, true);
        this.res2 = dataView.getInt32(offset + 24, true);
        this.textureNum = dataView.getInt32(offset + 28, true);
        this.vertexNum = dataView.getInt32(offset + 32, true);
        this.lodNum = dataView.getInt32(offset + 36, true);

        // Gestione byte order
        if (this.byteOrder === 0x00010203) {
            this.reverseValues();
        }
    }

    reverseValues() {
        this.versionMajor = this.reverseInt32(this.versionMajor);
        this.versionMinor = this.reverseInt32(this.versionMinor);
        this.textureNum = this.reverseInt32(this.textureNum);
        this.vertexNum = this.reverseInt32(this.vertexNum);
        this.lodNum = this.reverseInt32(this.lodNum);
    }

    reverseInt32(value) {
        return ((value & 0xFF) << 24) |
               ((value & 0xFF00) << 8) |
               ((value & 0xFF0000) >>> 8) |
               ((value & 0xFF000000) >>> 24);
    }
}

class BoundingBox {
    constructor(dataView, offset = 0, needsReverse = false) {
        this.xMin = dataView.getFloat32(offset, true);
        this.yMin = dataView.getFloat32(offset + 4, true);
        this.zMin = dataView.getFloat32(offset + 8, true);
        this.xMax = dataView.getFloat32(offset + 12, true);
        this.yMax = dataView.getFloat32(offset + 16, true);
        this.zMax = dataView.getFloat32(offset + 20, true);

        if (needsReverse) {
            this.reverseValues();
        }
    }

    reverseValues() {
        [this.xMin, this.yMin, this.zMin, this.xMax, this.yMax, this.zMax] =
        [this.xMin, this.yMin, this.zMin, this.xMax, this.yMax, this.zMax].map(this.reverseFloat32);
    }

    reverseFloat32(value) {
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        view.setFloat32(0, value, true);
        return view.getFloat32(0, false);
    }
}

class Vertex {
    constructor(dataView, offset = 0, needsReverse = false) {
        this.tx = dataView.getFloat32(offset, true);
        this.ty = dataView.getFloat32(offset + 4, true);
        this.x = dataView.getFloat32(offset + 8, true);
        this.y = dataView.getFloat32(offset + 12, true);
        this.z = dataView.getFloat32(offset + 16, true);

        if (needsReverse) {
            this.reverseValues();
        }
    }

    reverseValues() {
        [this.tx, this.ty, this.x, this.y, this.z] =
        [this.tx, this.ty, this.x, this.y, this.z].map(this.reverseFloat32);
    }

    reverseFloat32(value) {
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        view.setFloat32(0, value, true);
        return view.getFloat32(0, false);
    }
}

class LODHeader {
    constructor(dataView, offset = 0, needsReverse = false) {
        this.size = dataView.getInt32(offset, true);
        this.res1 = dataView.getInt32(offset + 4, true);
        this.res2 = dataView.getInt32(offset + 8, true);
        this.vertexNum = dataView.getInt32(offset + 12, true);
        this.distThreshold = dataView.getFloat32(offset + 16, true);
        this.patchNum = dataView.getInt32(offset + 20, true);
        this.vertMax = dataView.getInt32(offset + 24, true);

        if (needsReverse) {
            this.reverseValues();
        }
    }

    reverseValues() {
        this.patchNum = this.reverseInt32(this.patchNum);
        this.vertexNum = this.reverseInt32(this.vertexNum);
        this.vertMax = this.reverseInt32(this.vertMax);
        this.distThreshold = this.reverseFloat32(this.distThreshold);
    }

    reverseInt32(value) {
        return ((value & 0xFF) << 24) |
               ((value & 0xFF00) << 8) |
               ((value & 0xFF0000) >>> 8) |
               ((value & 0xFF000000) >>> 24);
    }

    reverseFloat32(value) {
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        view.setFloat32(0, value, true);
        return view.getFloat32(0, false);
    }
}

class PatchHeader {
    constructor(dataView, offset = 0, needsReverse = false) {
        this.res1 = dataView.getInt32(offset, true);
        this.res2 = dataView.getInt32(offset + 4, true);
        this.pointCloud = dataView.getInt32(offset + 8, true);
        this.texture = dataView.getInt32(offset + 12, true);
        this.arrayNum = dataView.getInt32(offset + 16, true);
        this.totalVertexNum = dataView.getInt32(offset + 20, true);

        if (needsReverse) {
            this.reverseValues();
        }
    }

    reverseValues() {
        this.pointCloud = this.reverseInt32(this.pointCloud);
        this.arrayNum = this.reverseInt32(this.arrayNum);
        this.texture = this.reverseInt32(this.texture);
        this.totalVertexNum = this.reverseInt32(this.totalVertexNum);
    }

    reverseInt32(value) {
        return ((value & 0xFF) << 24) |
               ((value & 0xFF00) << 8) |
               ((value & 0xFF0000) >>> 8) |
               ((value & 0xFF000000) >>> 24);
    }
}

class VSTParser {
    constructor(arrayBuffer) {
        this.dataView = new DataView(arrayBuffer);
        this.offset = 0;
        this.textureFiles = [];
        this.vertices = [];
    }

    async parse(imgFiles, lblFiles) {                  //////// <<<<<<<<<<<<<<<<<<<<<------------------------ VST PARSER
console.log("VST parsing - IMG:", imgFiles, ", LBL:",lblFiles);
        const fileProgressBar = document.getElementById('fileProgressBar');
        fileProgressBar.value = 0; // Resetta la barra di progresso
        const totalSteps = 8; // Numero totale di passi significativi (puoi aggiungerne altri)
        let currentStep = 0;
        const advanceProgress = async (stepMessage) => {
            currentStep++;
            fileProgressBar.value = Math.round((currentStep / totalSteps) * 100);
            await new Promise(resolve => setTimeout(resolve, 0)); // Permetti aggiornamenti in tempo reale
        };

        try {
            // Parse header
            const header = new VSTHeader(this.dataView, this.offset);
            this.offset += 40; // Size of VSTHeader


            // Validate VST format
            if (header.label !== 0x00545356) throw new Error('Invalid VST file format');
            if (header.implementation !== 0x0052454D) throw new Error('Implementation MER expected');
await advanceProgress("HEADER2 - Header parsed");

            const needsReverse = header.byteOrder === 0x00010203;

            ////////////////// Parse bounding box
            const bbox = new BoundingBox(this.dataView, this.offset, needsReverse);
            this.offset += 24; // Size of BoundingBox


            ////////////// Parse texture references
            for (let i = 0; i < header.textureNum; i++) {
                let imgFileFound = false;
                let imgContents = "";
                let labelContents = "";
                let textureBASE64 = "error";
                angles = null;
                let VSTlabel = "";

                const textureBytes = new Uint8Array(this.dataView.buffer, this.offset, 2048);
                const textureRef = String.fromCharCode.apply(null, textureBytes);
console.log("PARSE REF=",textureRef.split("\x00")[1] + "/" + textureRef.split("\x00")[2]);

                let textureName = textureRef.substring(10, 37) + '.img.jpg';
                textureName = textureName.substring(0, 23) + "l" + textureName.substring(24); // Force left camera for texture
                textureName = textureName.substring(0, 26) + "1" + textureName.substring(27); // Force version 1 for IMG product
console.log("PARSE textureName=",textureName);

                const secondChar = textureName.charAt(1).toLowerCase();
                if (secondChar === 'n') {
                  BASE_IMG_URL = BASE_IMG_URL_NAVCAM
                } else if (secondChar === 'p') {
                  BASE_IMG_URL =  BASE_IMG_URL_PANCAM
                } else if ((secondChar === 'r') || (secondChar === 'f') ) {
                  BASE_IMG_URL =  BASE_IMG_URL_HAZCAM
                } else {
                  throw new Error("Carattere non riconosciuto '" + secondChar  + "' per determinare la cartella della fotocamera."); // Gestione errore
                }

                let textureUrlLeft = textureName.substring(0, 11);
                let textureUrlRight = textureName.substring(14);
                let currentVSTProductID = (textureName.substring(0, 11) + "vil" + textureName.substring(14, 27)).toLowerCase(); // 2n294774058vilb1cup0783l0m1
                let currentRAWIMGProductID = textureRef.substring(10, 37);
                let siteNumberCoded = textureName.substr(14, 2);
                let siteNumberString = "site0" + siteCodeToString(siteNumberCoded);
                if (lblFiles.length === 0) {
                    // Local file not available, download; .LBL file is located in .VST folder, which depends on site number, which is coded into .VST filename:
                    VSTlabel = await downloadLBL(currentVSTProductID + ".lbl", siteNumberString);
                    saveRawContents(VSTlabel, currentVSTProductID + ".lbl");
                } else {
console.log("Retrieving sol from local .LBL file associated to local .VST file...");
                  for (const file of lblFiles) {
                      const fileName = file.name.toUpperCase();
                      let suggestedFilename = currentVSTProductID.toUpperCase() + ".LBL";
  console.log("    Testing  file: " , fileName);
  console.log("    Required :     " ,  suggestedFilename);
                      if (fileName.substring(0,23) === suggestedFilename.substring(0,23)) { // disregard version and left/rigth match
  console.log("           File match, getting sol...");
                          VSTlabel = await loadLocalLabel(file);
  //console.log("           retrived sol:", solNumber);
                          break; // Exit loop once file is found
                      } else {
  console.log("           No match, skipping.");
                      }
                  }
                } // End processing local .IMG label

                solNumber = extractSol(VSTlabel);

console.log("SOLNUMBER=",solNumber);


                let base_texture_folder = BASE_IMG_URL + IMG_JPG_FOLDER + SOL_FOLDER;
                let base_texture_folderNew = base_texture_folder.replace("#SOLNUMBER#",solNumber);
                let base_raw_texture_folder = base_texture_folder.replace("#SOLNUMBER#",solNumber).replace("browse","data");


console.log("PARSE - Folder for texture:",base_texture_folderNew);
                spnProcessed.innerHTML += `Texture: ` +
                ` <a href="` + base_raw_texture_folder + currentRAWIMGProductID.toLowerCase() + `.img">raw</a>`+
                `, <a href="` + base_texture_folderNew + currentRAWIMGProductID.toLowerCase() + `.img.jpg">jpg</a>`+
                `, <a href="` + base_texture_folderNew + `">folder</a><br>`;


console.log("currentRAWIMGProductID=",currentRAWIMGProductID);
console.log("Number of local files available:", imgFiles.length);

                let currentRAWIMGfileName = currentRAWIMGProductID + ".IMG";

                for (let productIndex = 0; ((productIndex < graphicalProducts.length) && (textureBASE64 === "error") && (imgFileFound === false)); productIndex++) {
                  let textureVariant = graphicalProducts[productIndex];
console.log("productIndex=",productIndex, ", product variant: ", textureVariant);
                  let textureUrl = base_texture_folderNew + textureUrlLeft + textureVariant + textureUrlRight;
                  //textureUrl = textureUrl;
                  let suggestedFilename = (textureUrlLeft + textureVariant + textureUrlRight).toUpperCase().replace(".JPG","");

                  if ( labelContents === "") {
  console.log("label not loaded yet, looking locally, then online...")
                    if (imgFiles.length === 0) { // no local IMG file available, download:
  console.log("no local IMG file '" + suggestedFilename + " 'available for Alt/Az,  download...")
                        let rawContents = await downloadIMG(currentRAWIMGProductID, solNumber);
console.log("rawContents=",rawContents);
                        labelContents = new TextDecoder().decode(rawContents);
console.log("labelContents=",labelContents.length);
                        textureBASE64 = await getTextureFromIMG(rawContents);
console.log("           Length of RETRIEVED texture:",textureBASE64.length)
                        saveRawContents(rawContents, currentRAWIMGfileName);
                    } else {
  console.log("   DEBUG: labelContents to be taken from local file ", suggestedFilename)
                    // labelContents to be taken from local file  /// dEBUG
console.log("     Searching for possible textures...");
                      for (const file of imgFiles) {
                        const fileName = file.name.toUpperCase();
console.log("         Current  file: " , fileName , " vs IMG filename taken from VST:" ,  currentRAWIMGfileName);
                        if (fileName.toLowerCase().substring(0,23) === currentRAWIMGfileName.toLowerCase().substring(0,23)) { // disregard version and left/rigth match
console.log("           File match, getting texture...");
                            const imgData = await getDataFromLocalIMG(file);
                            textureBASE64 = imgData.textureBASE64;
                            solNumber = imgData.solNumber;
                            labelContents = imgData.fileContentsString;
console.log("           Length of LOCAL texture:", textureBASE64.length);
                            imgFileFound = true;
                            break; // Exit loop once file is found
                        } else {
console.log("           No match, skipping.");
                        }
                      }
                    }

console.log("IMG loaded, reading angles...");
                    angles = extractVicarData2(labelContents);
console.log("     angles for " + suggestedFilename + "  = ", angles);
                  }


console.log("Texture length:", textureBASE64.length);
                } // for sui graphicalProducts

    /////////////////  end texture retrieval /////////

              if (textureBASE64 !== "error") {
//
              } else {
console.log(" **** ERROR, no texture");
              }

            this.textureFiles.push(textureBASE64 || null);
            this.offset += 2048;
        } // for (textures ref)

await  advanceProgress("HEADER2 - Textures loaded");


        //////////// COORDINATES ////////

        //  in the VST file the coordinate system binary data is 12 64 bit floats (total 96 bytes used)
        //  which are simply the C, A, H, V vectors of the camera model in the order
        //  Cx, Cy, Cz, Ax, Ay, Az, Hx, Hy, Hz, Vx, Vy, Vz.

        /*
        - C is a 3D vector that gives the location of the Center of projection of the left navcam camera as
          it was positioned by the pan/tilt mast relative to rover frame when that image was acquired.
        - A is a 3D vector that gives the Axis of that camera which is the direction in which it was pointed.
        - The other two are the Horizontal and Vertical 3D vectors in the plane of the image sensor.

        There is some nuance because the CAHV camera model doesn’t actually require A, H, and V to be orthonormal.
        However, you can construct an orhonormal basis from them, see this code to do that:

        https://github.com/NASA-AMMOS/VICAR/blob/8264ad382401a93224cbecb810796a0c0262d36b/vos/p2/sub/cahvor/cmod_cahv.c#L795
        */


        /*
            CAHV Camera Model
            The CAHV camera model is equivalent to the standard
            linear photogrammetric model for a pinhole camera. It
            is useful for very small field of view cameras and as a
            building block for more complex camera models. The
            CAHV model consists of four 3-vectors: C, A, H, and
            V. Vector C gives the location of the pinhole. Vector
            A gives the camera axis, defined as the normal to the
            image plane. Vector H encodes the horizontal axis of
            the image plane (H’), the coordinate (Hc) of the image
            column at the optical centre of the image plane, and the
            horizontal focal length (Hs) of the camera, in pixels.
            Vector V encodes corresponding information (V’, Vc,
            Vs) in the vertical direction. The angle (theta) between
            horizontal and vertical vectors H’ and V’ is about 90°.
            Non-orthogonal H’ and V’ generally represent an
            attempt to compensate for distortion that CAHV
            vectors cannot directly model. Image dimensions are
            supplied along with the CAHV model.

            "CAMERA RESPONSE SIMULATION FOR PLANETARY EXPLORATION"
            https://robotics.jpl.nasa.gov/media/documents/rmadison3.pdf
        */

        const coords = (() => {
            const float64Array = [];
            const float64View = new Float64Array(1);
            const uint8View = new Uint8Array(float64View.buffer);

            for (let i = 0; i < 96; i += 8) { // 8 byte per ogni float64
                // Copia 8 byte alla volta nel buffer temporaneo
                for (let j = 0; j < 8; j++) {
                    uint8View[j] = this.dataView.getUint8(this.offset + i + j);
                }
                // Aggiungi il float64 risultante all'array
                float64Array.push(float64View[0]);
            }

            const Cx = float64Array[0];
            const Cy = float64Array[1];
            const Cz = float64Array[2];
            const Ax = float64Array[3];
            const Ay = float64Array[4];
            const Az = float64Array[5];
            const Hx = float64Array[6];
            const Hy = float64Array[7];
            const Hz = float64Array[8];
            const Vx = float64Array[9];
            const Vy = float64Array[10];
            const Vz = float64Array[11];

            const up = [0, 1, 0];

            // Calcola il vettore direzione
            const Dx = Ax - Cx;
            const Dy = Ay - Cy;
            const Dz = Az - Cz;

            // Calcola la lunghezza del vettore
            const magnitude = Math.sqrt(Dx * Dx + Dy * Dy + Dz * Dz);

            // Normalizza il vettore direzione
            const normDx = Dx / magnitude;
            const normDy = Dy / magnitude;
            const normDz = Dz / magnitude;

            // Calcola gli angoli Yaw e Pitch
            const yaw = Math.atan2(normDz, normDx); // Psi
            const pitch = Math.asin(-normDy);       // Theta

            // Vettore Up di riferimento
            const Ux = up[0], Uy = up[1], Uz = up[2];

            // Calcola il vettore Right tramite il prodotto vettoriale D x U
            const Rx = normDy * Uz - normDz * Uy;
            const Ry = normDz * Ux - normDx * Uz;
            const Rz = normDx * Uy - normDy * Ux;

            // Normalizza il vettore Right
            const magnitudeR = Math.sqrt(Rx * Rx + Ry * Ry + Rz * Rz);
            const normRx = Rx / magnitudeR;
            const normRy = Ry / magnitudeR;
            const normRz = Rz / magnitudeR;

            // Calcola il Roll
            const roll = Math.atan2(normRy * Uz - normRz * Uy, normDx * Ux + normDy * Uy + normDz * Uz); // Phi

            return {
                Cx, Cy, Cz,
                Ax, Ay, Az,
                Hx, Hy, Hz,
                Vx, Vy, Vz,
                yawRad: yaw,
                pitchRad: pitch,
                rollRad: roll,
                yawDeg: yaw * 180 / Math.PI,
                pitchDeg: pitch * 180 / Math.PI,
                rollDeg: roll * 180 / Math.PI,
                description: "C = camera location, A = camera pointing vector w.r.t. C frame"
            }

        })();
        this.offset += 4096;
await advanceProgress("HEADER2 - Textures references loaded");

        /////////// Read vertices
        for (let i = 0; i < header.vertexNum; i++) {
            const vertex = new Vertex(this.dataView, this.offset, needsReverse);
            this.vertices.push(vertex);
            this.offset += 20;
        }
await advanceProgress("HEADER2 - Vertex loaded");


            //////////// Process LODs
//            let lods = [];
            for (let i = 0; i < header.lodNum; i++) {
                const lod = this.parseLOD(needsReverse);
                lods.push(lod);
await advanceProgress("HEADER2 - LOD processed");
            }
            fileProgressBar.value = 100; // Parsing completato


            return {
                header,
                bbox,
                textureFiles: this.textureFiles,
                vertices: this.vertices,
                lods,
                coordinateSystem : coords
            };


        } catch (error) { // parse header
            console.error("Errore durante il parsing:", error);
            fileProgressBar.value = 0; // Reset in caso di errore
            throw error;
        }
    } // parse VST header


    parseLOD(needsReverse) {
        const lodHeader = new LODHeader(this.dataView, this.offset, needsReverse);
        this.offset += 28; // Size of LODHeader

        // Skip texture bounding boxes
        this.offset += 24 * this.textureFiles.length;

        const patches = [];
        for (let i = 0; i < lodHeader.patchNum; i++) {
            const patch = this.parsePatch(needsReverse);
            patches.push(patch);
        }

        return {
            header: lodHeader,
            patches
        };
    }


    parsePatch(needsReverse) {
        const patchHeader = new PatchHeader(this.dataView, this.offset, needsReverse);
        this.offset += 24; // Size of PatchHeader

        const arrays = [];
        let pos1 = this.offset;
        let pos2 = pos1 + patchHeader.arrayNum * 4;

        for (let i = 0; i < patchHeader.arrayNum; i++) {
            // Save current position
            const currentPos = this.offset;

            // Read array length
            this.offset = pos1;
            let arrayLen = this.dataView.getInt32(this.offset, true);
            if (needsReverse) {
                arrayLen = ((arrayLen & 0xFF) << 24) |
                         ((arrayLen & 0xFF00) << 8) |
                         ((arrayLen & 0xFF0000) >>> 8) |
                         ((arrayLen & 0xFF000000) >>> 24);
            }
            pos1 += 4;

            // Read vertex indices
            this.offset = pos2;
            const indices = [];
            for (let j = 0; j < arrayLen; j++) {
                let index = this.dataView.getInt32(this.offset, true);
                if (needsReverse) {
                    index = ((index & 0xFF) << 24) |
                           ((index & 0xFF00) << 8) |
                           ((index & 0xFF0000) >>> 8) |
                           ((index & 0xFF000000) >>> 24);
                }
                indices.push(index);
                this.offset += 4;
            }
            pos2 = this.offset;

            arrays.push(indices);
        }

        return {
            header: patchHeader,
            arrays
        };
    }

    readString(length) {
        const bytes = new Uint8Array(this.dataView.buffer, this.offset, length);
        let str = '';
        for (let i = 0; i < length && bytes[i] !== 0; i++) {
            str += String.fromCharCode(bytes[i]);
        }
        this.offset += length;
        return str;
    }
} /// class VST parser



function generateOBJ_AI(vstData, startLod, endLod) { // vecchia routine
  const vertices = vstData.vertices;
  const lods = vstData.lods;

  let obj = "";

  // Write vertex data
  for (let vertex of vertices) {
   obj += `v ${vertex.x} ${-vertex.z} ${vertex.y}\n`;
  }

  // Write texture coordinate data
  for (let vertex of vertices) {
   obj += `vt ${vertex.tx} ${1 - vertex.ty}\n`;
  }

  obj += "# Faces\n";

  // Write face data for each LOD from startLod to endLod
  for (let lodIndex = startLod; lodIndex <= endLod; lodIndex++) {
    //lodIndex=1;  // debug
    const lod = lods[lodIndex]; // debug
    for (let patch of lod.patches) {
      if (patch.header.pointCloud === 0) { // trianglestrip
       const textureFile = vstData.textureFiles?.[patch.header.texture];
       if (textureFile) {
         obj += `# Material: ${textureFile}\n`;
         obj += `usemtl mtl_${patch.header.texture}\n`;
         obj += `mtllib ${textureFile.replace('.png', '.mtl')}\n`;
       }

       obj += `g shape_lod${lodIndex}\n`; // Aggiungo il numero del LOD al nome del gruppo

       for (let array of patch.arrays) {
         obj += "f ";
         for (let index of array) {
           obj += `${index+1}/${index+1} `;
         }
         obj += "\n";
       }
      } else {
      // pointcloud not implemented
      }
    }
  }
  return obj;
}


function generateX3D(vstData, startLod, endLod) {
    const bbox = vstData.bbox;
    const vertices = vstData.vertices;
    const lods = vstData.lods;

    // Helper to format coordinates for X3D
    const formatPoint = (vertex) => `${vertex.x} ${-vertex.z} ${vertex.y}`;
    const formatTexCoord = (vertex) => `${vertex.tx} ${1 - vertex.ty}`;


    x3d = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE X3D PUBLIC "ISO//Web3D//DTD X3D 3.0//EN" "http://www.web3d.org/specifications/x3d-3.0.dtd">
<X3D profile="CADInterchange">
  <head>
    <meta name="generator" content="vst2x3d"/>
  </head>
  <Scene>
    <NavigationInfo type='"WALK" "ANY"'/>
    <Viewpoint description="Start" position="0.0 0.0 0.0" orientation="1 0 0 3.14"/>`;

    // Calculate bounding box center and size
    const bboxCenter = {
        x: (bbox.xMax + bbox.xMin) / 2,
        y: -(bbox.zMax + bbox.zMin) / 2,
        z: (bbox.yMax + bbox.yMin) / 2
    };

    const bboxSize = {
        x: (bbox.xMax - bbox.xMin) / 2,
        y: (bbox.zMax - bbox.zMin) / 2,
        z: (bbox.yMax - bbox.yMin) / 2
    };

    lods.forEach((lod, lodIndex) => {
        currentShape = "";
        wireframe = "";
        if (( startLod <= lodIndex) && (lodIndex <= endLod)) {
//console.log("Inserting LOD n. ", lodIndex, ", V=", lod.header.vertexNum, ", T=", lod.patches[0].header.arrayNum);
            x3d += `\n      <Shape id = "PROD_${product_name_no_ext}_LOD_${lodIndex}"   bboxCenter="${bboxCenter.x} ${bboxCenter.y} ${bboxCenter.z}" bboxSize="${bboxSize.x} ${bboxSize.y} ${bboxSize.z}">`;
            currentShape += `\n      <Shape id = "PROD_${product_name_no_ext}_LOD_${lodIndex}"   bboxCenter="${bboxCenter.x} ${bboxCenter.y} ${bboxCenter.z}" bboxSize="${bboxSize.x} ${bboxSize.y} ${bboxSize.z}">`;

            lod.patches.forEach(patch => {
                if (patch.header.pointCloud === 1) {
                    // Handle point cloud
                    x3d += '\n          <PointSet>\n              <Coordinate point="';
                    currentShape += '\n          <PointSet>\n              <Coordinate point="';

                    const points = [];
                    patch.arrays.forEach(array => {
                        array.forEach(vertexIndex => {
                            points.push(formatPoint(vertices[vertexIndex]));
                        });
                    });

                    x3d += points.join(', ');
                    currentShape += points.join(', ');
                    x3d += '"/>\n          </PointSet>';
                    currentShape += '"/>\n          </PointSet>';
                } else {
                    // Handle trianglestrip
                    textureOk = false;
                    if (vstData.textureFiles && vstData.textureFiles[patch.header.texture]) {
                        finalUrl = vstData.textureFiles[patch.header.texture];
                        textureOk = true;
                    } else {
                        textureOk = false; // redundant, just to add the closing "else"
console.log("Creating x3d file without the missing texture.");
                    }

                    // Handle textured triangles
x3d += `\n              <Appearance>
                  <Material backAmbientIntensity='1.0'
                 backDiffuseColor='1 1 1'
                 diffuseColor='1 1 1'
                 transparency='0'/>`;

currentShape += `\n              <Appearance>
                  <Material backAmbientIntensity='1.0'
                 backDiffuseColor='1 1 1'
                 diffuseColor='1 1 1'
                 transparency='0'/>`;

wireframe += `\n              <Appearance>
                   <Material emissiveColor = "1 1 0"/>`;

                    if (textureOk) {
                           x3d += `\n                     <ImageTexture url="` + finalUrl+ `"\n                 />
                     <TextureProperties boundaryModeS='REPEAT'
                         boundaryModeT='REPEAT'
                         magnificationFilter='NICEST'
                         minificationFilter='NICEST'\n                 />`;

                           currentShape += `\n                  <ImageTexture url="` + finalUrl+ `"\n              />
                     <TextureProperties boundaryModeS='REPEAT'
                         boundaryModeT='REPEAT'
                         magnificationFilter='NICEST'
                         minificationFilter='NICEST'\n                 />`;
                       }

x3d += `\n              </Appearance>
              <IndexedTriangleStripSet solid='false'
            ccw='true'
            index="`;

currentShape += `\n              </Appearance>
              <IndexedTriangleStripSet solid='false'
            ccw='true'
            index="`;

wireframe += `\n              </Appearance>
              <IndexedLineSet solid='false'
            ccw='true'
            index="`;


                    // Add indices with strip separators
                    const indices = [];
                    patch.arrays.forEach((array, arrayIndex) => {
                        if (arrayIndex > 0) indices.push(-1);
                        indices.push(...array);
                    });
                    x3d += indices.join(' ');
                    currentShape += indices.join(' ');
                    wireframe += indices.join(' ');

                    // Add coordinates
                    x3d +=          `">\n                <Coordinate point="`;
                    currentShape += `">\n                <Coordinate point="`;
                    wireframe +=    `">\n                <Coordinate point="`;
                    const points = [];
                    for (let i = 0; i <= lod.header.vertMax; i++) {
                        points.push(formatPoint(vertices[i]));
                    }
                    x3d += points.join(', ');
                    currentShape += points.join(', ');
                    wireframe += points.join(', ');

                    x3d += '"\n            />';
                    currentShape += '"\n            />';
                    wireframe += '"\n            />';

                    if (textureOk) {
                        // Add texture coordinates
                        x3d +=          `\n                <TextureCoordinate point="`;
                        currentShape += `\n                <TextureCoordinate point="`;
                        wireframe +=    `\n                <TextureCoordinate point="`;
                        const texCoords = [];
                        for (let i = 0; i <= lod.header.vertMax; i++) {
                            texCoords.push(formatTexCoord(vertices[i]));
                        }
                        x3d += texCoords.join(', ');
                        currentShape += texCoords.join(', ');
                        wireframe += texCoords.join(', ');
                        x3d += '"\n            />';
                        currentShape += '"\n            />';
                        wireframe += '"\n            />';
                    }
                    x3d +=          '\n              </IndexedTriangleStripSet>';
                    currentShape += '\n              </IndexedTriangleStripSet>';
                    wireframe +=    '\n              </IndexedLineSet>';

                    x3d += '\n      </Shape>';
                    currentShape += '\n      </Shape>';
                    if (wireframeEnabled) {

                                        x3d += `\n          <Shape id = "PROD_${product_name_no_ext}_LOD_${lodIndex}_wireframe"   bboxCenter="${bboxCenter.x} ${bboxCenter.y} ${bboxCenter.z}" bboxSize="${bboxSize.x} ${bboxSize.y} ${bboxSize.z}">`;
                                        currentShape += `\n          <Shape id = "PROD_${product_name_no_ext}_LOD_${lodIndex}_wireframe"   bboxCenter="${bboxCenter.x} ${bboxCenter.y} ${bboxCenter.z}" bboxSize="${bboxSize.x} ${bboxSize.y} ${bboxSize.z}">`;
                                        x3d += wireframe;
                    }
                } // patch cycle, trianglestrip type
            }); // patch cycle

            if (wireframeEnabled) {

                        x3d += '\n      </Shape>';
                        currentShape += '\n      </Shape>';
            }
            x3dShapes.push(currentShape);
            currentShape="";
        } // selected lod
    }); // lod cycle

                x3d += '\n  </Scene>\n</X3D>';
                return x3d;
            }


const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
//const convertBtn = document.getElementById('convertBtn');
const status = document.getElementById('status');

let selectedFile = null;
/*

// moved to main

// Handler per il click sull'area di drop
dropArea.addEventListener('click', () => {
    fileInput.click();
});

// Handler per il cambio del file input
fileInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
});

// Handlers per il drag and drop
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
});
*/
// Funzione per gestire i file selezionati
async function handleFiles(files, prodIdControl) {
    if (!files || files.length === 0) return;

    // Filtra solo i file .vst
    const vstFiles = files.filter(file => file.name.toLowerCase().endsWith('.vst'));
    const imgFiles = files.filter(file => file.name.toLowerCase().endsWith('.img'));
    const lblFiles = files.filter(file => file.name.toLowerCase().endsWith('.lbl'));

    if (vstFiles.length === 0) {
        showStatus('Per favore seleziona almeno un file .vst', 'error');
        return;
    }

    if (vstFiles.length !== files.length) {
        showStatus(`Trovati ${vstFiles.length} file .vst su ${files.length} file selezionati`, 'warning');
    }

    selectedFiles = vstFiles;
    //convertBtn.disabled = false;

    // Mostra la lista dei file selezionati
    const fileList = vstFiles.map(file => file.name).join(', ');
console.log("fileList:", fileList);
    showStatus(`File selezionati: ${fileList}`, 'success');

    // Ottieni la barra di progresso e resetta il valore
    const progressBar = document.getElementById('progressBar');
    progressBar.value = 0;
    progressBar.max = vstFiles.length;

    // Processa i file in sequenza
    for (let i = 0; i < vstFiles.length; i++) {
        try {
console.log("Calling processor",imgFiles);;
            await processFile(vstFiles[i], i, prodIdControl, imgFiles, lblFiles); // <<<<<<<<<<<<<<<<<<------------------- main process
            progressBar.value = i + 1; // Aggiorna la barra di progresso
            showStatus(`Completato il file ${i + 1} di ${vstFiles.length}: ${vstFiles[i].name}`, 'success');
            document.getElementById("spnLoaded").innerHTML += vstFiles[i].name+ "<br>";
        } catch (error) {
            showStatus(`Errore nel processare il file ${vstFiles[i].name}: ${error.message}`, 'error');
            // break; // Decommentare per fermarsi al primo errore
        }
    }

    // Mostra il completamento al termine
    showStatus('Elaborazione completata!', 'success');
}


async function processFile(file, index, prodIdControl, imgFiles, lblFiles) {
   console.log("Avvia la conversione per "+ file.name, imgFiles,lblFiles);
   prodIdControl.value = file.name.split(".")[0];
    await startConversion(file, index, prodIdControl, imgFiles, lblFiles);   // <<<<<<<<<<<<<<<<<<------------------- conversion  process
   console.log("Fatto.");
}



async function startConversion (selectedFile, index, prodIdControl, imgFiles, lblFiles) {   // <<<<<<<<<<<<<<<<<<------------------- conversion  function
console.log("Conversion started",prodIdControl);
showStatus("Conversion started", 'success');
    product_name_no_ext = prodIdControl.value;
console.log("product_name_no_ext=",product_name_no_ext);

    const secondChar = product_name_no_ext.charAt(1).toLowerCase();

    // Imposta VST_CAMERA_FOLDER in base al secondo carattere
    if (secondChar === 'n') {
        VST_CAMERA_FOLDER = "data/navcam/";
    } else if (secondChar === 'p') {
        VST_CAMERA_FOLDER = "data/pancam/";
    } else {
        throw new Error("Carattere non riconosciuto '" + secondChar  + "' per determinare la cartella della fotocamera."); // Gestione errore
    }
    
    base_VST_filename = BASE_VST_URL + VST_CAMERA_FOLDER + VST_FOLDER_SITE_NAME + product_name_no_ext.toLowerCase();
    let txtVSTurl = base_VST_filename + ".vst";
    let arrayBuffer;

   // try {
        if (selectedFile) {
console.log("==================================");
console.log("Local:", selectedFile.name);
            // Se il file e' selezionato dall'utente
            arrayBuffer = await selectedFile.arrayBuffer();
        } else if (txtVSTurl) {
console.log("==================================");
console.log("Downloading:",txtVSTurl);
            // Se esiste un URL in txtVSTurl, scarica il file usando il proxy
            const proxyURL = "https://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=";
            response = await fetch(proxyURL + encodeURIComponent(txtVSTurl));
            if (!response.ok) throw new Error("Errore nel download del file da URL.");
            arrayBuffer = await response.arrayBuffer();
        } else {
            showStatus("Nessun file selezionato o URL fornito.", "error");
            return;
        }

        // Parsing e generazione del contenuto X3D
        const parser = new VSTParser(arrayBuffer);
console.log("Calling VST parser");
        vstData = await parser.parse(imgFiles, lblFiles);            //                 <<<<<<<<<<<----------------- VST parser
console.log("vstData:", vstData);

let coordinateSystem = vstData.coordinateSystem;
console.log("Coordinate system (CAHV):",coordinateSystem);

console.log("Camera origin in site+drive reference frame:   " , coordinateSystem.Cx, coordinateSystem.Cy, coordinateSystem.Cz);
console.log("Camera direction w.r.t camera origin reference:" , coordinateSystem.Ax, coordinateSystem.Ay, coordinateSystem.Az);
console.log("Camera direction in site+drive reference frame:" , coordinateSystem.Cx+coordinateSystem.Ax, coordinateSystem.Cy + coordinateSystem.Ay, coordinateSystem.Cz + coordinateSystem.Az);
console.log("Camera direction in yaw/pitch (rad):" , coordinateSystem.yawRad , coordinateSystem. pitchRad);
console.log("Camera direction in yaw/pitch (deg):" , coordinateSystem.yawDeg.toFixed(0) , coordinateSystem. pitchDeg.toFixed(0));
        // Invert Z coordinate (in MER system the positive vertical axis points to ground):
        const invertedVertices = vstData.vertices.map(item => ({
            ...item,
            z: -item.z//,
            //x: -item.x//,
            //y: -item.y
        }));
        vstData.vertices =  invertedVertices;
        
console.log("Inserting model into scene....");
        x3dContent = generateX3D(vstData, 1,1); // DEBUG: LOD must be selected by user; // DEBUG: Get the x3d file as returned value to pass to viewer
console.log("Conversion to x3d completed.");


//saveX3Dfile(x3dContent);
//objContent = generateOBJ_AI(vstData, 1,1); // FUNZIONA la pointcloud!
//saveOBJfile(objContent);

        showStatus(selectedFile.name + 'completato.', 'success');

        addRotatedX3dToScene(x3dContent, angles.pancamAzimuthRad, -angles.pancamElevationRad);
    //} catch (error) {
       // showStatus(`Errore durante la conversione: ${error.message}`, 'error');
   // }


};

// moved to main
//convertBtn.addEventListener('click', startConversion);


function saveX3Dfile(x3dContent) { // DEBUG: add a caller button
        // Crea e scarica il file X3D
        const blob = new Blob([x3dContent], { type: 'model/x3d+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
console.log("Saving to ", product_name_no_ext + '.x3d');
        a.download = selectedFile ? selectedFile.name.replace('.vst', '.x3d') : product_name_no_ext + '.x3d';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
}

function saveOBJfile(objContent) { // DEBUG: add a caller button
        // Crea e scarica il file X3D
        const blob = new Blob([objContent], { type: 'model/x3d+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
console.log("Saving to ", product_name_no_ext + '.obj');
        a.download = selectedFile ? selectedFile.name.replace('.vst', '.obj') : product_name_no_ext + '.obj';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
}


// Funzione per mostrare lo status
function showStatus(message, type) {
    status.textContent = message;
    status.style.display = 'block';
    status.className = type;
}

async function urlToBase64(imageUrl) {
       finalUrl = proxyURL + encodeURIComponent(imageUrl);

    try {
        // Scarica l'immagine come blob
        const response = await fetch(finalUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();

        // Verifica che il MIME type sia JPEG
        if (blob.type !== 'image/jpeg') {
            return ("error");
        }

        // Determina il tipo MIME corretto
        const mimeType = blob.type;//'image/jpeg';

        // Converti il blob in base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                const base64Data = base64String.split(',')[1];
                resolve(`data:${mimeType};base64,${base64Data}`);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
console.log(`Errore durante la creazione di BASE64: ${error.message}`);
        var manualUrl = prompt("2- No network - Base64url?");
        return(manualUrl);
    }
}


async function fileToBase64(file) {
   // Verifica che il file sia JPEG
   if (!file || file.type !== 'image/jpeg') {
       throw new Error('Selezionare un file JPEG valido');
   }

   return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.onloadend = () => {
           resolve(reader.result);
       };
       reader.onerror = reject;
       reader.readAsDataURL(file);
   });
}


function siteCodeToString(code) {
    if (code.length !== 2) {
        throw new Error("Il codice deve essere una stringa di due caratteri.");
    }

    const firstChar = code[0];
    const secondChar = code[1];

    // Caso 1: numerico puro ("00" - "99")
    if (!isNaN(firstChar) && !isNaN(secondChar)) {
        return parseInt(code, 10);
    }

    // Caso 2: alfanumerico ("A0" - "ZZ")
    const alphabetOffset = 'A'.charCodeAt(0); // Offset per calcolare il valore delle lettere
    const firstValue = firstChar.charCodeAt(0) - alphabetOffset;
    let secondValue;

    if (isNaN(secondChar)) {
        // Se il secondo carattere è una lettera
        secondValue = secondChar.charCodeAt(0) - alphabetOffset + 10;
    } else {
        // Se il secondo carattere è un numero
        secondValue = parseInt(secondChar, 10);
    }

    // Formula per calcolare l'intervallo corretto (da 100 in poi)
    return 100 + firstValue * 36 + secondValue;
}



async function loadLocalLabel(file) {
    let sol  = "error";
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (event) => {
              const VSTlabelContents = event.target.result;
              const sol = extractSol(VSTlabelContents);
              resolve(/*sol*/ VSTlabelContents);
          };
          reader.onerror = reject;
          reader.readAsText(file);
      });

    if (sol !== "error") {
//console.log("    loadLocalLabel - FOUND ");
        return {solNumber : sol};
    }

console.log("    *loadLocalLabel - **NOT FOUND**");
    return { solNumber : "ERROR!" };
}




async function downloadLBL(lblFileName, siteNumberString) {

    const secondChar = lblFileName.charAt(1).toLowerCase();

    // Imposta VST_CAMERA_FOLDER in base al secondo carattere
    if (secondChar === 'n') {
        VST_CAMERA_FOLDER = "data/navcam/";
    } else if (secondChar === 'p') {
        VST_CAMERA_FOLDER = "data/pancam/";
    } else {
        throw new Error("*Carattere non riconosciuto '" + secondChar  + "' per determinare la cartella della fotocamera."); // Gestione errore
    }


    lblUrl = BASE_VST_URL + VST_CAMERA_FOLDER +  siteNumberString + "/" +  lblFileName ; // DEBUG: valid only up to site 0138, for Spirit!!
console.log("     downloadLBL - Retrieving label:",lblUrl);
    lblFinalUrl = proxyURL + encodeURIComponent(lblUrl);
    try {
        const response = await fetch(lblFinalUrl);

        if (!response.ok) {
console.log(`*HTTP error! status: ${response.status}`);
            reject( new Error(`HTTP error! status: ${response.status}`));
        } else {
console.log(    "downloadLBL - retrieved successfully file " + lblFileName)

        }

        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                VSTlabel =  reader.result;
                if (VSTlabel.indexOf("The requested URL was not found on this server") >= 0) {
console.log("********",VSTlabel);
console.log("*downloadLBL: ERROR - file " +  lblFileName + " not found in folder " +  BASE_VST_URL + VST_CAMERA_FOLDER);
alert("Label not found --> can't determine Sol --> can't download texture for " + lblFileName.split(".")[0]);
                    reject(new Error("*ERR downloadLBL: file " +  lblFileName + " not found in folder " +  BASE_VST_URL + VST_CAMERA_FOLDER));
                    return
                }
console.log("Extracting SOL from downloaded file....", lblFileName);
                solNumber = extractSol(VSTlabel);
                if (solNumber == null || isNaN(solNumber) || solNumber < 0) {
console.log("*ERROR: Cannot extract sol number from label");
                    reject(new Error("*downloadLBL" ));
                } else {
                    resolve(VSTlabel/*solNumber*/);
                }
            };
            reader.onerror = reject;
            reader.readAsText(blob);
        });
    } catch (error) {
        var solNumber = prompt("2- No network - Sol?");
        if (solNumber == null || isNaN(solNumber) || solNumber < 0) {
console.log(`>>Errore durante il caricamento della label per leggere il Sol Number: ${error.message}`);
        return ("NETWORK ERROR ON LABEL");
        } else {
            return(solNumber);
        }
    }
}



async function downloadIMG(textureName,  solNumber) {
console.log("downloadIMG",textureName);
    let imgFileNameLeft = textureName.substring(0, 11);
    let imgFileNameRight = textureName.substring(14);
    //let imgFileName = imgFileNameLeft + "thn" + imgFileNameRight + ".img"; // thumbnail is the shorter one, and we need just the label
    let imgFileName = textureName + ".img"; // thumbnail is the shorter one, and we need just the label

    imgFileName = imgFileName.substring(0, 26) + "1" + imgFileName.substring(27); // Force version 1 for IMG product
    imgFileName = imgFileName.substring(0, 23    ) + "l" + imgFileName.substring(24); // Force left camera for texture

   const secondChar = imgFileName.charAt(1).toLowerCase();

    if (secondChar === 'n') {
      BASE_IMG_URL = BASE_IMG_URL_NAVCAM
    } else if (secondChar === 'p') {
      BASE_IMG_URL =  BASE_IMG_URL_PANCAM
    } else if ((secondChar === 'r') || (secondChar === 'f') ) {
      BASE_IMG_URL =  BASE_IMG_URL_HAZCAM
    } else {
      throw new Error("Carattere non riconosciuto '" + secondChar  + "' per determinare la cartella della fotocamera."); // Gestione errore
    }


    base_texture_folderIMG = BASE_IMG_URL + IMG_RAW_FOLDER + SOL_FOLDER;


    imgUrl = (base_texture_folderIMG.replace("#SOLNUMBER#",solNumber)  +  imgFileName).toLowerCase() ; // DEBUG: valid only up to site 0138, for Spirit!!
console.log("Retrieving image for getting label (for alt az):",imgUrl);
    imgFinalUrl = proxyURL + encodeURIComponent(imgUrl);

    try {



        const response = await fetch(imgFinalUrl);
        if (!response.ok) {
            return (new Error(`downloadIMG - HTTP error! status: ${response.status}`));
        } else {
//console.log("OK, IMG for AltAz retrieved");
        }

        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                imgContents =  reader.result;
                resolve(imgContents);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer/*readAsText*/(blob);
        });






    } catch (error) {
        var pancamAzimuthRad = prompt("* ERROR 2- No network - pancamAzimuthRad?");
        if (pancamAzimuthRad == null || isNaN(pancamAzimuthRad) ) {
console.log(`*Errore durante il caricamento di pancamAzimuthRad: ${error.message}`);
            pancamAzimuthRad = 0;
        } else {
// go on
        }

        var pancamElevationRad = prompt("*ERROR 3- No network - pancamElevationRad?");
        if (pancamElevationRad == null || isNaN(pancamElevationRad) ) {
console.log(`*Errore durante il caricamento di pancamElevationRad: ${error.message}`);
            pancamElevationRad = 0;
        } else {
            //go on
        }

    return  ("why here??? debug");//pancamAzimuthRad: pancamAzimuthRad, pancamElevationRad : pancamElevationRad, azimuthFOVdeg: 45, elevationFOVdeg : 45};

    }
}


function extractSol(labelContent) {
    const match = labelContent.match(/PLANET_DAY_NUMBER\s*=\s*(\d+)/);
    if (match) {
        return parseInt(match[1], 10);
    } else {
console.log("* extractSol: Label  contents: ", labelContent);
        return null;
    }
}


function parseQuaternion(quaternionString) {
 // Remove the surrounding parentheses
 const quaternionValues = quaternionString.slice(1, -1).split(',');

 // Convert the string values to numbers
 const [x, y, z, w] = quaternionValues.map(parseFloat);

 return [x, y, z, w];
}


function calculatePancamAngles(roverQuaternion, pancamAzimuth, pancamElevation) {
  // Estrazione componenti del quaternione
  const [x, y, z, w] = roverQuaternion;

  // Calcolo azimuth della Pancam
  const azimuth = Math.atan2(2 * (x * y + w * z), w * w + x * x - y * y - z * z);

  // Calcolo elevazione della Pancam
  const elevation = Math.asin(-2 * (x * z - w * y));

  // Aggiungi gli angoli della Pancam
  const finalAzimuth = pancamAzimuth + azimuth;
  const finalElevation = pancamElevation + elevation;  // DEBUG non funziona!

  return { finalAzimuth, finalElevation };
}



function extractVicarData2(vicarLabelText) {
    PMA_anglesValuesRaw =  readVicarParameter(vicarLabelText, "PMA_ARTICULATION_STATE", "ARTICULATION_DEVICE_ANGLE");
    PMA_orientationValuesRaw = readVicarParameter(vicarLabelText, "PMA_ARTICULATION_STATE", "ARTICULATION_DEVICE_ANGLE")

    PANCAM_azimuthRaw = PMA_orientationValuesRaw["AZIMUTH-MEASURED"];
    PANCAM_elevationRaw = PMA_orientationValuesRaw["ELEVATION-MEASURED"];
    PANCAM_azimuthFOV_Raw = readVicarParameter(vicarLabelText, "INSTRUMENT_STATE_PARMS", "AZIMUTH_FOV")["AZIMUTH_FOV"];
    PANCAM_elevationFOV_Raw = readVicarParameter(vicarLabelText, "INSTRUMENT_STATE_PARMS", "ELEVATION_FOV")["ELEVATION_FOV"];

    PLANET_DAY_NUMBER = readVicarParameterSingle(vicarLabelText, "PLANET_DAY_NUMBER");

    pancamAzimuthRad = parseFloat(PANCAM_azimuthRaw.replace("<rad>",""));
    pancamElevationRad = parseFloat(PANCAM_elevationRaw.replace("<rad>",""));
    azimuthFOVdeg = parseFloat(PANCAM_azimuthFOV_Raw.replace("<deg>",""));
    elevationFOVdeg = parseFloat(PANCAM_elevationFOV_Raw.replace("<deg>",""));

    quaternionArray = readVicarParameter(vicarLabelText, "ROVER_COORDINATE_SYSTEM", "ORIGIN_ROTATION_QUATERNION").ORIGIN_ROTATION_QUATERNION;
    result = calculatePancamAngles([quaternionArray[0],quaternionArray[1],quaternionArray[2],quaternionArray[3]], pancamAzimuthRad, pancamElevationRad);

    return  {
      pancamAzimuthRad: result.finalAzimuth,
      pancamElevationRad : result.finalElevation,
      azimuthFOVdeg: azimuthFOVdeg,
      elevationFOVdeg : elevationFOVdeg,
      solNumber : PLANET_DAY_NUMBER
    };
}

function readVicarParameterSingle(vicarLabel, paramName) {
    // Trova il parametro specificato nel gruppo
    const paramRegex = new RegExp(`^\\s*${paramName}\\s*=\\s*(.*)`, 'm');
    const paramMatch = vicarLabel.match(paramRegex);
    if (!paramMatch) {
console.log("*readVicarParameterSingle - Parameter " +  + " not found in label");
        return null;  // Parametro non trovato
    }

    let value = paramMatch[1].trim();
    return value;
}

function readVicarParameter(vicarLabel, groupName, paramName) {
    const data = vicarLabel;

    // Trova il gruppo con regex che include tutte le righe tra il gruppo iniziale e il successivo
    const groupRegex = new RegExp(`GROUP\\s*=\\s*${groupName}\\s*([\\s\\S]*?)(?:GROUP|$)`, 'i');
    const groupMatch = data.match(groupRegex);
    if (!groupMatch) return null;  // Gruppo non trovato

    const groupData = groupMatch[1];

    // Trova il parametro specificato nel gruppo
    const paramRegex = new RegExp(`^\\s*${paramName}\\s*=\\s*(.*)`, 'm');
    const paramMatch = groupData.match(paramRegex);
    if (!paramMatch) return null;  // Parametro non trovato

    let value = paramMatch[1].trim();

    // Verifica se il valore è una lista
    if (value.startsWith("(")) {
        // Regex per estrarre correttamente tutti gli elementi tra parentesi tonde (compresi ritorni a capo)
        const listRegex = new RegExp(`^\\s*${paramName}\\s*=\\s*\\(([^)]+)\\)`, 'ms');
        const listMatch = groupData.match(listRegex);

        if (listMatch) {
            value = listMatch[1].split(',').map(v => v.trim());  // Crea un array con ogni elemento
            const nameParam = paramName + "_NAME";               // Cerca un array di nomi associati
            const nameRegex = new RegExp(`^\\s*${nameParam}\\s*=\\s*\\(([^)]+)\\)`, 'ms');
            const nameMatch = groupData.match(nameRegex);

            // Associa i nomi ai valori, se presente la lista di nomi
            if (nameMatch) {
                const names = nameMatch[1].split(',').map(name => name.trim().replace(/"/g, ''));
                const result = {};
                names.forEach((name, index) => {
                    result[name] = value[index];
                });
                return result;
            }
        }
    }

    // Restituisce un oggetto con chiave e valore singolo se non è una lista
    return { [paramName.trim()]: value };
}



function rotateShape(shapeIndex, rotationType, angleDegrees) {
    var shapes = document.querySelectorAll("#modelScene Shape");
    if (shapes && shapes[shapeIndex]) {
        var shape = shapes[shapeIndex];
        var trfElevation = shape.parentElement;
        var trfAzimuth = trfElevation.parentElement;
        var initialAzimuthDegrees = initialAzimuth[shapeIndex-1]*180/Math.PI;
        var initialElevationDegrees = initialElevation[shapeIndex-1]*180/Math.PI;
        if (trfElevation && trfAzimuth) {
            // Seleziona il transform appropriato e leggi la rotazione corrente
            var newAngleRadians;
            if (rotationType === 'azimuth') {
                newAngleRadians = (initialAzimuthDegrees + angleDegrees) * (Math.PI / 180);
                trfAzimuth.setAttribute("rotation", `0 1 0 ${newAngleRadians}`);
            } else if (rotationType === 'elevation') {
                newAngleRadians = (initialElevationDegrees + angleDegrees) * (Math.PI / 180);
                trfElevation.setAttribute("rotation", `1 0 0 ${newAngleRadians}`);
            }

            x3dom.reload();
        } else {
            console.error("Transform non trovati.");
        }
    } else {
        console.error("Shape non trovata.");
    }
}





async function getDataFromLocalIMG( file) {
console.log("getDataFromLocalIMG",file);
    let textureBASE64 = "error";
    for (let productIndex = 0; (( productIndex < graphicalProducts.length) && (textureBASE64 === "error")); productIndex++) {
console.log("Retrieving BASE64 from local file...", file);
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (event) => {
              rawIMGfileContents = event.target.result;
              textureBASE64 = await getTextureFromIMG(rawIMGfileContents);
console.log("  textureBASE64 = ",textureBASE64.length);
                resolve({
                    textureBASE64: textureBASE64,
                    solNumber: "debug",
                    altAz: "debug",
                    raw: rawIMGfileContents,
                    fileContentsString: new TextDecoder().decode(rawIMGfileContents)
                });
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
      });
    };

    if (textureBASE64 !== "error") {
//console.log("    getTexture - FOUND " + textureUrlLeft + "---" + textureUrlRight);
        return {textureBASE64 : textureBASE64, solNumber : "debug", altAz : "debug"};
    }

//console.log("    *getTexture - **NOT FOUND** " + textureUrlLeft + "---" + textureUrlRight);
    return("NO TEXTURE!");
}


function saveRawContents(rawContents, filename) {
    // Crea un elemento di download temporaneo
    const blob = new Blob([rawContents], {type: 'application/octet-stream'});
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Aggiunge il link al documento, clicca e rimuove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Libera la memoria
    URL.revokeObjectURL(url);
}

/////////////////////

async function getFilePath(filename) {
  const roverId = filename.substr(0,1);
  const cameraId = filename.substr(1,1)
  if ((cameraId.toLowerCase() === "r") || (cameraId.toLowerCase() === "f")) {
      cameraId = "h";
  }
  const siteId = filename.substr(14,2);
  const siteString = "site0" + siteCodeToString(siteId);
  const rawProductId = filename.toUpperCase().replace(".RGB","");
  const siteNumberCoded = rawProductId.substr(14, 2);
  const siteNumberString = "site0" + siteCodeToString(siteNumberCoded);
  const rawContents = await downloadIMG(rawProductId.toLowerCase(), solNumber);
  const labelContents = new TextDecoder().decode(rawContents);
console.log("LABEL=",labelContents);
  const sol = extractSol(labelContents)
  const IMG_BaseUrl = "https://pds-imaging.jpl.nasa.gov/data/mer/" + roverName[roverId*1] + "/mer" + roverId  + cameraId.toLowerCase() + "o_0xxx/browse/sol" + zeroes(sol,4) + "/rdr/";
  const VST_BaseUrl = "https://pds-imaging.jpl.nasa.gov/data/mer/" + roverName[roverId*1] + "/mer" + roverId  + "mw_0xxx/data/" + VSTcameraFolder + siteString;
  const driveId = filename.substr(16,2);
  const sequenceId = filename.substr(18,5);

}


async function getLabelFromInternet(filename, siteNumberString, filename) {
      const labelText = await downloadLBL(filename, siteNumberString);
      //saveRawContents(labelText, currentVSTProductID + ".lbl");
      return labelText;
}



function generateObjFromPatch(lod, vertices, textureBase64, filename, azimuth, elevation) {
    let objContent = "";

    lod.patches.forEach(p => {
        const patch = p.arrays;

        // Inizializza il contenuto dell'OBJ
        let facesContent = [];

        // Aggiungi il materiale per la texture
        objContent += `# Created with VST2X3D\n` +
                      `# VST2X3D/ELEVATION:` + elevation + ` rad\n` +
                      `# VST2X3D/AZIMUTH:` + azimuth + ` rad\n` +
                      `# VST2X3D/NASAx: xxx\n` +
                      `# VST2X3D/NASAy: xxx\n` +
                      `# VST2X3D/NASAz: xxx\n\n` +
                      `mtllib ` + filename +  `.mtl\n`; // material library is in file FILENAME.mtl
        objContent += `usemtl texture_` + filename +  `\n`; // material name is texture_FILENAME

        // Inizializza l'array dei vertici usati
        let usedVertices = new Set();

        // Processa ogni trianglestrip
        patch.forEach((trianglestrip, stripIndex) => {
//            facesContent[stripIndex] = `
//# Trianglestrip ${stripIndex}\n`;

            facesContent[stripIndex] = `
\n`;

            for (let i = 2; i < trianglestrip.length; i++) {
                const v0 = trianglestrip[i - 2];
                const v1 = trianglestrip[i - 1];
                const v2 = trianglestrip[i];

                usedVertices.add(v0);
                usedVertices.add(v1);
                usedVertices.add(v2);

                // Determina l'ordine in base alla parità
                if (i % 2 === 0) {
                    facesContent[stripIndex] += `f ${v0 + 1}/${v0 + 1} ${v1 + 1}/${v1 + 1} ${v2 + 1}/${v2 + 1}\n`; // CCW
                } else {
                    facesContent[stripIndex] += `f ${v0 + 1}/${v0 + 1} ${v2 + 1}/${v2 + 1} ${v1 + 1}/${v1 + 1}\n`; // CW
                }
            }
        });

        // Crea una mappa di rimappatura degli indici dei vertici
        const indexMap = {};
        Array.from(usedVertices).sort((a, b) => a - b).forEach((index, newIndex) => {
            indexMap[index] = newIndex + 1; // Indici OBJ sono 1-based
        });

        // Aggiungi i vertici usati con la nuova numerazione
        Array.from(usedVertices).sort((a, b) => a - b).forEach(index => {
            const { x, y, z } = vertices[index];
            objContent += `v ${x} ${-y} ${z}\n`;
        });

        // Aggiungi le coordinate di texture per i vertici usati
        Array.from(usedVertices).sort((a, b) => a - b).forEach(index => {
            const { tx, ty } = vertices[index];
            objContent += `vt ${tx} ${1 - ty}\n`;
        });

        // Aggiorna i riferimenti alle facce con la nuova numerazione
        facesContent = facesContent.map(fc => {
            return fc.replace(/\bf (\d+)\/(\d+) (\d+)\/(\d+) (\d+)\/(\d+)\b/g, (_, v1, vt1, v2, vt2, v3, vt3) => {
                return `f ${indexMap[v1 - 1]}/${indexMap[v1 - 1]} ${indexMap[v2 - 1]}/${indexMap[v2 - 1]} ${indexMap[v3 - 1]}/${indexMap[v3 - 1]}`;
            });
        });

        facesContent.forEach(fc => {
            objContent += fc + "\n";
        });
    });

    // Aggiungi il file della texture come materiale separato
    const mtlContent = `newmtl texture_` + filename + `\nmap_Kd ${filename}.png\n`; // search for material texture_FILENAME in MTL file/library

    // Converti immagine
    const base64Data = textureBase64.split(",")[1]; // Estrai solo la parte Base64
    const binaryData = atob(base64Data); // Decodifica Base64 in binario
    const imgContent = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
        imgContent[i] = binaryData.charCodeAt(i);
    }

  filesObj[filename] = objContent;
  filesMtl[filename] = mtlContent;
  filesTexture[filename] = imgContent;

    return {imgContent, objContent, mtlContent};
}


function saveObjFiles(imgContent, objContent, mtlContent, filename) {
    // Salva immagine
    const txtBlob = new Blob([imgContent], { type: "image/png" });
    const txtUrl = URL.createObjectURL(txtBlob);
    const txtLink = document.createElement("a");
    txtLink.href = txtUrl;
    txtLink.download = `${filename}.png`;
    document.body.appendChild(txtLink);
    txtLink.click();
    document.body.removeChild(txtLink);
    URL.revokeObjectURL(txtUrl);

    // Salva l'OBJ
    const objBlob = new Blob([objContent], { type: "text/plain" });
    const objUrl = URL.createObjectURL(objBlob);
    const objLink = document.createElement("a");
    objLink.href = objUrl;
    objLink.download = filename + ".obj";
    document.body.appendChild(objLink);
    objLink.click();
    document.body.removeChild(objLink);
    URL.revokeObjectURL(objUrl);

    // Salva l'MTL file
    const mtlBlob = new Blob([mtlContent], { type: "text/plain" });
    const mtlUrl = URL.createObjectURL(mtlBlob);
    const mtlLink = document.createElement("a");
    mtlLink.href = mtlUrl;
    mtlLink.download = filename + ".mtl";
    document.body.appendChild(mtlLink);
    mtlLink.click();
    document.body.removeChild(mtlLink);
    URL.revokeObjectURL(mtlUrl);

}


function saveLodsToObj(level, filename) {
    result = null;
    if (level) {
console.log("Saving 1 level ", level)
          result = generateObjFromPatch( vstData.lods[level], vstData.vertices, vstData.textureFiles[0], filename);
    } else {
    // all levels
console.log("Saving all levels")
      for (var lodIdx = 0; lodIdx < vstData.lods.length; lodIdx++)  {
         result = generateObjFromPatch( vstData.lods[lodIdx], vstData.vertices, vstData.textureFiles[0], filename);
      };
    }
    saveObjFiles(result.imgContent, result.objContent, result.mtlContent, filename);
}

function saveScene() {
    for (const key in filesObj) {
        saveObjFiles(filesTexture[key], filesObj[key], filesMtl[key], key);
    }
}
