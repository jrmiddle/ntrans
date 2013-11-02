var xcoder = require('./xcoder');
var url = require('url');

function route(request, response) {

    var reqinfo = url.parse(request.url, true);

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
	
	xcoder.scaleToBounds(usFile, usBounds, sScaleType,  
		function (file) {
		    response.writeHead(200, {"Content-Type": "text/plain"});
		    response.write("Transcoded file: " + file + "!");
		    response.end();
	
		},
		function (message) {
		    response.writeHead(200, {"Content-Type": "text/plain"});
		    response.write("Oh, phooey: " + message);
		    response.end();
		}
	);
}

exports.route = route;