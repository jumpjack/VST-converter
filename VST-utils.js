	var myName;

	function loadFile(fileHandler) { // Callback event assigned in main page
		console.log("File to open:" ,fileHandler);
		myName = fileHandler.name;
		const reader = new FileReader();
		reader.addEventListener('load', (event) => {
				rawFileContents = event.target.result;
				console.log("Loaded: ", event, rawFileContents.length);
				fileContentsUInt8 = new Uint8Array(rawFileContents); // Extract from the generic ArrayBuffer an array of Unsigned Integers (0..255)
				//console.log(fileContentsUInt8);
				document.getElementById("status").innerHTML = "File loaded. Click to save:";
				return {rawFileContents, fileContentsUInt8};
		});
		reader.readAsArrayBuffer(fileHandler); // Read as arrayBuffer as "readAsBinaryString" is deprecated but we don't want Javascript to interpret the file at its own wish...
		console.log("Reading process initiated...");
	}


	function saveFile(fileContent, filename) {
		myBlob = new Blob([fileContent], {type: "application/octet-stream"});
		var url = window.URL.createObjectURL(myBlob);
		var anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = filename;
		anchor.click();
		window.URL.revokeObjectURL(url);
	}


	function sliceToFloat32(rawFileContents, chunkStart) {
		const view = new DataView(rawFileContents); // Create access point to ArrayBuffer
		floatNum = view.getFloat32(chunkStart, true); // Extract float32 from access point
//		console.log(typeof floatNum, floatNum);
		return floatNum;

	}


	function sliceToString(UInt8Slice, chunkStart, chunkEnd) {
		sliceUInt8 = UInt8Slice.slice(chunkStart, chunkEnd); // Slice will contain data from index chunkStart to index chunkEnd-1
//console.log(typeof sliceUInt8, sliceUInt8);

		UTF16string = String.fromCharCode(...sliceUInt8); // Interpret byte array as a string of UTF16 characters
//console.log(typeof UTF16string, UTF16string);

		UTF8decoder = new TextDecoder();
		UTF8string = UTF8decoder.decode(sliceUInt8);  // Interpret byte array as a string of UTF8 characters
//console.log(typeof UTF8string, UTF8string);

		return {UTF8string,  UTF16string};
	}

	function sliceToHexString(UInt8Slice, chunkStart, chunkEnd) {
		finalString = "";
        sliceUInt8 = UInt8Slice.slice(chunkStart, chunkEnd);
        sliceUInt8.forEach( (element) => {
            finalString += stringToHex(element);
		});
		return finalString;
	}


	function getValFromString(rawContents, offset, L ) {
	    // Note: offset in bytes, non in array indexes
//console.log(rawContents);
      finalVal = 0;
	    for (i = offset; i < offset + L; i++) {
					byt = rawContents[i];
					finalVal = finalVal + byt * (256 ** ((i-offset)));
//console.log(i,   byt, i-offset, 256 ** (i-offset), byt * 256 ** (i-offset), finalVal);
	    }
	    return finalVal
	}



	function stringToHex(s) {
    temp = "";
    intVal = 0;
    for (i = 0; i < s.length; i++) {
			chVal = s[i];
			chValHex = numHex(chVal);
      temp = temp + " " + chValHex;
//console.log(i, i.toString(16), chVal, chValHex)
    }
    return temp
	}



function stringToDecInv(s) {
    byteVal = 0;
    intVal = 0
    for (i = s.length-1; i >= 0; i--) {
      if (s.length <= 8) {
				byteVal = s[i];
        intVal = intVal + (byteVal * (256 **(i)));
//console.log(i, byteVal, intVal);
      }
  }
    return intVal
}


	function stringToHexInv(s) {
    temp = "";
    intVal = 0;
    for (i = s.length-1; i >= 0; i--) {
			chVal = s[i];
			chValHex = numHex(chVal)
      temp = temp + chValHex;
    }
    return temp
	}


function numHex(s){
    var a = s.toString(16);
    if ((a.length % 2) > 0) {
        a = "0" + a;
    }
    return a;
}