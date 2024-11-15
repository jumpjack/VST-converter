BASE_IMG_URL = "https://planetarydata.jpl.nasa.gov/w10n/mer2-m-navcam-5-disparity-ops-v1.0/mer2no_0xxx/";
IMG_RAW_FOLDER = "data/";
IMG_JPG_FOLDER = "browse/";
PRODUCT_FOLDER = "sol#SOLNUMBER#/rdr/"; // sol must be determined from VST // DEBUG!!   (Sol number is in .lbl of .vst file)
BASE_VST_URL = "https://planetarydata.jpl.nasa.gov/img/data/mer/spirit/mer2mw_0xxx/";
VST_CAMERA_FOLDER = "data/navcam/"; // (navcam --> mer2no_0xxx for images) // DEBUG: add other cameras!
VST_FOLDER_SITE_NAME = "site0137/";  // DEBUG! Site number is in filename (137=B1)
product_name_no_ext = "2n292378085vilb128f0006l0m1"; // 2n292377885vilb126f0006l0m1 = small vst for testing, sol 1870  // DEBUG
// 	2n292377885vilb126f0006l0m1
// 	2n292378085vilb128f0006l0m1
base_VST_filename = BASE_VST_URL + VST_CAMERA_FOLDER + VST_FOLDER_SITE_NAME + product_name_no_ext;
base_texture_folder = BASE_IMG_URL + IMG_JPG_FOLDER + PRODUCT_FOLDER;
base_texture_folderIMG = BASE_IMG_URL + IMG_RAW_FOLDER + PRODUCT_FOLDER;

let angles = 0;
let x3d = null;

 proxyURL = "https://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=";

const graphicalProducts = [
 "RAD",
 "RAL",
 "RSD",
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
 "CFL"
];


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

            async parse() {
console.log("HEADER - Started parsing...");
                // Parse header
                const header = new VSTHeader(this.dataView, this.offset);
//console.log("HEADER - Contents:",header);
                this.offset += 40; // Size of VSTHeader

                // Validate VST format
                if (header.label !== 0x00545356) {
                    throw new Error('Invalid VST file format');
                }

                if (header.implementation !== 0x0052454D) {
                    throw new Error('Implementation MER expected');
                }

                const needsReverse = header.byteOrder === 0x00010203;

                // Parse bounding box
                const bbox = new BoundingBox(this.dataView, this.offset, needsReverse);
                this.offset += 24; // Size of BoundingBox

			     // Parse texture references
			    for (let i = 0; i < header.textureNum; i++) {
			        // Leggi 2048 byte direttamente da DataView come array di byte
			        const textureBytes = new Uint8Array(this.dataView.buffer, this.offset, 2048);

			        // Converti i byte in stringa per poter ottenere il nome della texture
			        const textureRef = String.fromCharCode.apply(null, textureBytes);

			        // Ottieni il nome del file di texture e applica le modifiche necessarie
			        let textureName = textureRef.substring(10, 37) + '.img.jpg';
console.log("HEADER - textureName:", textureName);

					///// Found a suitable product, i.e. a real image:
					let textureUrlLeft = textureName.substring(0, 11);
					let textureUrlRight = textureName.substring(14);
					let siteNumberCoded = textureName.substr(14,2); // example: b1 = site 137, coded as "site037" in folder name
					let siteNumberString = "site0" + siteCodeToString(siteNumberCoded);
console.log("HEADER - siteNumberString=", siteNumberString);
					let solNumber = await getSolNumberFromLabel(txtProductId.value + ".lbl", siteNumberString);
console.log("HEADER - solNumber=", solNumber);

					angles = await getAltAzFromImgProduct("dummy",siteNumberString, solNumber)
console.log("HEADER - Searching texture...");

					let textureBASE64 = "error";
					for (let productIndex = 0; (( productIndex < graphicalProducts.length) && (textureBASE64 === "error")); productIndex++) {
						let textureUrlProduct = graphicalProducts[productIndex];
						base_texture_folder = base_texture_folder.replace("#SOLNUMBER#",solNumber);
				        let textureUrl = base_texture_folder + textureUrlLeft + textureUrlProduct + textureUrlRight;
						textureUrl = textureUrl.toLowerCase();
						textureBASE64 = await urlToBase64(textureUrl);
						if (textureBASE64 !== "error") {
						}
					};
					if (textureBASE64 === "error") {
						console.log("WARNING! Could not found texture in folder " + base_texture_folder);
					        this.textureFiles.push(null);
					} else {
					        // Aggiungi textureName all'array textureFiles
console.log("HEADER - Texture found.");
					        this.textureFiles.push(textureBASE64);
					}
			        // Aggiorna l'offset per la prossima texture
			        this.offset += 2048;
			    }

                // Skip coordinate system
                this.offset += 4096;

                // Read vertices
console.log("HEADER - Processing ",header.vertexNum, " vertices...");
                for (let i = 0; i < header.vertexNum; i++) {
                    const vertex = new Vertex(this.dataView, this.offset, needsReverse);
                    this.vertices.push(vertex);
                    this.offset += 20; // Size of Vertex
                }

                // Process LODs
console.log("HEADER - Processing ",header.lodNum, " LODs...");
                const lods = [];
                for (let i = 0; i < header.lodNum; i++) {
                    const lod = this.parseLOD(needsReverse);
                    lods.push(lod);
                }
console.log("HEADER - done.");

                return {
                    header,
                    bbox,
                    textureFiles: this.textureFiles,
                    vertices: this.vertices,
                    lods
                };
            }



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
        }

