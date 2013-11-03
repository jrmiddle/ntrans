var xcoder = require('./xcoder');
var url = require('url');
var fs = require('fs');
var path = require('path');
var local = require('./local');
var http = require('http');
var https = require('https');

function redir(response, location) {
    response.writeHead(301, {"Location": location});
    response.end();
}

function isImageType(contentType) {
	return true;
}

function protoHandlerForURL(url) {
	if (url.indexOf('https') == 0) {
		return https;
	}
	if (url.indexOf('http') == 0) {
		return http;
	}
}

function download(url, to, completionF, errF) {
	console.log("Downloading " + url);
	
	responseCallback = function(res) {
		console.log("Response from url" + url);
		console.log("   Status: " + res.statusCode);
		console.log("   Headers: " + res.headers);
		if (isImageType(res.headers["Content-type"])) {
			console.log("   Handling content type " + res.headers["Content-type"]);
			var writeStream = fs.createWriteStream(to);
			console.log("   Writing to " + to);
			res.pipe(writeStream);
			res.on('close', function() {
				console.log("Unexpectedly closed when pulling " + to + " from " + url);
				completionF(to);
			});
			res.on('end', function() {
				console.log("Finished pulling " + to + " from " + url);
				completionF(to);
			});
		} else {
			errF("Can't handle content type " + res.header.contentType + ".");
		}
	};
	
	protoHandler = protoHandlerForURL(url);
	if (protoHandler) {
		var req = protoHandler.request(url, responseCallback);
		req.end();
	} else {
		errF("Don't recognize protocol for url " + url);
	}
}

function parseOperation(o) {
	var ret = "fit";
	if (o == 'fill') {
		ret = o
	}
	return ret;
}

function parseParams(p) {
	var ret = "50x50";
	var matched = p.match(/^\d{1,4}x\d{1,4}$/i);
	if (matched) {
		ret = matched[0];
	}
	return ret;
}

// Local static file
function handleLocalRequest(request, response) {

	var localPath = local.localPathFromURL(request.url);
	
	fs.readFile(localPath, function (err, data) {
		if (!err) {
			// Have cached file; just return it.
			console.log(localPath + " exists!");
			response.writeHead(200);
			response.end(data);
		} else {
			console.log("File not found: " + localPath + " : " + message);
			response.writeHead(404);
			response.write("File not found: " + localPath + " : " + message);
			response.end();
			
		}
	});
}

// Transcoding magic
function handleRemoteRequest(request, response) {
    var reqinfo   = url.parse(request.url, true);
	
	var remoteReqInfo = url.parse(reqinfo.query.u);
	console.log("Remote reqinfo: " + remoteReqInfo);
	console.log("Remote URL: " + remoteReqInfo.href)

	var operation = parseOperation(reqinfo.query.o);
	console.log("Parsed operation: " + operation)

	var params = parseParams(reqinfo.query.p);
	console.log("Parsed params: " + params);

	var outputFileName = local.hash(remoteReqInfo.href + operation + params);
	var outputFilePath = local.outputPath(outputFileName);
	var localPathFromURL = local.localPathFromURL(outputFileName);

	fs.readFile(outputFilePath, function (err, data) {
		if (!err) {
			// Have cached file; just return it.
			console.log(outputFilePath + " exists!");
			response.writeHead(200);
			response.end(data);
		} else {
			// Don't have cached file; have to download.
			console.log(localPathFromURL + " not found.  Will generate " + outputFilePath);
		
			download(remoteReqInfo.href,
				local.inputPath(outputFileName),
				function (downloadedFilePath) {
					// Successfully downloaded
					xcoder.scaleToBounds(
						downloadedFilePath, outputFileName, params, operation,  
						function (outputFilePath) {
							// Scaled successfully; have output at outputFilePath
							var URL = local.localURL(outputFilePath);
							console.log("Redirecting to " + URL)
						    redir(response, local.localURL(outputFilePath));
						},
						function (message) {
							// Failed to scale.
						    response.writeHead(200, {"Content-Type": "text/plain"});
						    response.write("Oh, phooey: " + message);
						    response.end();
						}
					);
				},
				function (message) {
					// Failed to download
					console.log("Error downoading file: " + message);
					response.writeHead(500);
					response.write("Error downloading file: " + message);
					response.end();
				}
			);
		}
	});
}

// Core router

function route(request, response) {
    var reqinfo   = url.parse(request.url, true);
	console.log("Local reqinfo: " + reqinfo);

	if (! reqinfo.query.u) {
		// We've received a request for a local file.
		handleLocalRequest(request, response);
	} else {
		handleRemoteRequest(request, response);
	}
}

exports.route = route;