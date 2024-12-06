// 0.7.0 - Added table for all products: raw textures, jpg textures, vst files; added download button for VST files (not working); fixed texture loading.
// 0.6.0 - Fixed bug of textures links
// 0.4.1 - Added texture loading
// 0.4.0 - Added list of textures, meshes and their folders
//         Added list of product ids for direct import in Blender using modded "phaseIV/Blender-Navcam-Importer" (https://github.com/jumpjack/Blender-Navcam-Importer)
// 0.3.0 -
// 0.2.0 - XYZ export working; experimenting with faces and PLY export (faces not working, format unknown)
let solDebug = 0;

VSTlinksArray = [];

// https://planetarydata.jpl.nasa.gov/img/data/mer/spirit/mer2no_0xxx/data/sol1869/edr/xxxxxxxxx.img         RAW IMG
// https://planetarydata.jpl.nasa.gov/img/data/mer/spirit/mer2no_0xxx/browse/sol1869/edr/xxxxxxxxx.img.jpg   BROWSE IMG

// Alternative: BASE_URL = "https://planetarydata.jpl.nasa.gov/w10n/mer2-m-navcam-5-disparity-ops-v1.0/";
BASE_URL =    "https://planetarydata.jpl.nasa.gov/img/data/mer/spirit/";
BASE_VST_URL = BASE_URL + "mer2mw_0xxx/data/";
IMG_RAW_FOLDER = "data/";
IMG_JPG_FOLDER = "browse/";

textureCameraFolder = "mer2no_0xxx/"; // mer2n_0xxx = NAVCAM, mer2po_0xxx = pancam, mer2ho_0xxx = hazcam
baseImageUrl = BASE_URL + textureCameraFolder;
solFolder = "sol#SOLNUMBER#/rdr/"; // sol must be determined from VST // DEBUG!!   (Sol number is in .lbl of .vst file)

// https://planetarydata.jpl.nasa.gov/img/data/mer/spirit/mer2mw_0xxx/data/pancam/site0137/xxxxxxVILxxxxxxx.vst
VSTcameraFolder = "pancam/"; // (pancam --> mer2po_0xxx for images) // DEBUG: add other cameras!
siteFolder = "site0137/";  //  Site number is in filename (137=B1)
product_name_no_ext = "2n292378085vilb128f0006l0m1"; // 2n292377885vilb126f0006l0m1 = small vst for testing, sol 1870  // DEBUG

proxyURL = "https://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=";

canvas = document.getElementById('texture');
ctx = canvas.getContext('2d');
canvasWidth = 1024;
canvasHeight = 1024;
ctx.clearRect(0, 0, canvasWidth, canvasHeight);
ctx.rect(0, 0, canvasWidth, canvasHeight);
ctx.fillStyle = 'blue';
ctx.fill();


/* Nodes types (https://irix7.com/techpubs/007-2783-001.pdf) :
pfNode 				General node (base class)
	pfScene 			Top level node.
	pfGroup 			Node with multiple children.
		pfSCS 				Static coordinate system.
		pfDCS 				Dynamic coordinate system.
		pfLOD 				Level of detail node.
		pfSequence 		Sequential animation node.
		pfSwitch 			Switch node.
	pfLayer 			Layer or decal node.
	pfGeode 			Fundamental geometry node.
    pfGeoStates [graphic state]
    pfGeoSets   [geometry]
	pfBillboard 	Special tracking leaf node.
	pfLightPoint 	One or more emissive light points.
	pfLightSource Definition of a graphics hardware light.
	pfPartition 	Special culling acceleration node.
	pfText 				2D and 3D text geometry.
     list of pfStrings
	pfMorph 			Geometry morphing node.
  pfMaterial
    pfMtlSide
    pfMtlAlpha
    pfMtlShininess
    pfMtlColor
    pfMtlColorMode
  pfTexture
    pfTexName
    pfTexImage
			pfGetTexImage(const pfTexture* tex, uint** image, int* comp, int* sx, int* sy, int* sz);
      image is an array of 4-byte words containing the texel data
      The texture image is loaded from left to right, bottom to top
      comp: number of 8-bit components per image pixel; 1, 2, 3, and 4 component textures are supported
      ns, nt, nr:  number of texels in the s, t, and r dimensions of image

    pfTexBorderColor
    pfTexBorderType
    pfTexFormat
    pfTexFilter
    pfTexRepeat
    pfTexSpline
    pfTexDetail
    pfDetailTexTile
    pfTexList
    pfTexFrame
    pfTexLoadMode
    pfTexLevel

*/

