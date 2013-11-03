var im = require('imagemagick');
var output_dir = "output";
var work_dir = "work";
var cache_dir = "cache";
var path = require('path');
var local = require('./local');

var Scalers = {
	"fit": function(inputFileName, outputFileName,  bounds, completionF, errF) {
		console.log("In fit scaler with bounds='" + bounds + "'");
		inputPath = local.inputPath(inputFileName);
		outputPath = local.outputPath(outputFileName);
		
		im.convert(
			[inputPath,
			 '-resize',
			 bounds,
			 outputPath],
			 
			function(err, stdout) {
				if (err) {
					errF("Error scaling file '" + file + "': " + err + " : " + stdout);
				} else {
					completionF(outputPath);
				}
			}
		);
	},
	"fill": function(inputFileName, outputFileName, bounds, completionF, errF) {
		console.log("In fill scaler with bounds='" + bounds + "'");
	}
}

function scaleToBounds (inputFileName, outputFileName, bounds, scaleType, completionF, errF) {
	var scaleFunc = Scalers[scaleType];
	if (! scaleFunc) {
		errF("No scaler for scaleType '" + scaleType + "'.", file);
	} else {
		scaleFunc(inputFileName, outputFileName, bounds, completionF, errF);
	}
}

exports.scaleToBounds = scaleToBounds;