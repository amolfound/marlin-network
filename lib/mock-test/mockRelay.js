// var ConnectionToMaster = require("./connectionToMaster")
// var masterConnection = new ConnectionToMaster("ws://localhost:8080");


//var MasterWss = require("./MasterWss")

const path = require('path')

var resourceManager = require("../daemons/ResourceManager")
var relayManager = require("../daemons/RelayManager")
var relayHttpServer = require("../daemons/RelayHttpServer")


var masterHttpPort = "8000"
var relayHttpPort = "8001"

var workDir = path.join(__dirname + '/workDirRelay')
var localUrl = "http://"+"localhost:"+ relayHttpPort

var resourceManagerOptions = {
	'workDir': workDir,
	'localUrl': localUrl
}

var resourceManager = new resourceManager(resourceManagerOptions)

//call the commands here

// resourceManager.init()

resourceManager.downloadResourceFromUrl("http://localhost:8000/LIN-efda17f8f234ef1b4cd85e40c88da270", "LIN-efda17f8f234ef1b4cd85e40c88da270")
	.then((msg) => {
        console.log(msg)})
    .catch((err) => {
    	console.log(err)});

console.log(resourceManager._resourceMap);

serverConfig = {
	ip: "0:0:0:0",
	port: relayHttpPort,
	staticDir: workDir
}

httpServer = new relayHttpServer(serverConfig, resourceManager);
httpServer.setupRoutes();
httpServer.listen();