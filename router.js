var xcoder = require('./xcoder');
var url = require('url');
var fs = require('fs');
var path = require('path');
var local = require('./local');

function redir(response, location) {
    response.writeHead(301, {"Location": location});
    response.end();
}

function route(request, response) {

    var reqinfo   = url.parse(request.url, true);
	var outputFileName = local.hash(request.url);
	var outputFilePath = local.outputPath(outputFileName);
	var localPathFromURL = local.localPathFromURL(request.url);

	fs.readFile(localPathFromURL, function (err, data) {
		if (!err) {
			console.log(localPathFromURL + " exists!");
			response.writeHead(200);
			response.end(data);
		} else {
			console.log(localPathFromURL + " not found.  Will generate " + outputFilePath);

			usBounds = reqinfo.query.bounds;
			if (! usBounds) {
				usBounds = "50x50"
			}
	
			usFile = reqinfo.query.file;
			if (! usFile) {
				usFile = "cameracar.jpg";
			}
	
		 	sScaleType = "fit";
			if (reqinfo.pathname == "/fill") {
				sScaleType = "fill";
			}
	
			xcoder.scaleToBounds(usFile, outputFileName, usBounds, sScaleType,  
				function (outputFilePath) {
					var URL = local.localURL(outputFilePath);
					console.log("Redirecting to " + URL)
				    redir(response, local.localURL(outputFilePath));
				},
				function (message) {
				    response.writeHead(200, {"Content-Type": "text/plain"});
				    response.write("Oh, phooey: " + message);
				    response.end();
				}
			);
		}
	});
}

exports.route = route;