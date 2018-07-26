const WebSocket = require('ws');
// const client = require('./client') TODO: Import client

const MessageType = Object.freeze({
  registerRelay: 'registerRelay',
  storageConfirmation: 'storageConfirmation'
});

// TODO - Make relayManager and resourceManager singleton 
const relayManager = getRelayManager();
const resourceManager = getResourceManager();

class MasterWSS {

  constructor() {
    this._wss = new WebSocket.Server({ port: 8080 });

    this._wss.on('connection', (ws, req) => {

      const ip = req.connection.remoteAddress;
      console.log(ip);

      // TODO: move it to _onSeedRequest()
      // relayManager.getFilesToDistribute
      var message = {
        type: "SEED",
        fileName: "file1",
        url: "http://localhost/file1" 
      }
      ws.send(JSON.stringify(message));

      // call to relaymanager register relay here, get files to distribute
      // async function to get the files to distribute and send

      ws.isAlive = true;

      ws.on('pong', this._heartbeat);

      ws.on('message', this._handleMessage);

      /*
      // TODO: Need port too
      relayId = await relaysManager.addNewRelay(ip);
      
      message = {
        type: "SETUP",
        id: relayId,
        masterId: selfId
      }

      ws.send(message); */

    });

    const interval = setInterval(() => {
      this._wss.clients.forEach(ws => {
        if (ws.isAlive === false) return ws.terminate();
     
        ws.isAlive = false;
        ws.ping(this._noop);
      });
    }, 3000);
  }

  _noop() {}

  _heartbeat() {
    this.isAlive = true;
  }

  _handleMessage(message) {
    if(message == null) { } //TODO: Error handling
    switch(message.type){
      case MessageType.registerRelay: {
        const relayOptions = message.params.relayOptions;
        relayManager.addRelay(mockRelayOptions)
        break;
      }
      case MessageType.storageConfirmation: {
        const relayId = message.params.relayId;
        const resourceId = message.params.resourceId;
        relayManager.storageConfirmation(relayId, resourceId);
        break;
      }
    }
  }
}

module.exports = MasterWSS;