/*
================== TEXTURES ===============
https://techpubs.jurassic.nl/manuals/0640/developer/Perf_GetStarted/sgi_html/ch08.html

Textures can have as many as four components. The following are example uses:
1 component:  intensity (I) or luminance (L) only.
2 components: intensity and transparency (IA).
3 components: red, green, and blue (RGB).
4 components: red, green, blue, and alpha (RGBA).

*/
/*
// ????????:
// https://github.com/NPSNET-IV/NPSNET-IV/blob/09ad5905964b1eb3463b8500b0a6c541707fa13f/src/database/tsg/tsgROpen.c
  pfTexEnv *tenv;
  ieee32 red,green,blue,alpha;
  int8 bval;
  int mode_val;

  pfTexGen *tgen;
  int8 bval;
  ieee32 x,y,z,d; // texture plane equation
  int mode_val,type;
  int i;


  pfTexture *tex;
  char *name;
  int8 clamp;
  int i;
  int pfflags;
  int32 flags;


  pfGeoState *gst;
  void *arena = pfGetSharedArena();
  int8 bval;
  int32 ival;
  ieee32 fval;
  int mode_val;
  pfMaterial *mtl;
  int i,j,k;
  int8 fieldid;


  pfMaterial *mtl;
  int8 bval;
  ieee32 fval;
  ieee32 color[3];
  int mode_val,side,colormode_side;

  pfColortable *table;
  int32 numcolors;
  ieee32 red,green,blue,alpha;
  pfVec4 color;
  int i;

  pfFog *fog;
  int8 bval;
  ieee32 red,green,blue;
  ieee32 near,far;
  ieee32 bias;
  ieee32 *range,*density;
  int32 numpoints;
  int mode_val;
  void *arena = pfGetSharedArena();
  int i;

  pfLightModel *lmodel;
  int8 bval;
  ieee32 atten0,atten1,atten2;
  int mode;
  ieee32 red,green,blue;



*/


	myPFB = null;
	myImg = null;
  TEXTURE_WIDTH = 1024; // to do: implement KSY reader for just PDS label, extract texture metadata and use  them to implement generic texture reader
  TEXTURE_HEIGHT = 1024;

  MAGIC_LENGTH = 4;
  UNK_LENGTH = 4;
	PFB_HEADER_LENGTH = MAGIC_LENGTH + 3*UNK_LENGTH; // 16 bytes

	TYTPE_LENGTH = 4;
  COUNT_LENGTH = 4;
  TOTAL_SIZE_LENGTH = 4;
	NODE_HEADER_LENGTH = TYTPE_LENGTH + COUNT_LENGTH +  TOTAL_SIZE_LENGTH; // 12 bytes

  OPPORTUNITY = "1"; // First letter of filename
  SPIRIT = "2";
  roverName = ["","opportunity", "spirit"];


	PLY_HEADER_BASE = "" +
		"ply\n" +
		"format ascii 1.0\n" +
		"comment Created by PFB JS convereter\n" +
		"element vertex VVVV\n" +
		"property float x\n" +
		"property float y\n" +
		"property float z\n" +
/*		"TTTT" +*/
		"element face FFFF\n" +
		"property list uchar int vertex_index\n" +
		"end_header\n";

	PLY_TEXTURE_HEADER = "" +
		"property uchar red\n" +
		"property uchar green\n" +
		"property uchar blue\n";

  PLYfiles = [];
  XYZfiles = [];

	const PFB_Selector = document.getElementById('inpPFBfile');
	PFB_Selector.addEventListener('change', (event) => {
		loadPFB(event.target.files[0])
	});


	const TXT_Selector = document.getElementById('inpTXTfile');
	TXT_Selector.addEventListener('change', (event) => {
		loadTextures(event.target.files[0])
	});


	function saveFile(fileContent, filename,status_id) {
		myBlob = new Blob([fileContent], {type: "application/octet-stream"});
		var url = window.URL.createObjectURL(myBlob);
		var anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = filename;
//	a(anchor);
        anchor.addEventListener('load', (event) => {
			console.log("LOAD");
		});

        anchor.addEventListener('ended', (event) => {
			console.log("ENDED");
		});

        anchor.addEventListener('loadeddata', (event) => {
			console.log("loadeddata");
		});

        anchor.addEventListener('loadstart', (event) => {
			console.log("loadstart");
		});
        anchor.addEventListener('mousedown', (event) => {
			console.log("mousedown");
		});


		anchor.click();
		window.URL.revokeObjectURL(url);
        document.getElementById(status_id).innerHTML = "Saved to " + filename;
	}




async function loadTextures(handler1) {
  const canvas = document.getElementById('texture');
  const ctx = canvas.getContext('2d');
  const width = 1024;
  const height = 1024;


  function processImage(imageDataCanvas, imgDataFromFile) {
    const data = imageDataCanvas.data;

    for (let y = 0; y < height-1; y++) {
      for (let x = 0; x < width-1; x++) {
        const rgb = imgDataFromFile.lines[y].samples[x] / 10;
        const idx = (y * width + x) * 4;

        data[idx] = rgb;     // R
        data[idx + 1] = rgb; // G
        data[idx + 2] = rgb; // B
        data[idx + 3] = 255; // A
      }
    }

    ctx.putImageData(imageDataCanvas, 0, 0);
  }



  function loadSingleTexture(handler) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const rawFileContents = event.target.result;
        const fileContentsUInt8 = new Uint8Array(rawFileContents);
        const st = new KaitaiStream(fileContentsUInt8);
        const imgDataFromFile = new ImgGray16(st);
console.log("LOADED IMG DATA:", imgDataFromFile);
        const imageDataCanvas = ctx.createImageData(width, height);
        processImage(imageDataCanvas, imgDataFromFile);

        resolve();
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(handler);
    });
  }

