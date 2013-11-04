var xcoder = require('./xcoder');
var url = require('url');
var fs = require('fs');
var path = require('path');
var local = require('./local');
var http = require('http');
var https = require('https');

function protoHandlerForURL(url) {
	if (url.indexOf('https') == 0) {
		return https;
	}
	if (url.indexOf('http') == 0) {
		return http;
	}
}

function download(url, to, completionF, errF) {
	local.debug("Downloading " + url);
	
	responseCallback = function(res) {
		local.debug("Response from url" + url);
		local.debug("   Status: " + res.statusCode);
		local.debug("   Headers: " + res.headers);
		if (local.isImageType(res.headers["Content-type"])) {
			local.debug("   Handling content type " + res.headers["Content-type"]);
			var writeStream = fs.createWriteStream(to);
			local.debug("   Writing to " + to);
			res.pipe(writeStream);
			res.on('close', function() {
				local.debug("Unexpectedly closed when pulling " + to + " from " + url);
				completionF(to);
			});
			res.on('end', function() {
				local.debug("Finished pulling " + to + " from " + url);
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

function sendLocalFile(localPath, response) {
	fs.readFile(localPath, function (err, data) {
		if (!err) {
			// Have cached file; just return it.
			var headers = local.headersForPath(localPath);
			headers["ETag"] = local.eTagForBuf(data);
			local.log("Sending local file " + localPath);
			response.writeHead(200, headers);
			response.end(data);
		} else {
			local.error("File not found: " + localPath + " : " + err);
			response.writeHead(404);
			response.write("File not found: " + localPath + " : " + err);
			response.end();
		}
	});
}

// Local static file
function handleLocalRequest(request, response) {
	var localPath = local.localPathFromURL(request.url);
}

// Transcoding magic
function handleRemoteRequest(request, response) {
    var reqinfo   = url.parse(request.url, true);
	
	var remoteReqInfo = url.parse(reqinfo.query.u);
	local.debug("Remote reqinfo: " + remoteReqInfo);
	local.debug("Remote URL: " + remoteReqInfo.href)

	var operation = parseOperation(reqinfo.query.o);
	local.debug("Parsed operation: " + operation)

	var params = parseParams(reqinfo.query.p);
	local.debug("Parsed params: " + params);

	var outputFileName = local.hash(remoteReqInfo.href + operation + params);
	var outputFilePath = local.outputPath(outputFileName);
	var localPathFromURL = local.localPathFromURL(outputFileName);

	fs.readFile(outputFilePath, function (err, data) {
		if (!err) {
			// Have cached file; just return it.
			sendLocalFile(outputFilePath, response);
		} else {
			// Don't have cached file; have to download.
			local.debug(localPathFromURL + " not found.  Will generate " + outputFilePath);
		
			download(remoteReqInfo.href,
				local.inputPath(outputFileName),
				function (downloadedFilePath) {
					// Successfully downloaded
					xcoder.scaleToBounds(
						downloadedFilePath, outputFileName, params, operation,  
						function (outputFilePath) {
							// Scaled successfully; have output at outputFilePath
							local.log("Scaled " + remoteReqInfo.href + " to bounds " + params);
							sendLocalFile(outputPath, response);
						},
						function (message) {
							// Failed to scale.
							local.error("Unable to scale file: " + message);
						    response.writeHead(500);
						    response.write("Failed to scale file: " + message);
						    response.end();
						}
					);
				},
				function (message) {
					// Failed to download
					local.error("Unable to download file: " + message);
					response.writeHead(500);
					response.write("Unable to download file: " + message);
					response.end();
				}
			);
		}
	});
}

// Core router

function route(request, response) {
    var reqinfo   = url.parse(request.url, true);
	local.log("Request: " + request.url);

	if (reqinfo.query.u) {
		handleRemoteRequest(request, response);
	} else {
		// We've received a direct request for a local file.
		handleLocalRequest(request, response);
	}
}

exports.route = route;