var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cookie = require('tough-cookie');
var localWorkDir = "work";
var localOutputDir = "output";

function hash(input) {
	var shasum = crypto.createHash('sha1');
	shasum.update(input);
	return shasum.digest('hex');
}

function localURL(inPath) {
	return "/" + inPath;
}

function localPort() {
	var port = process.env.NTRANS_PORT;
	if (!port) {
		port = process.env.npm_package_config_port;
	}
	if (!port) {
		port = '8888'
	}
	return port;
}

function localPathFromURL(inURL) {
	return inURL.replace(/^\/?(?:\.\.\/)*/, "");
}

function getOrCreateDirWithPath(path) {
	if (fs.existsSync(path)) {

		stats = fs.statSync(path);

		if (stats.isFile()) {
			return;
		}

		if (stats.isDirectory()) {
			return path;
		};
	}
	fs.mkdirSync(path);
	return path;
}

function workDir() {
	return getOrCreateDirWithPath(localWorkDir);
}

function outputDir() {
	return getOrCreateDirWithPath(localOutputDir);
}

function outputPath(fileName) {
	var od = outputDir();
	if (od) {
		return path.join(od, fileName);
	}
}

function inputPath(fileName) {
	var wd = workDir();
	if (wd) {
		return path.join('work', fileName);
	}
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
exports.workDir = workDir;
exports.outputDir = outputDir;
exports.port = localPort;