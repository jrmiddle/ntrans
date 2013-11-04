var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cookie = require('tough-cookie');

function hash(input) {
	var shasum = crypto.createHash('sha1');
	shasum.update(input);
	return shasum.digest('hex');
}

function localURL(inPath) {
	return "/" + inPath;
}

function localPathFromURL(inURL) {
	return inURL.replace(/^\/?(?:\.\.\/)*/, "");
}

function outputPath(fileName) {
	return path.join('output', fileName);
}

function inputPath(fileName) {
	return path.join('work', fileName);
}

function redir(response, location) {
    response.writeHead(301, {"Location": location});
    response.end();
}

function isImageType(contentType) {
	return true;
}

function eTagForBuf(buf) {
	return crypto.createHash('sha1').update(buf).digest('hex');
}

function fstatHeadersForPath(path) {
	var stats = fs.statSync(path);
	return {
		"Last-Modified": cookie.formatDate(stats.mtime),
		"Content-Length": stats.size
	}
}

function contentTypeForPath(path) {
	return mime.lookup(path);
}

function headersForPath(path) {
	var headers = fstatHeadersForPath(path);
	headers["Content-Type"] = contentTypeForPath(path);
	return headers;
}

exports.hash = hash;
exports.localURL = localURL;
exports.outputPath = outputPath;
exports.inputPath = inputPath;
exports.localPathFromURL = localPathFromURL;
exports.isImageType = isImageType;
exports.redir = redir;
exports.headersForPath = headersForPath;
exports.eTagForBuf = eTagForBuf;