function generateX3D(vstData, whichLod) {
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
console.log("Inserting LOD n. ", lodIndex);
		if (lodIndex >= whichLod) {
	        x3d += `\n      <Shape id = "PROD_${product_name_no_ext}_LOD_${lodIndex}" bboxCenter="${bboxCenter.x} ${bboxCenter.y} ${bboxCenter.z}" bboxSize="${bboxSize.x} ${bboxSize.y} ${bboxSize.z}">`;

	        lod.patches.forEach(patch => {
	            if (patch.header.pointCloud === 1) {
	                // Handle point cloud
	                x3d += '\n          <PointSet>\n              <Coordinate point="';

	                const points = [];
	                patch.arrays.forEach(array => {
	                    array.forEach(vertexIndex => {
	                        points.push(formatPoint(vertices[vertexIndex]));
	                    });
	                });

	                x3d += points.join(', ');
	                x3d += '"/>\n          </PointSet>';
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
	                x3d += `\n          <Appearance>`;
					if (textureOk) {
	              		 x3d += `<ImageTexture url="` + finalUrl+ `"/>`
					}

		            x3d += `</Appearance>
		            <IndexedTriangleStripSet index="`;

	                // Add indices with strip separators
	                const indices = [];
	                patch.arrays.forEach((array, arrayIndex) => {
	                    if (arrayIndex > 0) indices.push(-1);
	                    indices.push(...array);
	                });
	                x3d += indices.join(' ');

	                // Add coordinates
	                x3d += `">\n              <Coordinate point="`;
	                const points = [];
	                for (let i = 0; i <= lod.header.vertMax; i++) {
	                    points.push(formatPoint(vertices[i]));
	                }
	                x3d += points.join(', ');
	                x3d += '"/>';

					if (textureOk) {
		                // Add texture coordinates
		                x3d += `\n              <TextureCoordinate point="`;
		                const texCoords = [];
		                for (let i = 0; i <= lod.header.vertMax; i++) {
		                    texCoords.push(formatTexCoord(vertices[i]));
		                }
		                x3d += texCoords.join(', ');
		                x3d += '"/>\n          ';
					}
					x3d += '</IndexedTriangleStripSet>';
	            }
	        });

	        x3d += '\n      </Shape>';
		}
    });

    x3d += '\n  </Scene>\n</X3D>';
    return x3d;
}


const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const convertBtn = document.getElementById('convertBtn');
const status = document.getElementById('status');

