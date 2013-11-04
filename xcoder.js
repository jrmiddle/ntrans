var im = require('imagemagick');
var output_dir = "output";
var work_dir = "work";
var cache_dir = "cache";
var path = require('path');
var local = require('./local');

var Scalers = {
	"fit": function(inputFilePath, outputFileName,  bounds, completionF, errF) {
		
		local.log("Scale type FIT, bounds=" + bounds);

		outputPath = local.outputPath(outputFileName);
		
		im.convert(
			[inputFilePath,
			 '-resize',
			 bounds,
			 outputPath],
			 
			function(err, stdout) {
				if (err) {
					errF("Error scaling file '" + inputFilePath + "': " + err + " : " + stdout);
				} else {
					completionF(outputPath);
				}
			}
		);
	},
	"fill": function(inputFilePath, outputFileName, bounds, completionF, errF) {
		console.log("In fill scaler with bounds='" + bounds + "'");
	}
}

function scaleToBounds (inputFilePath, outputFileName, bounds, scaleType, completionF, errF) {
	var scaleFunc = Scalers[scaleType];
	if (! scaleFunc) {
		errF("No scaler for scaleType '" + scaleType + "'.", file);
	} else {
		scaleFunc(inputFilePath, outputFileName, bounds, completionF, errF);
	}
}

exports.scaleToBounds = scaleToBounds;