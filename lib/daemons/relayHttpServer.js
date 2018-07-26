var HttpServer = require("./HttpServer");
const path = require('path');
const mime = require('mime');

class RelayHttpServer extends HttpServer {

	constructor(options, resourceManager,) {
		super (options, resourceManager);
	}

	setupRoutes() {
		if (this._staticDir) {
			this._app.get('/:resourceId', (req, res) => {
				console.log(req.params);
				const resId = req.params.resourceId;
                
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
			})

		}
	}
}

module.exports = RelayHttpServer;