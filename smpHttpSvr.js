var http = require('http');
var fs = require('fs');
const KEYFILE 		= 'Asteroids.html';
const PORT 			= 8080;
const HTTP_HEADER 	= {'Content-Type': 'text/html'};
http.createServer(function (req, res) {
  fs.readFile(KEYFILE, function(err, data) {
    res.writeHead(200, HTTP_HEADER);
    res.write(data);
    res.end();
  });
}).listen(PORT);
