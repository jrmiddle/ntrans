var im = require('imagemagick');

var output_dir = "output";
var work_dir = "work";
var cache_dir = "cache";

var Scalers = {
	"fit": function(file, bounds, completionF, errF) {
		console.log("In fit scaler with bounds='" + bounds + "'");
		im.convert(
			['work/' + file, '-resize', bounds, 'output/' + file],
			function(err, stdout) {
				if (err) {
					errF("Error scaling file '" + file + "': " + err + " : " + stdout);
				} else {
					completionF("Yay! " + file);
				}
			}
		);
	},
	"fill": function(path, bounds, completionF, errF) {
		console.log("In fill scaler with bounds='" + bounds + "'");
	}
}

function scaleToBounds (file, bounds, scaleType, completionF, errF) {
	var scaleFunc = Scalers[scaleType];
	if (! scaleFunc) {
		errF("No scaler for scaleType '" + scaleType + "'.", file);
	} else {
		scaleFunc(file, bounds, completionF, errF);
	}
}

exports.scaleToBounds = scaleToBounds;