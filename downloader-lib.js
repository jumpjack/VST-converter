
// Three methods to retrieve remote files:
// Axios.get (no poyload)	(requires <script src="https://unpkg.com/axios/dist/axios.min.js"></script> )
// Axios post (with payload) (requires <script src="https://unpkg.com/axios/dist/axios.min.js"></script> )
// Legacy (just url)

PROXY = "http://win98.altervista.org/space/exploration/myp.php?pass=miapass&mode=native&url="; // Use your own proxy!
PROGRESS_SYMBOLS_COUNT = 5;
progressStatusIndex = 0;
byPost = null;
byGet = null;
legacy = null;

	/*

	HEADERS FORMAT:

	queryHeaders = {
		'field1' : value1,
		'field2' : value2,
		'Content-type'	: 'application/vnd.api+json' // debug
	};

	*/


function retrieveByPost(url, JSONpayload, headers, log, output) {
	if (log) log.value += "retrieveByPost\n";
	postUrl = PROXY + encodeURIComponent(url);
	queryHeaders = headers;
	actionPayload = JSONpayload;

		return axios.post(
			postUrl,
			actionPayload,
			{
				headers: queryHeaders
			})
			.then(response => {
				if (log) log.value += "POST response received.\n";
				//console.log("Raw response for post: ", response);
				//console.log("JSON response for POST:" + (JSON.stringify(response, null, 4)));
				if (output) output.value = JSON.stringify(response, null, 4);
				 byPost= {r1:response, r2:JSON.stringify(response, null, 4)};
			})
			.catch((error) => {
				console.log("POST error:", error);
				if (log) log.value += "#####POST error\n";
				return -1;
			});
}


function retrieveByGet(url, headers, log, output) {
	if (log) log.value += "retrieveByGet\n";
	getUrl = PROXY + encodeURIComponent(url);
	getHeaders = headers

	return axios.get(
		getUrl,
		{
			headers: getHeaders
		})
		.then(response => {
				if (log) log.value += "GET response received.\n";
			//console.log("Raw response for GET: ", response);
			//console.log("JSON response for GET:" + (JSON.stringify(response, null, 4)));
			if (output) output.value = JSON.stringify(response, null, 4);
			byGet = {r1:response, r2:JSON.stringify(response, null, 4)};
		})
		.catch((error) => {
			console.log("GET error:", error);
			if (log) log.value += "#####GET error\n";
			return -1;
		});
}


function retrieve(url, log, output, status) {
console.log(url, log, output, status);
  return new Promise(resolve => {
		finalURL = PROXY +	encodeURIComponent(url); 
		var myClient = new XMLHttpRequest();
		myClient.open('GET',	finalURL);

		myClient.onprogress = function(event) {
			showDownloadProgress(myClient.response.length, status);
		};

		myClient.responseType = 'text';
		myClient.onload = function(response) {
//console.log("### Raw response for RETRIEVE: ",response);
//console.log("### Sub-response for RETRIEVE: ",response.currentTarget.response);
			if (log) {log.value += "Legacy response received.\n"} else {console.log("Legacy response received.\n")};
			if (output) {output.value =	response.currentTarget.response}// else {console.log(response.currentTarget.response)};
			legacy = response.currentTarget.response;
			resolve(response.currentTarget.response);
		}

		myClient.onerror = function(event) {
			if (log) log.value += "*****NETWORK ERROR**\n";
			if (status) status.innerHTML = "** NETWORK ERROR";
			resolve("**NETWORK ERROR**");
		};
		if (log) log.value += "Sending request...\n";
		myClient.send(); // Async connection to data server.
		if (log) log.value += "Request sent.\n";
	});
}


function showDownloadProgress(L, status) {
	progressStatusIndex++;
	if (progressStatusIndex >= PROGRESS_SYMBOLS_COUNT) {
		progressStatusIndex=0;
	}
	if (status) status.innerHTML = "Downloading... " + L;
}


function remoteFileExists(url) {
  return new Promise(resolve => {
console.log("#DN# Checking " + url + "...");
		var xhr = new XMLHttpRequest();
		xhr.open('GET', PROXY + encodeURIComponent(url), true);
		xhr.setRequestHeader('Range', 'bytes=0-200'); 

		xhr.onload = function(resp) {
			console.log("#DN# Some data received, checking...");
			if (resp.currentTarget.response.toUpperCase().indexOf("NOT FOUND")<0) {
				console.log("#DN# File exists");
				resolve (true);
			 } else {
				console.log("#DN# ERROR: file not found");
				resolve (false);
			 }
		}
		xhr.send();
	});
}
/*
retrieveByPost("http://www.corriere.it", null, null, document.getElementById("spnLog"), document.getElementById("spnOutput1"));
retrieveByGet("http://www.corriere.it", null, document.getElementById("spnLog"), document.getElementById("spnOutput2"));
progressStatusIndex=0;
retrieve("http://www.corriere.it", document.getElementById("spnLog"), document.getElementById("spnOutput3"), document.getElementById("spnStatus"));

console.log(legacy);
*/