/*

  // Carica le texture in sequenza
  async function loadBothTextures() {
    try {
      await loadSingleTexture(handler1);
      console.log("Texture caricata con successo");
    } catch (error) {
      console.error("Errore durante il caricamento della texture:", error);
    }
  }
*/
await loadSingleTexture(handler1);
  //loadBothTextures();
}


nodeTypes = [
	"Materials", 			//0
	"Textures list", 	//1
	"Texenv?",        //2
	"GeoStates",      //3
	"Lenghts lists",  //4
	"Vertex lists",   //5
	"Colors lists",   //6
	"Normals lists",  //7
	"Texcoords lists",//8
	"UNKNOWN", 				//9
	"GeoSets", 				//10
	"UNKNOWN", 				//11
	"Nodes",					//12
	"UNKNOWN", 				//13
	"UNKNOWN", 				//14
	"UNKNOWN", 				//15
	"UNKNOWN", 				//16
	"TexGens", 				//17
	"Light models", 	//18
	"UNKNOWN", 				//19
	"UNKNOWN", 				//20
	"UNKNOWN", 				//21
	"UNKNOWN", 				//22
	"UNKNOWN", 				//23
	"UNKNOWN", 				//24
	"UNKNOWN", 				//25
	"UNKNOWN", 				//26
	"Images", 				//27
]

function nodeIs(received, mustBe) {
	return (nodeTypes[received].toUpperCase().indexOf(mustBe) >= 0);
}

