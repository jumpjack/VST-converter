// WARNING! - Experimental functions, bery buggish
var debugCounter = 0;
var errorsArr = [];

  var PLY_HEADER_BASE = 'ply\n'+
		'format ascii 1.0\n'+
		'element vertex VVVVVV\n'+
		'property float x\n'+
		'property float y\n'+
		'property float z\n';

  var PLY_HEADER_VISIBLE = "" +
		'property uchar red\n'+
		'property uchar green\n'+
		'property uchar blue\n';


  var PLY_HEADER_NORMALS = "" +
		'property float nx\n'+
		'property float ny\n'+
		'property float nz\n'+
  	  'property list uchar float vertex_indices\n';


  var PLY_HEADER_END=	 'element face 0\n'+
		'end_header\n';


	var FACTOR = 10;
	const TOSKIP = 1;
	const START_MARKER = '<A HREF="';
	const END_MARKER = '">';
	const PROXY = "http://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url=";
	const SERVER_URL = "https://pds-imaging.jpl.nasa.gov";
	var PAGE_URL = "/w10n/mer/spirit/mer2no_0xxx/data/sol1866/rdr/2n292022791xylb0ozf0006l0m1.img/0/raster/data[]?output=json"; // provare con THUMBNAIL  (DEBUG)
	var toolsList = [];
	var toolsListTable = [];
	fileDataXYZ = null;       // XYZ products
	fileDataVisible = null;   // RAD or FFL products
	fileDataNormals = null;   // UV products
	fileDataHeightMap = null; // .HT files: https://pds-imaging.jpl.nasa.gov/data/mer/spirit/mer2mw_0xxx/data/navcam/site0137/

	const MAXFLOAT = 1000000;

	HTSelectedBand = 0;




  function loadFileAsBinaryString(fileHandler) {
		const reader = new FileReader();
		reader.addEventListener('load', (event) => {
			rawTextureContents = event.target.result;
			document.getElementById("texture_file_status").innerHTML = "Texture file loaded.";
			document.getElementById("texture_file_length").innerHTML = rawTextureContents.length;
		});
		reader.readAsBinaryString(fileHandler);
  }



