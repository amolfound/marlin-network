var HttpServer = require("./HttpServer");
const path = require('path');
const mime = require('mime');

class MasterHttpServer extends HttpServer {

	constructor(options, resourceManager, relayManager) {
		super (options, resourceManager);
		this._relayManager = relayManager;
	}

	setupRoutes() {
		this._app.get('/registerRelay/:relayId', (req, res) => {
			// create relay object
			this._relayManager.addRelay(relayManager.addRelay(mockRelayOptions));
		})

		this._app.get('/storageConfirmation/:relayId/:resourceId', (req, res) => {
			this._relayManager.storageConfirmation(relayId, resourceId);
		})

		if (this._staticDir) {
			this._app.get('/:resourceId', (req, res) => {
				console.log(req.params);
				const resId = req.params.resourceId;
				const redirUrl = this._relayManager.getRedirectionUrl(resId);

				console.log(redirUrl);

				if (redirUrl !== null && redirUrl !== '') {
					// redirect responses here
					res.redirect(redirUrl);	
				} else {
	                let sum = 0;
	                // const postfix = req.params.postfix;
	                const fileSize = this._resourceManager.getFileSize(resId);
	                const ip = req.connection.remoteAddress.replace(/^::ffff:/, "");

	                const head = {
	                    "Content-Length": fileSize,
	                    // "Content-Type": ,
	                    "Cache-Control": "no-cache"
	                };
	                res.writeHead(200, head);
	                let readStream = this._resourceManager.getReadStreamForUpload(resId);
	                if (readStream != undefined) {
	                	readStream 
	                    .on("data", (chunk) => {
	                    	console.log(sum);
	                        sum += chunk.length;
	                        // logger.info(ip, infoHash, chunk.length, postfix, sum)
	                    })
	                    .pipe(res);
	                }
				}
			})

		}
	}
}

module.exports = MasterHttpServer;