async function loadPFB(fileHandler) {
  totalListLenght = [];
  totalLenght = 0;
	myName = fileHandler.name;
	const reader = new FileReader();
	reader.addEventListener('load', async (event) => {
		rawFileContents = event.target.result;
		fileContentsUInt8 = new Uint8Array(rawFileContents); // Extract from the generic ArrayBuffer an array of Unsigned Integers (0..255)
		console.log("Loaded", rawFileContents.byteLength , " bytes.");
		document.getElementById("file_status").innerHTML = "Loaded";
		document.getElementById("file_length").innerHTML = fileContentsUInt8.length + " bytes";

		st = new KaitaiStream(fileContentsUInt8);
		myPFB = new Pfb	(st);
    nodeOffset = PFB_HEADER_LENGTH;
console.log(myPFB);
console.log("Total nodes:", myPFB.nodes.length);
		vertexDB = [];
		vertexDBstr = "";
    facesDB = [];
    facesDBstr = "";
		normalsDB = [];
    normalsDBstr = "";
		checkTextures=document.getElementById("chkTextures").value;
		texturesNodesFound = false;
console.log("CHECK=",checkTextures && texturesNodesFound);

		for (var nodeIndex = 0; ((nodeIndex < myPFB.nodes.length) && (checkTextures && !texturesNodesFound)); nodeIndex++) {
console.log("======================");
			thisNode = myPFB.nodes[nodeIndex];
console.log(nodeIndex +
				" - type: " + thisNode.type + " (" +	nodeTypes[thisNode.type] + "), count: " +
				myPFB.nodes[nodeIndex].contents.count + ", size: dec" +
				myPFB.nodes[nodeIndex].contents.totalSize + ", Offset: 0x" +
				nodeOffset.toString(16)
			);


			/////// Put all vertices in a single sequence:
			if (nodeIs(thisNode.type,"VERTEX")) {
				if (!checkTextures) {
console.log("    Processing VERTEX");
				  totalListLenghtV = [];
				  totalLenghtV = 0;
					for (var listIndex=0 ; listIndex < thisNode.contents.lists.length; listIndex++) {
						var thisListV = thisNode.contents.lists[listIndex];
//console.log("Processing list " + listIndex  + ", containing " + thisListV.elements.length + " vertices...");
						totalListLenghtV[listIndex] = 0;
						for (var elemIndex = 0; elemIndex < thisListV.elements.length ;elemIndex++) {
							totalListLenghtV[listIndex] += 1
							vertexObj = thisListV.elements[elemIndex];
							vertexDB.push(vertexObj);
							vertexStr = "";
							vertexStr += vertexObj.x + " " + vertexObj.y + " " + vertexObj.z;
							vertexDBstr += vertexStr + "\n";
						}
//						console.log("   ListV " , listIndex, ": ", thisListV.size , " vertices, ",  totalListLenght[listIndex]  );
						totalLenghtV += totalListLenghtV[listIndex];
					}
				}
			}  else


			/////// Create faces as groups of pointers to vertices
			// LENGTHSLISTS
			//   |
			//   +-- Num of lists  (69)
			//   |
			//   +-- LENGHTSLIST [0]
			//   |     |
			//   |     +-- Num of lengths (54)
			//   |     |
			//   |     +-- LENGTH 0 = 3   // 3 vertex = 1 triangle in the strip? Each length means 1 strip?
			//   |     |
			//   |     +-- LENGTH 1 = 6  // 6 vertex = 4 triangles in the strip? Each length means 1 strip?
			//   |     |
			//   |     ...
			//   |     |
			//   |     +-- LENGTH 63 = 4
			//   |
			//   |
			//   +-- LENGHTSLIST [1]
			//   |
			//   ...
			//   |
			//   +-- LENGHTSLIST [68]
			//
      // Each lenght  a strip? How many triangles? len or len-2 as in VST format?

			if (nodeIs(thisNode.type,"LENGHTS") ) {
				if (!checkTextures) {
	console.log("    Processing LENGHTS");
					var listsCount = thisNode.contents.lists.length;
					vertexOffset = 0;
	        strips = [];
					for (var listIndex=0 ; listIndex < listsCount; listIndex++) { // Each list is a strip of faces or a list of strips of faces?
						thisList = thisNode.contents.lists[listIndex];
						arrayLengths = thisList.elements; // Each length refers to a strip, i.e. length <=> strip
						for (var arrayLengthIndex = 0; arrayLengthIndex < arrayLengths.length; arrayLengthIndex++) {
							var thisArrayLength = arrayLengths[arrayLengthIndex];
							// array = [0,1,2,3,4], arrayLength = 5, striplLength = 3
							strip = [];
							for(var triangleIndex = 2; triangleIndex < thisArrayLength; triangleIndex++) { // Create triangle strip
								triangle = [vertexOffset+2, vertexOffset+1, vertexOffset+0];
	              strip.push(triangle);
								vertexOffset++;
							} // parse vertices
							strips.push(strip);
						} // parse lengths
					} // parse lists
				}
			}  else  // if node is lengthslists

			if (nodeIs(thisNode.type,"TEXTURES LIST")) {
console.log("    Processing TEXTURES LIST");
				texturesNodesFound = true;
				texturesList = thisNode.contents.textures;
				blenderList = "";
				productsList = "<br>";
				textureLinksArray = [];
				XYZlinksArray = [];
				VSTlinksArray = [];
				thumbnailLinksArray = [];
				textureFolderLinksArray = [];
				XYZfolderLinksArray = [];
				VSTfolderLinksArray = [];
				for (const textureElement of texturesList) {
/*
2N290962708XYLB0HMP0755L0M2
# 0:     2         = MER2
# 1:     N         = Navcam
# 2-10:  290962708 = Spacecraft clock
# 11-13: XYL       = XYL product
# 14-15: B0        = site
# 16-17: HM        = drive/position w.r.t site
# 18-22: P0755     = sequence (�P�  -  PMA & Remote Sensing instr.  (Pancam, Navcam, Hazcam, MI, Mini-TES)
# 23:    L         = left
# 24:    0         = filter
# 25:    M         = Author (MIPL)
# 26:    2         = Product version
*/
console.log("\n=================================\n");
console.log("        TEXTURE: ", textureElement.filename.contents);
					roverId = textureElement.filename.contents.substr(0,1);
					cameraId = textureElement.filename.contents.substr(1,1)
                    if ((cameraId.toLowerCase() === "r") || (cameraId.toLowerCase() === "f")) {
                        cameraId = "h";
                    }
					sclk = textureElement.filename.contents.substr(2,9);
					//sol = sclkToSol(sclk, roverId);
					siteId = textureElement.filename.contents.substr(14,2);
					siteString = "site0" + siteCodeToString(siteId);
					rawProductId = textureElement.filename.contents.toUpperCase().replace(".RGB","");

					let textureUrlLeft = rawProductId.substring(0, 11);
					let textureUrlRight = rawProductId.substring(14);
					let siteNumberCoded = rawProductId.substr(14, 2);
					let siteNumberString = "site0" + siteCodeToString(siteNumberCoded);
					sol = await getSolNumberFromLabel(rawProductId + ".lbl", siteString);

					driveId = textureElement.filename.contents.substr(16,2);
					sequenceId = textureElement.filename.contents.substr(18,5);
					textureBaseUrl = "https://pds-imaging.jpl.nasa.gov/data/mer/" + roverName[roverId*1] + "/mer" + roverId  + cameraId.toLowerCase() + "o_0xxx/browse/sol" + zeroes(sol,4) + "/rdr/";
					XYZBaseUrl = "https://pds-imaging.jpl.nasa.gov/data/mer/" + roverName[roverId*1] + "/mer" + roverId  + cameraId.toLowerCase() + "o_0xxx/data/sol" + zeroes(sol,4) + "/rdr/";
					VSTBaseUrl = "https://pds-imaging.jpl.nasa.gov/data/mer/" + roverName[roverId*1] + "/mer" + roverId  + "mw_0xxx/data/" + VSTcameraFolder + siteString;
console.log(cameraId,textureBaseUrl);
					blenderList += rawProductId + ",";
					productsList += rawProductId + " - (clock: " + sclk +  ", sol: " + sol + ", site: " + siteId + ", drive: " + driveId + ", sequence: " +  sequenceId + ")<br>";

					textureProductId = rawProductId.replace("XYL","FFL").toLowerCase();
					textureProductId = textureProductId.substring(0, 26) + "1" + textureProductId.substring(27); // Force version 1 for IMG/JPG product

					//textureLink = textureBaseUrl + textureProductId + ".img.jpg";
					textureLinksArray.push({folder : textureBaseUrl, file: textureProductId + ".img.jpg"});

					XYZproductId = rawProductId.toLowerCase();
					XYZLink = XYZBaseUrl + XYZproductId + ".img";
					XYZlinksArray.push({folder : XYZBaseUrl, file : XYZproductId + ".img"});

					VSTproductId = rawProductId.replace("XYL","VIL").toLowerCase();
					VSTcameraFolder = getCameraFolder(VSTproductId);
					VSTLink = BASE_VST_URL + VSTcameraFolder +  siteString + "/" + VSTproductId + ".vst";
					VSTlinksArray.push({folder : BASE_VST_URL + VSTcameraFolder +  siteString + "/", file : VSTproductId + ".vst"});

					thumbnailProductId = rawProductId.replace("XYL","RSN").toLowerCase();
					thumbnailProductId = thumbnailProductId.substring(0, 26) + "1" + thumbnailProductId.substring(27); // Force version 1 for IMG/JPG product
					thumbnailLink = textureBaseUrl + thumbnailProductId + ".img.jpg";
					thumbnailLinksArray.push(thumbnailLink);

					textureFolderLinksArray.push(textureBaseUrl);
					XYZfolderLinksArray.push(XYZBaseUrl);
					VSTfolderLinksArray.push(VSTBaseUrl);
				};
				blenderList = blenderList.substr(0,blenderList.length-1);
				addLinksToPage();
			} else  // if node is Textures

			if (nodeIs(thisNode.type,"NORMALS LIST")) {
				if (!checkTextures) {
console.log("    Processing NORMALS LIST");
					totalListLenghtN = [];
					totalLenghtN = 0;
	//console.log("Building normals db...");
					for (var listIndex=0 ; listIndex<thisNode.contents.lists.length; listIndex++) {
						var thisListN = thisNode.contents.lists[listIndex];
		//console.log("Processing list " + listIndex  + ", containing " + thisListN.elements.length + " vertices...");
						totalListLenghtN[listIndex] = 0;
						for (var elemIndex = 0; elemIndex < thisListN.elements.length ;elemIndex++) {
							totalListLenghtN[listIndex] += 1
							normalObj = thisListN.elements[elemIndex];
							normalsDB.push(normalObj);
							normalStr = "";
							normalStr += normalObj.x + " " + normalObj.y + " " + normalObj.z;
							normalsDBstr += normalStr + "\n";
						}
						//						console.log("   ListV " , listIndex, ": ", thisListN.size , " vertices, ",  totalListLenght[listIndex]  );
						totalLenghtN += totalListLenghtN[listIndex];
					}
				}
			}  else { // if node is NormalsLists
console.log("    SKIPPING " + thisNode.type + " (" + nodeTypes[thisNode.type]   +  ", not implemented yet.");
			}
  			nodeOffset +=  NODE_HEADER_LENGTH + thisNode.contents.totalSize;

		} // nodes

		if (!checkTextures) {
	  		createPLY();

			XYZfile = "";
			vertexGlobalIndex = 0;
			var PFBvertexNode = myPFB.nodes[1]; // debug: non � detto che sia sempre in posizione 1
			var PFBtexturesNode = myPFB.nodes[4]
			PFBvertexLists = PFBvertexNode.contents.lists;
			PFBtexturesLists = PFBtexturesNode.contents.lists;
			for (var vertListIndex = 0; vertListIndex < PFBvertexLists.length; vertListIndex++) {
				PFBvertList = PFBvertexLists[vertListIndex];
				PFBtextureList = PFBtexturesLists[vertListIndex];
				for (vertIndex = 0; vertIndex < PFBvertList.elements.length; vertIndex++) {
					var vertex = PFBvertList.elements[vertIndex];
				    var texture = PFBtextureList.elements[vertIndex];
				    TextureX = (texture.s * 2048).toFixed(0)*1; // debug orizz
				    TextureY = (texture.t * 1024).toFixed(0)*1; //
				    if (TextureX < 1024) {
				       colorVal = myImg1.lines[TextureX].samples[TextureY]
				    } else {
				       colorVal = myImg2.lines[TextureX-1024].samples[TextureY]
				    }
				    writeCanvas(TextureX,TextureY,colorVal/16,colorVal/16,colorVal/16)
					XYZline = "" +
						vertex.x + " " +
						vertex.y + " " +
						vertex.z + " " +
						colorVal  + " " +
						colorVal  + " " +
						colorVal;
				/*	if (normalsDB.length > 0) {
				  XYZline += "" +
				    normalsDB[vertexGlobalIndex]
				}*/
				vertexGlobalIndex++;
				XYZfile += XYZline + "\n";
				}
			}
		}
	});
	reader.readAsArrayBuffer(fileHandler);
}