function  readVicarHeaderData(fileContents) {
		endianness = "BE";
		//endianness = "LE"; // debug - get from label(s)

		const IMAGE_MARKER = "/* IMAGE DATA ELEMENTS */";
		const START_OBJECT_MARKER = "OBJECT";
		const END_OBJECT_MARKER = "END_OBJECT";
		const BYTE_LENGTH = 8;

		if(fileContents.indexOf("PDS_VERSION_ID") >=0 ) {
			/////// Read PDS label data:
			recordBytesLineStartPos = fileContents.indexOf("RECORD_BYTES");
			recordBytesLineEndPos = fileContents.indexOf("\n",recordBytesLineStartPos);
			recordBytesLine = fileContents.substr(recordBytesLineStartPos, recordBytesLineEndPos - recordBytesLineStartPos + 1);
			recordBytesArr = recordBytesLine.split("=");
			recordBytes = parseInt(recordBytesArr[1]);
console.log("recordBytes=",recordBytes);

			fileRecordsLineStartPos = fileContents.indexOf("FILE_RECORDS");
			fileRecordsLineEndPos = fileContents.indexOf("\n",fileRecordsLineStartPos);
			fileRecordsLine = fileContents.substr(fileRecordsLineStartPos, fileRecordsLineEndPos - fileRecordsLineStartPos + 1);
			fileRecordsArr = fileRecordsLine.split("=");
			fileRecords = parseInt(fileRecordsArr[1]);
console.log("fileRecords=",fileRecords);

			labelRecordsLineStartPos = fileContents.indexOf("LABEL_RECORDS");
			labelRecordsLineEndPos = fileContents.indexOf("\n",labelRecordsLineStartPos);
			labelRecordsLine = fileContents.substr(labelRecordsLineStartPos, labelRecordsLineEndPos - labelRecordsLineStartPos + 1);
			labelRecordsArr = labelRecordsLine.split("=");
			labelRecords = parseInt(labelRecordsArr[1]);
			console.log("labelRecords=",labelRecords);
			PDSlabelLength = recordBytes * labelRecords;
			PDSlabel = fileContents.substr(0,PDSlabelLength);
 console.log("PDS label:", PDSlabelLength);
	  } else {
		console.log(">>>> NO PDS LABEL, looking for VICAR label...");
		PDSlabelLength = 0;
		PDSlabel = "";
	  }

		// "The total [length] of the label (in bytes) is an integral multiple (x LABEL_RECORDS) of the record length (RECORD_BYTES) of the data: PDS_length = RECORD_BYTES * LABEL_RECORDS"

		////// Read VICAR label data:
//pippo = fileContents;

		// VICAR label values
		//
		// FORMAT:
		//      BYTE: 8bit
		//      HALF: 16 bit, signed int  (also WORD)
		//      FULL: 32 bit, signed int  (also LONG)
		//
		//      REAL: single precision float (32 bit?)
		//      DOUB: double precision float (64 bit?)
		//
		//      COMP: complex, made of 2 REAL numbers (also COMPLEX)
		//
		// INTFMT:
		// 		HIGH = high byte first, big endian
		// 		LOW = low byte first, little endian
		//
		// REALFMT:
		//      IEEE: IEE754 format, high order bytes first
		//      RIEEE: Reverse IEEE format, exponent last
		//      VAX: VAX format
		//

		//  FFL (visible image):
		// FORMAT  = HALF  (16 bit signed int, -32768 / +32767)
		// INTFMT  = HIGH  (high byte first, big endian)
		// REALFMT = RIEEE (Reverse IEEE format, exponent last)
		//
		//  XYZ (point cloud):
		// FORMAT  = REAL  (32 bit real)
		// INTFMT  = HIGH  (high byte first, big endian)
		// REALFMT = IEEE  (IEE754 format, high order bytes first)
		//
		//  UV (normals):
		// FORMAT  = REAL  (32 bit real)
		// INTFMT  = HIGH  (high byte first, big endian)
		// REALFMT = IEEE  (IEE754 format, high order bytes first)
		//
		//  HT (Height Map):
		// FORMAT  = REAL  (32 bit real)
		// INTFMT  = LOW   (low byte first, little endian)
		// REALFMT = RIEEE (Reverse IEEE format, exponent last)
		//


		vicarLabelLengthLineStartPos = fileContents.indexOf("LBLSIZE=")*1;
		if (vicarLabelLengthLineStartPos >= 0) {
			vicarLabelLength = readVicarParam(fileContents,"LBLSIZE=")*1;
			vicarLines = readVicarParam(fileContents,"NL=")*1;
			vicarColumns = readVicarParam(fileContents,"NS=")*1;
			vicarFormat = readVicarParam(fileContents,"FORMAT=");
	        vicarFormatRealLength = -1;
			vicarRealFormat = readVicarParam(fileContents,"REALFMT=");
			if (vicarFormat.indexOf("'REAL'") >= 0 ) {
	          	vicarFormatRealLength = 4;
				if ( vicarRealFormat = "'IEEE'") { // IEE754 format, high order bytes first, i.e. Big-Endian
	                endianness = "BE"; 							// debug
				} else { // 'RIEEE' = reverse IEEE,  exponent last
	                endianness = "LE"; 							// debug
				}
			} else {
	            vicarFormatRealLength = -2;
			}

	        vicarIntFormat = "[empty]";
			vicarIntFormat = readVicarParam(fileContents,"INTFMT=");

			vicarBands = readVicarParam(fileContents,"NB=")*1;
			vicarLabel = fileContents.substr(vicarLabelLengthLineStartPos, vicarLabelLength).replace('\x00',"");
			vicarLabel=vicarLabel.split("   ").join("=========");
			vicarLabel=vicarLabel.split("   ").join("---");
			vicarLabel=vicarLabel.split("  ").join("\r\n");

console.log("vicarLabel:", vicarLabelLength, vicarLabel);

console.log("Data begin at ", vicarLabelLength, "0x" + vicarLabelLength.toString(16));
console.log("vicarLines:", vicarLines);
console.log("vicarColumns:", vicarColumns);
console.log("vicarFormat:", vicarFormat);
console.log("vicarFormatRealLength:", vicarFormatRealLength);
console.log("vicarBands:", vicarBands);
		} else {
            vicarLabelLength = 0;
		    document.getElementById("vicar_header_status").innerHTML = "Unsupported";
		    document.getElementById("vicar_header_data").innerHTML = "No PDS label, no VICAR label";
			magicNumber = fileContents.substr(0,2);
			if((magicNumber[0].charCodeAt(0) === 1) && (magicNumber[1].charCodeAt(0) === 218)) { // 01 DA
console.log("This is a Silicon Graphis RGB file");
// https://en.wikipedia.org/wiki/Silicon_Graphics_Image
                document.getElementById("vicar_header_data").innerHTML = "SGI RGB texture not supported";
                RGBcompression = fileContents.substr(2,1).charCodeAt(0);
                RGBbytesPerChannel = fileContents.substr(3,1).charCodeAt(0);
                RGBbandsNum = fileContents.substr(4,1).charCodeAt(0) * 256 + fileContents.substr(4,1).charCodeAt(0) * 1;
                RGBsizeX = fileContents.substr(6,1).charCodeAt(0) * 256 + fileContents.substr(7,1).charCodeAt(0) * 1;
                RGBsizeY = fileContents.substr(8,1).charCodeAt(0) * 256 + fileContents.substr(9,1).charCodeAt(0) * 1;
                document.getElementById("vicar_header_data").innerHTML += "<br>" +
				"RGBcompression=" + RGBcompression + "<br>" +
				"RGBbytesPerChannel=" + RGBbytesPerChannel + "<br>" +
				"RGBbandsNum=" + RGBbandsNum + "<br>" +
				"RGBsizeX=" + RGBsizeX + "<br>" +
				"RGBsizeY=" + RGBsizeY;
			} else {
				console.log("Unknown magic number ", magicNumber[0].charCodeAt(0).toString(16), magicNumber[1].charCodeAt(0).toString(16));
			}
			return -1;
		}

		totalLabelLength = PDSlabelLength + vicarLabelLength;
		onlyData = fileContents.substr(totalLabelLength , fileContents.length -  totalLabelLength + 1);
  console.log("onlyData length=", onlyData.length, onlyData.length/vicarBands);

		///// Read image/band metadata:
		imageDataStartPos = fileContents.indexOf(IMAGE_MARKER);
		imageDataStartPos = fileContents.indexOf(START_OBJECT_MARKER,imageDataStartPos);
		imageDataEndPos = fileContents.indexOf(END_OBJECT_MARKER,imageDataStartPos);
		imageDataLabel = fileContents.substr(imageDataStartPos, imageDataEndPos - imageDataStartPos);
		imageDataLabel = imageDataLabel.split(" ").join("");
		imageDataLabelArr = imageDataLabel.split("\r\n");
		imageDataLabelObj = {}
		imageDataLabelArr.forEach((elem) => {
			var pair = elem.split("=");
			imageDataLabelObj[pair[0]] = pair[1];
		});
		imageLines = imageDataLabelObj["LINES"];
		imageSamplesPerLine = imageDataLabelObj["LINE_SAMPLES"];
		bytesPerSample = imageDataLabelObj["SAMPLE_BITS"]/BYTE_LENGTH;
		sampleTypePDS = imageDataLabelObj["SAMPLE_TYPE"];
		lineLength = imageSamplesPerLine * bytesPerSample;
		bandsNum = imageDataLabelObj["BANDS"] * 1
		bandLength = imageLines * lineLength;
		imageLength = bandLength * bandsNum;

  console.log("PDSlabelLength", "vicarLabelLength", "totalLabelLength");
  console.log(PDSlabelLength, vicarLabelLength, totalLabelLength);
  console.log(PDSlabelLength.toString(16), vicarLabelLength.toString(16), totalLabelLength.toString(16));


  console.log(" ============= PRIMA ==========");
  console.log("imageLines",imageLines);
  console.log("imageSamplesPerLine",imageSamplesPerLine);
  console.log("bytesPerSample",bytesPerSample);
  console.log("sampleTypePDS",sampleTypePDS);
  console.log("lineLength",lineLength);
  console.log("bandsNum",bandsNum);
  console.log("bandLength",bandLength);
  console.log("imageLength",imageLength);
  console.log("file length",fileContents.length);


  if ((totalLabelLength  === NaN)  || (!totalLabelLength)) totalLabelLength = 0;
  if (vicarLabelLength>0) {
	  if ((imageLines  === NaN)  || (!imageLines)) imageLines = vicarLines;
	  if ((imageSamplesPerLine === NaN)   || (!imageSamplesPerLine)) imageSamplesPerLine = vicarColumns;
	  if ((bytesPerSample === NaN)   || (!bytesPerSample)) bytesPerSample = vicarFormatRealLength;
	  if ((lineLength === NaN)   || (!lineLength)) lineLength = vicarColumns * vicarFormatRealLength;
	  if ((bandsNum === NaN)   || (!bandsNum)) bandsNum = vicarBands*1 ;
	  if ((bandLength === NaN)   || (!bandLength)) bandLength = vicarLines * lineLength;
	}
  if ((imageLength === NaN)   || (!imageLength)) imageLength = bandLength * bandsNum ;

try {
  console.log(" ============= DOPO ==========");
  console.log("imageLines",imageLines, "0x"+ imageLines.toString(16));
  console.log("imageSamplesPerLine",imageSamplesPerLine, "0x"+ imageSamplesPerLine.toString(16));
  console.log("bytesPerSample",bytesPerSample, "0x"+ bytesPerSample.toString(16));
  console.log("sampleTypePDS",sampleTypePDS);
  console.log("lineLength",lineLength, "0x"+ lineLength.toString(16));
  console.log("bandsNum",bandsNum, "0x"+ bandsNum.toString(16));
  console.log("bandLength",bandLength, "0x"+ bandLength.toString(16));
  console.log("imageLength",imageLength, "0x"+ imageLength.toString(16));
  console.log("totalLabelLength",totalLabelLength*1, "0x"+ totalLabelLength.toString(16));
console.log("file length",fileContents.length, "0x"+ fileContents.length.toString(16));

console.log("fileContents:", fileContents.length, "0x"+ fileContents.length.toString(16));

	console.log("done");
console.log("imageLines=" + imageLines + "<br>" +
	"imageSamplesPerLine=" + imageSamplesPerLine + "<br>" +
	"bandsNum=" + bandsNum + "<br>" +
	"bandLength=" + bandLength + "<br>" +
	"imageLength=" + imageLength + "<br>");
} catch (e) {
    console.log("File error");
   console.log("Wrong format?");
}


}




