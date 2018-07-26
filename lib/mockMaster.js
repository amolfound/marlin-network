//var MasterWss = require("./MasterWss")

const path = require('path')

var resourceManager = require("./daemons/ResourceManager")
var relayManager = require("./daemons/RelayManager")
var masterHttpServer = require("./daemons/MasterHttpServer")


var masterHttpPort = "8000"
var relayHttpPort = "8001"

var workDir = path.join(__dirname + '/workDirMaster')
var localUrl = "http://"+"localhost:"+ masterHttpPort


var resourceManagerOptions = {
	'workDir': workDir,
	'localUrl': localUrl
}

var resourceManager = new resourceManager(resourceManagerOptions)
var relayManager = new relayManager(resourceManager)

//call the commands here

resourceManager.init()

var mockRelayOptions = {
	'id': 'relay1',
	'url': 'http://localhost:'+relayHttpPort
}

// relayManager.addRelay(mockRelayOptions);
// relayManager.storageConfirmation('relay1', "LIN-efda17f8f234ef1b4cd85e40c88da270");

console.log(resourceManager._resourceMap);
console.log(relayManager._relayMap);
console.log(relayManager._resourceRelayMap);

var serverConfig = {
	ip: "0:0:0:0",
	port: masterHttpPort,
	staticDir: workDir
}

var masterHttpServer = new masterHttpServer(serverConfig, resourceManager, relayManager);
masterHttpServer.setupRoutes();
masterHttpServer.listen();
// httpServer.listen();