function createPLY() {
	for (stripIndex = 0; stripIndex < strips.length; stripIndex++) {
		strip = strips[stripIndex];
		for (var triangleIndex = 0; triangleIndex < strip.length; triangleIndex++) {
			triangle = strip[triangleIndex];
			face = []
	    faceStr = triangle.length + " ";
			for (var vertexIndex =0; vertexIndex<triangle.length;  vertexIndex++) {
				vertexPointer = triangle[vertexIndex];
				face.push(vertexPointer);
				faceStr += vertexPointer + " ";
			}
			facesDB.push(face);
	    facesDBstr += faceStr + "\n";
		}
	}

	PLYheader = PLY_HEADER_BASE.replace("VVVV", vertexDB.length);
	PLYheader = PLYheader.replace("FFFF", facesDB.length);
	PLYfile = PLYheader + vertexDBstr + facesDBstr;


}

function savePLY() {
	saveFile(PLYfile, myName + ".ply","file_status");
}


function saveXYZ() {
	saveFile(XYZfile, myName + ".txt","file_status");
}


function loadTexture() {

}


function sclkToSol(sclkstring, rover) {

    // Calculate sol number given SCLK string (credits: https://github.com/phaseIV/Blender-Navcam-Importer )
    MSD = (sclkstring/88775.244) + 44795.9998;

    sol = MSD - 49269.2432411704;
    sol = sol + 1; // for sol 0
    sol = Math.floor(Math.ceil(sol));

    deviate = 0;

    if (rover == OPPORTUNITY) {
        deviate = 3028
    }

    if (rover == SPIRIT) {
        deviate = 3048
    }

    return sol+deviate
}