function loadVICAR_BSQ(fileContents, band) {
console.log("Processing bands...");
		imageTable = [null, null, null]; // Source data (bytes)
		bandArray = [null, null, null]; // Processed data
		bandArrayArr = [null, null, null]; // Processed data
		bandArrayFloat = [null, null, null]; // Processed data (floats)
//		for (var band = 0; band < bandsNum; band++) {
	        maxFloatVal = 0; //-3.40282e+38;
			minFloatVal = 0; //3.4028237E38;
console.log("   Processing band " , band);
console.log("   File data length=", fileContents.length);
document.getElementById("status").innerHTML = "Processing band " , band, "...";
console.log("Leggo banda " + band + " da " + (totalLabelLength + band * bandLength) + " a " +  (totalLabelLength  + band * bandLength + bandLength ) + " (escluso ultimo)");
			// BSQ format:
			// A file is just a long sequence of bytes without an actual structure, just a logical structure; let's create a javascript structure corresponding to this logical structure:

			// A file contains a sequence of images;
			// Each image is a "band"; the file is hence a "multiband image" or "multispectral image"; all bands/images have same length.
			// An image is made of lines;
			// A line is made of "samples";
			// A sample is a group of one or more bytes ("bytesPerSample")
			//
			// So our structure will be as follows:
			// { File begin
			// 	[ image/band begin
			// 		  	[  line begin
			//				 [n bytes], [n bytes], [n bytes] ,...     // this is a line, made of groups of bytes; such groups are "samples"
			// 		  	],   line end
			// 		  	[ another line],
			//  	 	[ another line],
			// 		...
			// ], image/band end
			// [ another band/image],
			// [ another band/image]
			// ....
			// } file end

			// Separate the n bands/images into n elements of an array:
			imageTable[band] = fileContents.slice(totalLabelLength + band * bandLength, totalLabelLength  + band * bandLength + bandLength);
console.log( "Lunghezza imageTable[" + band + "]:" , imageTable[band].length, "0x"+ imageTable[band].length.toString(16));
			// Let's setup a new table, where each sample is actually an array of bytes rather than a sequence of bytes insed a sequence of bytes
			bandArray[band] = []; // Each element of the array will contain the structured data of one band
			bandArrayArr[band] = []; //
            bandArrayFloat[band] = [];
console.log("Elaboro elementi di imageTable[" + band + "]  da 0 a " + (imageTable[band].length-1));
			rowsCount = 0;
			for (var linePointer = 0; linePointer < imageTable[band].length; linePointer += lineLength) { // Parse all image line by line
				const imageLine = imageTable[band].slice(linePointer, linePointer + lineLength);
				colsCount = 0;
                samplesArray = [];
                samplesArrayArr = [];
                samplesArrayFloat = [];
				for (var samplePointer = 0; samplePointer < imageLine.length; samplePointer += bytesPerSample) { // rows
					const sample = imageLine.slice(samplePointer, samplePointer + bytesPerSample); // takes the group of bytes which makes a sample
                    sampleArr = []; // Turn the sequence of characters into an array of bytes
					for (var bytePointer = 0; bytePointer < bytesPerSample; bytePointer++) {
						sampleArr.push(sample.charCodeAt(bytePointer));
					}
					samplesArray.push(sample); // Store the group into an "array of samples", which is an image line.
					samplesArrayArr.push(sampleArr);

					floatVal = arrayToFloat(sample, endianness);

					if (maxFloatVal < floatVal)
						maxFloatVal = floatVal;

					if (minFloatVal > floatVal)
						minFloatVal = floatVal;

                    if (sampleArr.length === 4) {
						samplesArrayFloat.push(floatVal);
					 } else {
                        samplesArrayFloat.push(0);
					 }

					colsCount++;
				}
				bandArray[band].push(samplesArray);
				bandArrayArr[band].push(samplesArrayArr);
				bandArrayFloat[band].push(samplesArrayFloat);
				rowsCount++;
			}
console.log("Length of calculated array for band " + band + ":" + bandArray[band].length);
console.log("Min float:",minFloatVal, ", maxFloat=",maxFloatVal);
	//	}

console.log(bandArrayFloat);
	return bandArrayFloat; //debug

}




  function readVicarParam(fileContents, paramName) {
	StartPos = fileContents.indexOf(paramName);
	EndPos = fileContents.indexOf("  ",StartPos);
	valueLine = fileContents.substr(StartPos, EndPos - StartPos + 1);
	lineArr = valueLine.split("=");
	return lineArr[1];
  }


  function arrayToFloat(arr, SB) {
	  if (arr.toString() === [255, 255, 127, 127].toString()) {
	  	return 0
		}


  	try {
		// Create a buffer
		 buf = new ArrayBuffer(4);

		// Create a data view of it
		 view = new DataView(buf);

	//console.log("VIEW PRIMA:", view);
		// set bytes
		//arr=Array.from(data);
		arr.forEach(function (b, i) {
			view.setUint8(i, b);
		});

	//console.log("VIEW DOPO:", view);

		// Read the bits as a float; note that by doing this, we're implicitly
		// converting it from a 32-bit float into JavaScript's native 64-bit double
		// little-endian = true  --> smallest position = least significant
		// little-endian = false --> smallest position = most significant
	      if (SB === "BE") {
	          littleEndian = true;
		} else {
	          littleEndian = false; // debug
		}

		num = view.getFloat32(0,littleEndian);

		if (num == 0) {
			return 0;
		}

	} catch (e) {
		errorsArr.push(arr);
		return arr;
	}
	if (Number.isNaN(num)) {
		errorsArr.push(arr);
		console.log("Number ", num ," extracted from array ", arr, ", is not a number. Hex: 0x" + arr[0].toString(16) + arr[1].toString(16) + arr[2].toString(16) + arr[3].toString(16) );
		debugCounter++;
		if (debugCounter>20) {
			throw("uffa");
		}
		return 0;
	}

	return num;

  }


  function arrayToInt(data) {
		// Create a buffer
		 buf = new ArrayBuffer(2);
		// Create a data view of it
		 view = new DataView(buf);

		num = data.charCodeAt(0) * 256 +  data.charCodeAt(1) * 1; // debug test
  /*
		// set bytes
		arr=Array.from(data);
		arr.forEach(function (b, i) {
				view.setUint8(i, b.charCodeAt());
		});

		// Read the bits as a float; note that by doing this, we're implicitly
		// converting it from a 32-bit float into JavaScript's native 64-bit double
		 num = view.getInt16(0);

  */
		// Done
		if (num*1 === 0){
				return ("0");
		} else {
				return ((num/1).toFixed(0));
		}
  }


  function stringToArray(str) {
		arr = [];
		for (var i=0; i<str.length; i++) {
				arr.push(str[i].charCodeAt())
		}
		console.log("STR ", str , "= ARR ", arr);
  }


  function processData(/*objXYZ, objVisible, objNormals*/) {
  console.log("Creating .PLY 3d file...");
		objXYZ = fileDataXYZ;
		objVisible = fileDataVisible;
		objNormals = fileDataNormals;
		objHeightMap = fileDataHeightMap;
  console.log(objXYZ, objVisible, objNormals, objHeightMap);

  // Setup XYZ data:
  if (objXYZ) {
		rows = objXYZ.data;
		rowsNum = rows.length;
		cols = rows[0];
		colsNum = cols.length;
		bands = cols[0];
		bandsNum = bands.length;
	}

  // Setup Visible data if available:
	if (objVisible) {
				visRows = objVisible.data;
				visRowsNum = visRows.length;
				visCols = visRows[0];
				visColsNum = visCols.length;
				visBands = visCols[0];
				visBandsNum = visBands.length;
		}

  // Setup Normals data if available:
	if (objNormals) {
				normRows = objNormals.data;
				normRowsNum = normRows.length;
				normCols = normRows[0];
				normColsNum = normCols.length;
				normBands = normCols[0];
				normBandsNum = normBands.length;
		}

  // Setup Height Map data if available:
	if (objHeightMap) {
        heightBand = document.getElementById("txtBand").value * 1;
		htRows = objHeightMap[heightBand];//.data;  // debug: band 0 = raw, band 1 = filled holes
		htRowsNum = htRows.length;
		htCols = htRows[0];
		htColsNum = htCols.length;
		//htBands = htCols[0];
		htBandsNum = bandsNum; // htBands.length;  // debug, global var!
	}

	/*	  if (bandsNum) {*/
	if (objXYZ) console.log("XYZ Rows x Columns =",rowsNum + "x" + colsNum + ", Bands: ", bandsNum);
	if (objVisible) console.log("Vis Rows x Columns =",visRowsNum + "x" + visColsNum + ", Bands: ", visBandsNum);
	if (objNormals) console.log("Norm Rows x Columns =",normRowsNum + "x" + normColsNum + ", Bands: ", normBandsNum);
	if (objHeightMap) console.log("Norm Rows x Columns =",htRowsNum + "x" + htColsNum + ", Bands: ", htBandsNum);

	PLY_HEADER = PLY_HEADER_BASE;

	if (objVisible) {
		PLY_HEADER += PLY_HEADER_VISIBLE;
	}

	if (objNormals) {
		PLY_HEADER += PLY_HEADER_NORMALS;
	}

	PLY_HEADER += PLY_HEADER_END;

console.log("PLY_HEADER:",PLY_HEADER);



	pixelsCount = 0;

	if (objXYZ) {
		rowsCount = 0;
		finalText = "";
		finalTextHeight = "";
		rows.forEach( (row) => {
//console.log("RIGA ",rowsCount);
			colsCount = 0;
			rowElements = row
			rowElements.forEach( (XYZelement) => {
//console.log("COLONNA ",colsCount);
				if ( (XYZelement[0] != 0) || (XYZelement[1] != 0) || (XYZelement[2] != 0)) { // Debug / to do: values (0,0,0) mean "no value", but this can vary, it's specified in label
//console.log("" + XYZelement[0] + "," + XYZelement[1] + "," + XYZelement[2]);
					XYZpart = XYZelement[0]*1 + " " + XYZelement[1]*1 + " " + XYZelement[2]*1;
					finalText += XYZpart;
					if (objVisible) {
						visRow = visRows[rowsCount];
						visElement = visRow[colsCount];
						colorLevel = visElement[0];
						visPart = colorLevel + " " + colorLevel + " " + colorLevel;// + " DEBUG " + "0x" + colorLevel.toString(6);
						finalText += " " + visPart;
						writeCanvas(colsCount, rowsCount, colorLevel, colorLevel, colorLevel);
					}
					if (objNormals) {
						normRow = normRows[rowsCount];
						normElement = normRow[colsCount];
						UVpart = normElement[0] + " " + normElement[1] + " " + normElement[2];
						finalText += " " + UVpart;
					}
					finalText +="\n"; // Final PLY line
					pixelsCount++;
//console.log("Processed rows: " + (100*(rowsCount / rowsNum)).toFixed(0));
				}
				colsCount++;
			});
			rowsCount++;
		});
	}

	/// check debug
	// Line = Math.int((FileOffset - 4000) / 4000)
	// col = (((FileOffset - 4000) / 4000 - Line) * 4000)/4

	if (objHeightMap) {
        FACTOR = document.getElementById("factor").value * 1.0;
		rowsCount = 0;
		finalText = "";
		finalTextHeight = "";
console.log("Height data:", htRows);

		htRows.forEach( (row) => {
//console.log("RIGA ",rowsCount);
			colsCount = 0;
			rowElements = row
			rowElements.forEach( (HTelement) => {
//console.log("COLONNA ",colsCount);
				HTpart = colsCount + " " + rowsCount + " " +  (HTelement * FACTOR).toFixed(2);
				finalText += HTpart;
				finalText +="\n"; // Final PLY line
				colorLevel= (HTelement * FACTOR).toFixed(2)*1;
                writeCanvas(colsCount, rowsCount, colorLevel, colorLevel, colorLevel);
				pixelsCount++;
				colsCount++;
			});
			rowsCount++;
		});
	}

	console.log("Processed pixels:",pixelsCount);
	PLY_FINAL_HEADER = PLY_HEADER.replace("VVVVVV",pixelsCount)
	output.textContent = "Ready for download...";
	saveFile(PLY_FINAL_HEADER + finalText, "mytest.ply");
console.log("PLY creation completed.");
  }
