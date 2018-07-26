// manages and tracks allocation and usage of memory and bandwidth
// control what files are stored locally and report on their access

"use strict";

// const localFilesManager = require('../helpers/localFilesManager');
const request = require('request');
const fs = require('fs-extra');
const rp = require('request-promise');
const Resource = require('../Resource');

class ResourceManager {

  constructor(options) {
    this._workDir = options.workDir;
    this._localUrl = options.localURL;
    this._resourceMap = {};
    // Necessary Statistics 
    this._workDirMaxSize = options.workDirMaxSize;
    this._numResources = 0;
    this._currentDownloadSpeed = 0; // Unit of speed is kbps
    this._averageDownloadSpeed = 0;
    this._workDirSize = 0;
    this._bandwidthConsumed = 0;
  };

  init() {
  	// reads from db and initialized mocks resources

  	// makeshift code here to create mock resources
  	var mockRes1options = {
  		'id': "LIN-efda17f8f234ef1b4cd85e40c88da270",
  		'chunkIDs': 1,
  		'size': 339716,
  		'workDir': this._workDir
  	}
  	this.addNewResource(mockRes1options);

	// var mockRes2options = {
 //  		'id': "video2.ts",
 //  		'chunkIDs': 1,
 //  		'size': "2",
 //  		'localPath': this._workDir
 //  	}
 //  	this.addNewResource(mockRes2options);
  }

  addNewResource(resourceOptions) {
  	this._resourceMap[resourceOptions.id] = new Resource(resourceOptions);
  	this._numResources++;
  }

  downloadResourceFromUrl(resourceURL, resourceID) {    
    return new Promise((resolve, reject) => {    
      // Check if it is already present
      if(resourceID in this._resourceMap){
        var currentResourcePopularity = this._resourceMap[resourceID].getPopularity(); 
        this._resourceMap[resourceID].setPopularity(++currentResourcePopularity);
        resolve(this._resourceMap[resourceID]);
      }

      // Else, download file from Master
      let tempResourceOptions = {
        'id': resourceID,
    		'workDir': this._workDir
      }
      this.addNewResource(tempResourceOptions);
      let resource = this._resourceMap[tempResourceOptions.id];
      console.log(resource);

      resource.downloadResourceFromUrl(resourceURL)
	      .then((resourceDetails) => {
          var timeTaken = resourceDetails['timeTaken'];
          var resourceSize = resourceDetails['resourceSize'];

          this._currentDownloadSpeed = resourceSize/timeTaken;
          this._averageDownloadSpeed = (this._averageDownloadSpeed * (this._numResources - 1) 
            + this._currentDownloadSpeed)/(this._numResources);

          this._bandwidthConsumed += resourceSize;
          this._workDirSize += resourceSize; // TODO: Few resources may be deleted. Check

	      	console.log(resource);
	        resolve(resource) })
	      .catch(err => reject(err));
    })
  }

  getReadStreamForUpload(resourceId) {
    const resource = this._resourceMap[resourceId];
    if (resource !== undefined) {
      return resource.getReadStreamForUpload();
    }
  }

  getFileSize(resourceId) {
    const resource = this._resourceMap[resourceId];
    if (resource !== undefined) {
      return resource._size;
    }
  }

  static getResourceNameFromUrl(fileUrl) {
    let resourceName = url.parse(fileUrl).pathname.substr(1);
    return resourceName;
  };

  static ensureDirectoryExistence(filePath) {
    let dirname = path.dirname(filePath);
    console.log('dirName is ' + dirname);
    if (fs.existsSync(dirname)) {
      return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  };


  // Getters and Setters

  getNumResources(){
    return this._numResources;
  }

  setNumResources(numResources){
    this._numResources = numResources;
  }

  getWorkDirMaxSize(){
    return this._workDirMaxSize;
  }

  setWorkDirMaxSize(workDirMaxSize){
    this._workDirMaxSize = workDirMaxSize;
  }

  getCurrDownloadSpeed(){
    return this._currentDownloadSpeed;
  }

  getAverageDownloadSpeed(){
    return this._averageDownloadSpeed;
  }

  getWorkDirSize(){
    return this._workDirSize;
  }

  getBandwidthConsumed(){
    return this._bandwidthConsumed;
  }

  getStatistics(){
    var statistics = {
      'workDir': this._workDir,
      'workDirMaxSize': this._workDirMaxSize,
      'workDirSize': this._workDirSize,
      'numResources':this._numResources,
      'bandwidthConsumed':this._bandwidthConsumed,
      'currentDownloadSpeed':this._currentDownloadSpeed,
      'averageDownloadSpeed':this._averageDownloadSpeed
    }
    return statistics;
  }

}

// Singleton Class
module.exports = ResourceManager;