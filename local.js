var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

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

exports.hash = hash;
exports.localURL = localURL;
exports.outputPath = outputPath;
exports.inputPath = inputPath;
exports.localPathFromURL = localPathFromURL;
