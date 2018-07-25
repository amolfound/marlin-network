'use strict';

const WebSocket = require ('ws');
const EventEmitter = require('events');

class ConnectionToMaster extends EventEmitter {

  constructor(masterAddress) {
    super();
    this._masterAddress = masterAddress;
    this._ws = new WebSocket(masterAddress);

    this._ws.on('open', () => {
      // this._ws.send('something');
    });

    this._ws.on('message', (data, flags) => {
      this._handleMessage(data);
    });

    this._ws.on('ping', () => {
      console.log("received ping")
    })
  }

  _handleMessage(data) {
    console.log(data);
    if(data.type == "SETUP") {
      _onSetup(data);
    }
    if(data.type == "SEED") {
      _onSeed(data);
    }
  }

  _onSeed(data) {
    // send an http request here or emit an event which will do that for you

    // var fileDetails = await resourceManager.getFileFromMaster(data.url, fileName, fileHash)
    // message = {
    //   type: "CACHED",
    //   fileName: fileDetails.fileName,
    //   fileUrl: fileDetails.url
    // } 
    // ws.send()
  }

  // onSetup(data) {
  //   // send back confirmation once done creating entries
  //   message = {
  //     type: "SETUP_COMPLETE";
  //   }
  //   ws.send(message);
  // }
}

module.exports = ConnectionToMaster;