function zeroes(number, figures) {
  temp = "";
  for(var i = figures; i > 0 ; i--) {
    confr = 10**(i-1);
    if (number < confr)
      temp += "0";
  }
  return temp + number;
}




function addLinksToPage() {
    // Creazione della tabella e dell'header
    const table = document.createElement("table");
	table.setAttribute("Border","1");
    const tableHeader = document.createElement("tr");

    // Array degli header
    const headers = ["Product ID", "JPG FFL texture",  "IMG FFL texture", "JPG RSN thumbnail","VST file"];

    // Creazione delle celle header
    headers.forEach(headerText => {
        const td = document.createElement("td");
        td.innerHTML = headerText;
        tableHeader.appendChild(td);
    });

    table.appendChild(tableHeader);

    // Ciclo principale per popolare la tabella
    // Assumiamo che tutti gli array abbiano la stessa lunghezza
    const rowCount = Math.max(
        textureLinksArray.length,
        XYZlinksArray.length,
        thumbnailLinksArray.length,
        VSTlinksArray.length
    );

    for (let i = 0; i < rowCount; i++) {
        const row = document.createElement("tr");

        // Colonna 1 - Product ID (assumiamo che sia presente nell'oggetto)
        const tdProductId = document.createElement("td");
        tdProductId.innerHTML = textureLinksArray[i]?.file.split('.')[0] || '';
        row.appendChild(tdProductId);

        // Colonna 2
        const tdRawTexture = document.createElement("td");
        if (textureLinksArray[i]) {
            tdRawTexture.innerHTML = `
                <a href="${textureLinksArray[i].folder}${textureLinksArray[i].file}">
                    File
                </a>,
                <a href="${textureFolderLinksArray[i]}">Folder</a>
            `;
        }
        row.appendChild(tdRawTexture);

        // Colonna 3 - IMG FFL texture
        const tdJpgTexture = document.createElement("td");
        if (textureLinksArray[i]) {
            tdJpgTexture.innerHTML = `
                <a href="${XYZlinksArray[i].folder}${textureLinksArray[i].file.replace(".jpg","")}">
                    File
                </a>,
                <a href="${XYZfolderLinksArray[i]}">Folder</a>
            `;
        }
        row.appendChild(tdJpgTexture);

        // Colonna 4 - JPG thumbnail
        const tdThumbnail = document.createElement("td");
        if (thumbnailLinksArray[i]) {
            tdThumbnail.innerHTML = `<img src="${thumbnailLinksArray[i]}" alt="thumbnail">`;
        }
        row.appendChild(tdThumbnail);

        // Colonna VST file
        const tdVST = document.createElement("td");
        if (VSTlinksArray[i]) {
            tdVST.innerHTML = `
                <a href="${VSTlinksArray[i].folder}${VSTlinksArray[i].file}">
                    File
                </a>,
                <a href="${VSTlinksArray[i].folder}">Folder</a>
            `;
        }
        row.appendChild(tdVST);

        table.appendChild(row);
    }

    // Aggiunta della tabella al documento
	document.getElementById("myTable").innerHTML = "";
    document.getElementById("myTable").appendChild(table);
/*
    // Aggiunta delle informazioni aggiuntive
    document.getElementById("spnBlender").innerHTML =
        `Past this sequence into <a href='https://github.com/jumpjack/Blender-Navcam-Importer'>Blender Navcam Importer</a> dialog:<br>${blenderList}<br>${productsList}<br>`;

    document.getElementById("spnTextureLinks").innerHTML =
        `Links to save in %TEMP%\\MarsRoverImages\\mer\\gallery\\all\\${roverId}\\${cameraId.toLowerCase()}\\${zeroes(sol,4)}<br>`;

    document.getElementById("spnXYZLinks").innerHTML =
        `Links to save in %TEMP%\\MarsRoverImages\\mer\\mer${roverId}${cameraId.toLowerCase()}o_0xxx\\data\\sol${zeroes(sol,4)}<br>`;

    document.getElementById("spnVSTLinks").innerHTML = "Links to VST files:<br>";
*/
    // Aggiunta delle miniature in fondo
    document.getElementById("spnThumbnails").innerHTML =
        thumbnailLinksArray.map(thumb => `<img src="${thumb}">`).join('');
}



