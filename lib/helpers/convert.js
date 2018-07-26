// utility functions to convert things

// string to uint array
const unicodeStringToTypedArray = function(s) {
  var escstr = encodeURIComponent(s);
  var binstr = escstr.replace(/%([0-9A-F]{2})/g, function(match, p1) {
    return String.fromCharCode('0x' + p1);
  });
  var ua = new Uint8Array(binstr.length);
  Array.prototype.forEach.call(binstr, function(ch, i) {
    ua[i] = ch.charCodeAt(0);
  });
  return ua;
};

// make a video table starting from videos which is array of {filename:'', numChunks:'',id:''}
const makeVideoTable = function(videos) {
  let videoTable = [];
  videos.forEach(video => {
    videoTable.push([video.filename + '.m3u8']);
    for (j = 0; j < video.numChunks; j++) {
      videoTable[i].push(video.filename + '_' + j + '.ts');
    }
  });

  return videoTable;
};

module.exports = {
  unicodeStringToTypedArray,
};
