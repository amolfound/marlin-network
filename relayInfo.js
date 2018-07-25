"use strict"

const RelayStatus = {
  ALIVE: 1,
  DEAD: 2,
}

class RelayInfo {
	constructor(options) {
		this._id = options.id;
		// this._ws = options.ws;
		this._url = options.url;
		this._resourceIds = [];
	    this._status = RelayStatus.ALIVE;
	}

	addResource(resourceId) {
		// first check if its already there
		this._resourceIds.push(resourceId);
	}
}

module.exports = RelayInfo;