let selectedFile = null;

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
    const file = e.dataTransfer.files[0];
    handleFile(file);
});

// Funzione per gestire il file selezionato
function handleFile(file) {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.vst')) {
        showStatus('Per favore seleziona un file .vst', 'error');
        return;
    }

    selectedFile = file;
    convertBtn.disabled = false;
    showStatus(`File selezionato: ${file.name}`, 'success');
//	alert("OK, local file selected.");
	startConversion();
	txtProductId.value = file.name.replace(".vst","").replace(".VST","");
}


async function startConversion () {
showStatus("Conversion started", 'success');
	product_name_no_ext = document.getElementById("txtProductId").value; // 2n292377885vilb126f0006l0m1 = small vst for testing, sol 1870
	base_VST_filename = BASE_VST_URL + VST_CAMERA_FOLDER + VST_FOLDER_SITE_NAME + product_name_no_ext.toLowerCase();
	let txtVSTurl = base_VST_filename + ".vst"; // DEBUG

console.log("Mision:",BASE_VST_URL);
console.log("Camera:",VST_CAMERA_FOLDER);
console.log("Site:",VST_FOLDER_SITE_NAME);
console.log("Product:",product_name_no_ext);
console.log("Full url:",txtVSTurl);

  	let arrayBuffer;

   // try {
        if (selectedFile) {
console.log("Local:", selectedFile.name);
            // Se il file � selezionato dall'utente
            arrayBuffer = await selectedFile.arrayBuffer();
        } else if (txtVSTurl) {
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

console.log("Starting VST parsing...");
        // Parsing e generazione del contenuto X3D
        const parser = new VSTParser(arrayBuffer);
        const vstData = await parser.parse();

		// Invert Z coordinate (in MER system the positive vertical axis points to ground):
		const invertedVertices = vstData.vertices.map(item => ({
		    ...item,
		    z: -item.z
		}));
		vstData.vertices =  invertedVertices;
console.log("Inserting model into scene....");
        x3dContent = generateX3D(vstData, 1); // DEBUG: LOD must be selected by user; // DEBUG: Get the x3d file as returned value to pass to viewer
console.log("Conversion completed, now displaying...");

        showStatus('Conversione completata con successo!', 'success');



		loadX3DFile(x3dContent, angles.pancamAzimuthRad, -angles.pancamElevationRad);
    //} catch (error) {
       // showStatus(`Errore durante la conversione: ${error.message}`, 'error');
   // }
};


convertBtn.addEventListener('click', startConversion);


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
        throw new Error(`Errore durante la conversione dell'immagine: ${error.message}`);
    }
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




async function getSolNumberFromLabel(lblFileName, siteNumberString) {
	lblUrl = BASE_VST_URL + VST_CAMERA_FOLDER +  siteNumberString + "/" +  lblFileName ; // DEBUG: valid only up to site 0138, for Spirit!!
	lblFinalUrl = proxyURL + encodeURIComponent(lblUrl);
console.log("Retrieving label:",lblUrl);
    try {
        const response = await fetch(lblFinalUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                VSTlabel =  reader.result;
				solNumber = extractSol(VSTlabel);
				resolve(solNumber);
            };
            reader.onerror = reject;
            reader.readAsText(blob);
        });
    } catch (error) {
        throw new Error(`Errore durante il caricamento della label per leggere il Sol Number: ${error.message}`);
    }
}


async function getAltAzFromImgProduct(textureName, siteNumberString, solNumber) {
	let imgFileNameLeft = txtProductId.value.substring(0, 11);
	let imgFileNameRight = txtProductId.value.substring(14);
	let imgFileName = imgFileNameLeft + "thn" + imgFileNameRight + ".img"; // thumbnail is the shorter one, and we need just the label

	imgUrl = base_texture_folderIMG.replace("#SOLNUMBER#",solNumber)  +  imgFileName ; // DEBUG: valid only up to site 0138, for Spirit!!
	imgFinalUrl = proxyURL + encodeURIComponent(imgUrl);
console.log("-------------------Product IMG for label:",imgUrl);

    try {
        const response = await fetch(imgFinalUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                imgContents =  reader.result;
				resolve(extractVicarData(imgContents));
            };
            reader.onerror = reject;
            reader.readAsText(blob);
        });
    } catch (error) {
        throw new Error(`Errore durante la lettura di Altezza e Azimuth dal file ${imgFileName}: ${error.message}`);
    }
}


