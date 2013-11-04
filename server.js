var http = require("http");
var url = require("url");
var local = require("./local");

function start(route) {

  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    route(request, response);
  }

  var workDir   = local.workDir();
  var outputDir = local.outputDir();
  var port      = local.port();
  
  http.createServer(onRequest).listen(port);
  console.log("Server has started on port:" + port);
  console.log("Using outputDir: " + outputDir + " workDir: " + workDir);
}

exports.start = start;