/*
function addLinksToPage() {
	table = document.createElement("table");
	tableHeader = document.createElement("TR");
	td = document.createElement("TD");
	td.innerHTML = "Product id";
	tableHeader.appendChild(td);

	td = document.createElement("TD");
	td.innerHTML = "RAW texture";
	tableHeader.appendChild(td);

	td = document.createElement("TD");
	td.innerHTML = "JPG texture";
	tableHeader.appendChild(td);

	td = document.createElement("TD");
	td.innerHTML = "JPG thumbnail";
	tableHeader.appendChild(td);

	td = document.createElement("TD");
	td.innerHTML = "VST file";
	tableHeader.appendChild(td);

  document.getElementById("spnBlender").innerHTML = "Past this sequence into <a href='https://github.com/jumpjack/Blender-Navcam-Importer'>Blender Navcam Importer</a> dialog:<br>" + blenderList + "<br>" + productsList + "<br>";

  document.getElementById("spnTextureLinks").innerHTML = "Links to save in %TEMP%\\MarsRoverImages\\mer\\gallery\\all\\" + roverId + "\\" + cameraId.toLowerCase() + "\\" + zeroes(sol,4) + "<br>";
  for (var textureIndex = 0; textureIndex < textureLinksArray.length; textureIndex++) {

//console.log("aggiungo " + textureLinksArray[textureIndex] );
    document.getElementById("spnTextureLinks").innerHTML += "<a href='" + textureLinksArray[textureIndex].folder + textureLinksArray[textureIndex].file + "'>" + textureLinksArray[textureIndex].file + "</a> (<a href='" + textureFolderLinksArray[textureIndex]  + "'>Folder</a>)<br>";
  }

  // C:\Users\USER\AppData\Local\Temp\MarsRoverImages\mer\mer2no_0xxx\data\sol01907
  document.getElementById("spnXYZLinks").innerHTML = "Links to save in %TEMP%\\MarsRoverImages\\mer\\mer" + roverId +  cameraId.toLowerCase() + "o_0xxx\\data\\sol" + zeroes(sol,4) + "<br>";
  document.getElementById("spnVSTLinks").innerHTML = "Links to VST files:<br>";
  for (var XYZIndex = 0; XYZIndex < XYZlinksArray.length; XYZIndex++) {
//console.log("   aggiungo " + XYZlinksArray[XYZIndex] );
    document.getElementById("spnXYZLinks").innerHTML += "<a href='" + XYZlinksArray[XYZIndex].folder + XYZlinksArray[XYZIndex].file + "'>" + XYZlinksArray[XYZIndex].file + "</a> (<a href='" + XYZfolderLinksArray[XYZIndex]  + "'>Folder</a>)<br>";
    document.getElementById("spnVSTLinks").innerHTML += "<a href='" + VSTlinksArray[XYZIndex].folder + VSTlinksArray[XYZIndex].file + "'>" + VSTlinksArray[XYZIndex].file + "</a> (<a href='" + VSTfolderLinksArray[XYZIndex]  + "'>Folder</a>)<br>";
  }

  document.getElementById("spnThumbnails").innerHTML = "";
  for (var thIndex = 0; thIndex < thumbnailLinksArray.length; thIndex++) {
//console.log("   aggiungo " + thumbnailLinksArray[thIndex] );
    document.getElementById("spnThumbnails").innerHTML += "<img src='" + thumbnailLinksArray[thIndex] + "'>";
  }

}
*/

  function writeCanvas(x,y,r,g,b) {
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.fillRect(x,y,x+1,y+1);
  }



async function getSolNumberFromLabel(lblFileName, siteNumberString) {
    let content;

    // Verifica se il File System Access API è supportato
    if ('showDirectoryPicker' in window) {
console.log("getSolNumberFromLabel -  showDirectoryPicker AVAILABLE");
        try {
            // Memorizza l'handle della directory per riutilizzarlo
            if (!window.labelsDirHandle) {
                window.labelsDirHandle = await window.showDirectoryPicker({
                    startIn: 'downloads',
                    mode: 'readwrite' // Modificato a readwrite per permettere la scrittura
                });
            }

            try {
                // Prova ad accedere al file locale
                const fileHandle = await window.labelsDirHandle.getFileHandle(lblFileName);
                const file = await fileHandle.getFile();
                content = await file.text();

console.log("##########   Using local file:", lblFileName);
                const solNumber = extractSol(content, lblFileName);
console.log("---     Sol for", lblFileName, "is:", solNumber);
                return solNumber;
            } catch (e) {
                // File non trovato localmente, procediamo con il download
console.log("!!!!!!!!!!  File not found locally, downloading...");
                content = await downloadAndSaveFile(lblFileName, siteNumberString);
            }
        } catch (e) {
            console.warn("Failed to access local filesystem:", e);
            // Se fallisce l'accesso al filesystem, procediamo con il download
            content = await downloadAndSaveFile(lblFileName, siteNumberString);
        }
    } else {
console.log("getSolNumberFromLabel -  showDirectoryPicker  NOT AVAILABLE");
        // Se File System Access API non è supportato, procediamo solo con il download
        content = await downloadAndSaveFile(lblFileName, siteNumberString);
    }

    const solNumber = extractSol(content, lblFileName);
    console.log("---     Sol for", lblFileName, "is:", solNumber);
    return solNumber;
}

