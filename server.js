var port = 8089;
var http = require("http");
var url = require("url");
var fs = require("fs");
var config = require("./config");
http.createServer(function (request, response) {
    /**
     * @type {String}
     * http请求中的包含的域名
     */
    var domainName = request.headers.host.replace(/:[\d]+/, "");
    /**
     * @type {Number}
     * 转发的目的端口
     */
    var destinationPort = config.domainPortMap[domainName];
    var newRequest = http.request({
        method: request.method,
        path: request.url,
        port: destinationPort,
        headers: request.headers
    }, function (newResponse) {
        response.writeHead(newResponse.statusCode, http.STATUS_CODES[newResponse.statusCode], newResponse.headers);
        newResponse.on("data", function (responseDataChunk) {
            response.write(responseDataChunk);
        });
        newResponse.on("end", function () {
            response.end();
        });
    });
    newRequest.on("error", function () {
        response.writeHead(503, "Service Unavailable");
        response.write("");
        response.end();
    });
    request.on("data", function (requestDataChunk) {
        newRequest.write(requestDataChunk);
    });
    request.on("end", function () {
        newRequest.end();
    });
}).listen(port);