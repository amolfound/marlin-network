const resourceManager = require('./daemons/resourceManager')
const relayManager = require("./daemons/RelayManager")
const masterHttpServer = require("./daemons/MasterHttpServer")
const relayHttpServer = require("./daemons/RelayHttpServer")

module.exports = {
	resourceManager, relayManager, masterHttpServer, relayHttpServer
}
