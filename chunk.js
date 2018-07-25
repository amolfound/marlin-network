// const databaseConnector = require('../connections/databaseConnector');
const request = require('request');

const Status = {
  ABSENT: 1,
  DOWNLOADING: 2,
  CACHED: 3,
};

class Chunk {
  constructor(options){
      this._id = options.id;
      this._size = options.size;
      this._workDir = options.workDir;
      this._resourceID = options.resourceID;
      this._chunkPosition = options.chunkPosition;
      this._status = Status.ABSENT;
  }

  static loadChunkMetadataFromDB(id){
      return Promise((resolve, reject) => {

      })
  }

  saveChunkMetadataToDB(){
      return Promise((resolve, reject) => {

      })
  }

  // TODO : Ensure chunkName is properly maintained.
  // TODO : Hash Checks
  // TODO : 
  static getChunkFromMaster(chunkID, masterURL) {    
    return new Promise((resolve, reject) => {
      const queryString = {'chunkID' : chunkID};
      request({
        url: masterURL + "/getChunkUsingID" ,
        qs: queryString,
        method: "GET",
        encoding: null // Very important parameter
      }, function (error, response, body) {
            if(err) {
              reject(err);
            } else {
              resolve(body);
            }
          });
      });
  }

};

module.exports = Chunk;
module.exports = Status;