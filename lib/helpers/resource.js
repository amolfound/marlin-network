// const databaseConnector = require('../connections/databaseConnector');
const request = require('request');
//const Chunk = require('./chunk'); introduce this later
const hashCalculator = require('./hashCalculator');
const fs = require('fs');

const Status = Object.freeze({
  ABSENT: 1,
  DOWNLOADING: 2,
  CACHED: 3,
});

class Resource {

  constructor(options) {
    this._id = options.id;
    // this._chunkIDs = options.chunkIDs;
    this._size = options.size;
    this._workDir = options.workDir;
    this._filePath = this._workDir + "/" + this._id;
    this._status = Status.ABSENT; // make this an enum

    this._popularity = 0;
  }

  static loadResourceMetadataFromDB(resourceID){
    return new Promise((resolve, reject) => {

    })
  }

  saveResourceMetadataToDB(){
    return new Promise((resolve, reject) => {

    })
  }

  static checkDirectorySizeSync(directoryPath) {
    let directorySize = 0;
    let files = fs.readdirSync(directoryPath);
    files.forEach((file) => {
      let filePath = directoryPath + "/" + file;
      if(fs.statSync(filePath).isDirectory()) {
        directorySize += checkDirectorySizeSync(filePath);
      } 
      else {
        directorySize += fs.statSync(filePath).size;
      }
    })
    return directorySize;
  }

  downloadResourceFromUrl(resourceUrl) {
    return new Promise((resolve, reject) => {
      request({
        url: resourceUrl,
        method: "GET",
        encoding: null // Very important parameter
      }, (error, response, body) => {
            if(error) {
              return reject(error);
            }
            else if (response.statusCode >= 400 && response.statusCode < 600) {
              return reject("Status Code: " + response.statusCode);
            }
            else {
              const data = body;
              /*
              if(this._checkDirectorySizeSync(this._workDir) + data.length > this._workDirMaxSize) {
                reject("Insufficient directory size");
              }
              */
              
              if (hashCalculator.verifyHashForFileName(this._id, data)) {
                fs.writeFile(this._filePath, data, 
                  'binary', (err) => {
                  if(err) {
                    reject(err);
                  } else {
                    this._size = data.length;
                    this._status = Status.CACHED;
                    let resourceDetails = {
                      'timeTaken': response.elapsedTime,
                      'resourceSize': body.length
                    }
                    resolve(resourceDetails);
                  }
                })
              }
            }
          });
      });
  }



  getReadStreamForUpload() {
    // update stats
    let readStream = fs.createReadStream(this._filePath);
    return readStream;
  }


  // Getters and setters

  getPopularity(){
    return this._popularity;
  }

  setPopularity(popularity){
    this._popularity = popularity;
  }

  /* for chunked implementation
  downloadResourceFromUrl(resourceUrl, resourceHash) {
    return new Promise((resolve, reject) => {
        let promiseArray = [];
        this._chunkIDs.forEach(function(chunkID) {
          promiseArray.push(Chunk.getChunkFromMaster(chunkID, resourceUrl));
        })
        Promise.all(promiseArray).then((values) => {
          const data = Buffer.concat(values);
          if(checkDirectorySizeSync(this._workingDirectory) + data.length > this._workingDirectoryMaxSize) {
              reject("Insufficient directory size");
          }
          const hash = crypto.createHash('md5').update(data).digest("hex");
          if(hash == resourceHash){
            fs.writeFile(localResourcePath, data, 
              'binary', function(err){
              if(err) {
                reject(err);
              } else {
                this._status = Status.CACHED;
                resolve("Done");
              }
            })
          }
        }).catch((err) => {
          reject(err);
        })
      }) 
  }*/

}

module.exports = Resource;