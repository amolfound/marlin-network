const path = require('path')
const fs = require('fs')
const calculateHash = require('../helpers/hashCalculator').calculateHash;

var video = __dirname + "/workDirMaster/video1.ts";
console.log(video);

var data = fs.readFileSync(video);
console.log(calculateHash);
var hash = calculateHash(data);
console.log(hash);