function extractSol(labelContent) {
    const match = labelContent.match(/PLANET_DAY_NUMBER\s*=\s*(\d+)/);
    if (match) {
        return parseInt(match[1], 10);
    } else {
        throw new Error("PLANET_DAY_NUMBER non trovato nel contenuto fornito.");
console.log("SOL NUMBER NOT FOUND: ",labelContent);
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



function extractVicarData(vicarLabelText) {
	PMA_anglesValuesRaw =  readVicarParameter(vicarLabelText, "PMA_ARTICULATION_STATE", "ARTICULATION_DEVICE_ANGLE");
	PMA_orientationValuesRaw = readVicarParameter(vicarLabelText, "PMA_ARTICULATION_STATE", "ARTICULATION_DEVICE_ANGLE")

	PANCAM_azimuthRaw = PMA_orientationValuesRaw["AZIMUTH-MEASURED"];
	PANCAM_elevationRaw = PMA_orientationValuesRaw["ELEVATION-MEASURED"];
	PANCAM_azimuthFOV_Raw = readVicarParameter(vicarLabelText, "INSTRUMENT_STATE_PARMS", "AZIMUTH_FOV")["AZIMUTH_FOV"];
	PANCAM_elevationFOV_Raw = readVicarParameter(vicarLabelText, "INSTRUMENT_STATE_PARMS", "ELEVATION_FOV")["ELEVATION_FOV"];


	pancamAzimuthRad = parseFloat(PANCAM_azimuthRaw.replace("<rad>",""));
	pancamElevationRad = parseFloat(PANCAM_elevationRaw.replace("<rad>",""));
	azimuthFOVdeg = parseFloat(PANCAM_azimuthFOV_Raw.replace("<deg>",""));
	elevationFOVdeg = parseFloat(PANCAM_elevationFOV_Raw.replace("<deg>",""));

	quaternionArray = readVicarParameter(vicarLabelText, "ROVER_COORDINATE_SYSTEM", "ORIGIN_ROTATION_QUATERNION").ORIGIN_ROTATION_QUATERNION;
	result = calculatePancamAngles([quaternionArray[0],quaternionArray[1],quaternionArray[2],quaternionArray[3]], pancamAzimuthRad, pancamElevationRad);

	return  {pancamAzimuthRad: result.finalAzimuth, pancamElevationRad : result.finalElevation, azimuthFOVdeg: azimuthFOVdeg, elevationFOVdeg : elevationFOVdeg};
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
           // var currentTransform = (rotationType === 'azimuth') ? trfAzimuth : trfElevation;
           // var currentRotation = currentTransform.getAttribute("rotation").split(" ");
           // var currentAngleRadians = parseFloat(currentRotation[3]);
           // var currentAngleDegrees = currentAngleRadians * (180 / Math.PI);
console.log(rotationType + " iniziale: " + initialAzimuth[shapeIndex-1]);
            var newAngleRadians;
            if (rotationType === 'azimuth') {
                newAngleRadians = (initialAzimuthDegrees + angleDegrees) * (Math.PI / 180);
                trfAzimuth.setAttribute("rotation", `0 1 0 ${newAngleRadians}`);
            } else if (rotationType === 'elevation') {
                newAngleRadians = (initialElevationDegrees + angleDegrees) * (Math.PI / 180);
                trfElevation.setAttribute("rotation", `1 0 0 ${newAngleRadians}`);
            }
console.log(rotationType + " finale: " + (newAngleRadians*180/3.14).toFixed(0));

            x3dom.reload();
        } else {
            console.error("Transform non trovati.");
        }
    } else {
        console.error("Shape non trovata.");
    }
}