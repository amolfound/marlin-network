const express = require('express');
const app = express();
const http = require('http');
var cors = require('cors');
var bodyParser = require('body-parser');


class HttpServer {

	constructor(options, resourceManager) {
		this._port = options.port;
	    this._ip = options.ip;
	    // this._info = options.info;
	    // this._static = options.static;
	    this._staticDir = options.staticDir;
        this._resourceManager = resourceManager;

	    this._app = app;
        this._app.use(bodyParser.json())
        this._app.use(cors());

	    this._listening = false;
	    this._server = http.createServer(app);;
    }


    //called after setting up routes
    listen() {
        //this._app.use(express.static(this._staticDir));

        this._server.listen(this._port, 'localhost', () => {
            this.listening = true;
            console.log("Listening for HTTP requests on port: " + this._port);
        });
    }

    // close() {
    // }
}

module.exports = HttpServer;