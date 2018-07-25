// for relaysManager
// does it take from db when master nodes shutdown and start again. 

"use strict";

const RelayInfo = require('../RelayInfo');
const ResourceManager = require('./resourceManager');

class RelayManager {

  constructor(resourceManager) {
    this._relayMap = {};  // maps relay id to relay info object
    this._resourceRelayMap = {}; // maps resources to relay ids
    this._resourceManager = resourceManager;
  };
  
  addRelay(relayMetadata) {
    this._relayMap[relayMetadata.id] = new RelayInfo(relayMetadata);

    // return new Promise((resolve, reject) => {
    //   const query = this._pgClient.query('INSERT INTO relayNodeTable(ip, port, status, masterNodeId, tokens) values($1, $2, $3, $4, $5) RETURNING id',
    //       [ip, port, true, this._selfId, 0]);
    //   query.then((res) => {
    //     console.log(res);
    //     var relayNodeId = res.rows[0].id;
    //     var data = {"id": relayNodeId, "masterId": selfId};
    //     resolve(data);
    //   })
    //   .catch((e) => reject(e))
    // })
  }


  /*
  gets the redirection url
  updates info regarding the relay usage
  */

  //TODO : correct this function
  getRedirectionUrl(resourceId) {
    let listRelays = this._resourceRelayMap[resourceId];
    if (listRelays != undefined && listRelays.size != 0) {
      let relayId = listRelays[0];
      let relayObject = this._relayMap[relayId];
      if (relayObject != undefined) {
        let url = relayObject._url+"/"+resourceId;
        console.log(url);
        return url;
      }
    }

    return null
  }

  distributeResource(relayId) {
    let resourceToDistribute = "some random resource id";
    // send the info across relay websocket?
  }

  storageConfirmation(relayId, resourceId) {
    if (this._resourceRelayMap[resourceId] == undefined) {
      this._resourceRelayMap[resourceId] = [];
    }
    this._resourceRelayMap[resourceId].push(relayId);
    this._relayMap[relayId].addResource(resourceId);
  }

  /*)
  getRandomValuesFromArray(inArray, numberOfElements) {
    if(inArray.length <= numberOfElements) {
      return inArray;
    }
    inArray.sort(function(a, b){return 0.5 - Math.random()});
    return inArray.slice(0, numberOfElements);
  }

  getResourcesToDistribute(numberOfResources = 3) {
    let resourceIDs = Object.keys(this._resourceRelayMap);
    return this.getRandomValuesFromArray(resourceIDs, numberOfResources);
  }

  getRelaysToDistribute(numberOfRelays = 3){
    let relayIDs = Object.keys(this._relayInfoMap);
    return this.getRandomValuesFromArray(relayIDs, numberOfRelays);
  }
  */
}

// Singleton class
module.exports = RelayManager;