async function downloadAndSaveFile(lblFileName, siteNumberString) {
    try {
        const VSTcameraFolder = getCameraFolder(lblFileName);
        const lblUrl = BASE_VST_URL + VSTcameraFolder + siteNumberString + "/" + lblFileName;
        const lblFinalUrl = proxyURL + encodeURIComponent(lblUrl.toLowerCase());

console.log("---- Attempting DOWNLOAD of label to extract sol:", lblUrl);

        const response = await fetch(lblFinalUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

console.log("-------     File found online.");
        const blob = await response.blob();

        // Salva il file scaricato localmente se possibile
        if (window.labelsDirHandle) {
            try {
                const fileHandle = await window.labelsDirHandle.getFileHandle(lblFileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
console.log("-------     Saved file locally for future use");
            } catch (e) {
                console.warn("-------     Failed to save file locally:", e);
            }
        }

        // Converti il blob in testo
        return await blob.text();

    } catch (error) {
        throw new Error(`Errore durante il recupero o la conversione dell'etichetta: ${error.message}`);
    }
}




async function downloadAllVSTFiles() {
    // Disabilita il pulsante durante il download
    const downloadButton = document.getElementById('downloadVSTButton');
    downloadButton.disabled = true;

    try {
// Invece di creare dinamicamente, usa l'elemento esistente
const progressContainer = document.getElementById('downloadProgressContainer');
const progressBar = document.getElementById('downloadProgress');
const progressText = document.getElementById('progressText');

// Resetta e mostra la barra di progresso
progressContainer.style.display = 'block';
progressBar.max = VSTlinksArray.length;
progressBar.value = 0;
progressText.textContent = `0/${VSTlinksArray.length} files downloaded`;

        // Cartella di download (potrebbe variare a seconda del browser)
        const downloadFolder = 'VSTFiles_' + new Date().toISOString().replace(/[:.]/g, '-');

        // Ciclo per scaricare tutti i file
        for (let i = 0; i < VSTlinksArray.length; i++) {
console.log("Cerco file " +  VSTlinksArray[i].file + " trovato...");
            try {
                // Costruisci l'URL completo
                const VSTurl = `${VSTlinksArray[i].folder}${VSTlinksArray[i].file}`;
                const VSTfinalUrl = proxyURL + encodeURIComponent(VSTurl.toLowerCase());
console.log("      Url pronto: ", VSTurl);

                // Fetch del file
                const response = await fetch(VSTfinalUrl);
                if (!response.ok) {
                    throw new Error(`Failed to download ${VSTlinksArray[i].file}`);
                }
console.log("     File trovato...");

                const blob = await response.blob();
console.log("     File ricevuto, salvo...");

                // Crea un link di download temporaneo
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = VSTlinksArray[i].file;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Aggiorna il progresso
                const progressBar = document.getElementById('downloadProgress');
                const progressText = document.getElementById('progressText');
                progressBar.value = i + 1;
                progressText.textContent = `${i + 1}/${VSTlinksArray.length} files downloaded`;

                // Piccola pausa tra i download per non sovraccaricare
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (fileError) {
                console.error(`Error downloading file ${VSTlinksArray[i].file}:`, fileError);
            }
        }

        alert('Download completato!');
    } catch (error) {
        console.error('Errore durante il download dei file:', error);
        alert('Si è verificato un errore durante il download.');
    } finally {
        // Riabilita il pulsante
        downloadButton.disabled = false;


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


function extractSol(labelContent, debugReference) {
console.log("===========",debugReference);
//console.log("===========",labelContent);


    const match = labelContent.match(/PLANET_DAY_NUMBER\s*=\s*(\d+)/);
    if (match) {
        return parseInt(match[1], 10);
    } else {
        throw new Error("PLANET_DAY_NUMBER non trovato nella label: ", labelContent,debugReference);
    }
}

function getCameraFolder(productName) {
    const secondChar = productName.charAt(1).toLowerCase();
    if (secondChar === 'n') {
       return "navcam/";
    } else if (secondChar === 'p') {
       return "pancam/";
    } else  if (secondChar === 'r') {
       return "hazcam/";
    } else  if (secondChar === 'f') {
       return "hazcam/";
    } else {
        console.log("ERRORE: Carattere non riconosciuto '" + secondChar  + "' per determinare la cartella della fotocamera."); // Gestione errore
    }
}

