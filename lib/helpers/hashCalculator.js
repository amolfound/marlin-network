// calculates md5 hash of a given file data
const crypto = require('crypto');
const fs = require('fs');

const calculateHash = function(data) {
  let hash = crypto.createHash('md5').update(data).digest("hex"); 
  return hash;
};

const verifyHashForFileName = function(filename, data) {
	var hashFromName = filename.replace('LIN-','');
	let hash = calculateHash(data);

	return (hashFromName == hash);
};

module.exports = {
  calculateHash,
  verifyHashForFileName
};
