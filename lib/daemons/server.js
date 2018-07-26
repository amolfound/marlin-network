// basically a  websocket connection/listener/handler combined with regular HTTP server
// This can in turn call contentFetcher or various other things.
// This module can be both on master as well as relay side.

// accepts content to store, and serves stored content

var app = require('express').createServer();
var io = require('socket.io')(app);

// send certificates it received to the CM
const certificatesManager = require('../helpers/certificatesManager');
// connect to instance of geth (via RPC) to send tx
const gethConnector = require('../connections/gethConnector');
// connect to database to log events
const databaseConnector = require('../connections/databaseConnector');
// control what files are stored locally and report on their access
const localFilesManager = require('../helpers/localFilesManager');

app.listen(4001);

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/server.js');
});

io.on('connection', function(socket) {
  socket.emit('news', {hello: 'world'});
  socket.on('my other event', function(data) {
    console.log(data);
  });
});

// ROUTES
//---- accept SC
app.post('/service-certificate', function(request, response) {
  var body = request.body;
  receivedServiceCertificate(body);
  response.send('OK');
});

//----- accept/send file confirmation
// if master
app.post('/fileConfirmationFromRelay', function(request, response) {
  var body = request.body;
  fileConfirmationFromRelay(body, response);
});

function fileConfirmationFromRelay(params, responseStruct){
  var relayUrl = params.relayUrl;
  var resourceName = params.resourceName;
  resourceRelayUrlDict[resourceName] = relayUrl;
  responseStruct.send('POST request to the master');
  var pusherMessage =
    'Storage confirmation from relay for resource: ' + resourceName;
  util.consoleAndPusherLog(
    pusherChannel,
    pusherChannel,
    selfId,
    pusher,
    pusherMessage
  );
}
// if relay

//------ relay registration
app.post('/registerRelay', function(request, response) {
  var body = request.body;
  registerRelay(body, response);
});


function registerRelay(params, responseStruct){
  var relayIp = params.ip;
  var port = params.port;
  console.log(relayIp);

  var videoNumber = Math.floor(Math.random() * numVideos);
  var videoName = 'video' + videoNumber;

  const query = client.query(
    'INSERT INTO relayNodeTable(ip, port, status, masterNodeId, tokens) values($1, $2, $3, $4, $5) RETURNING id',
    [body.ip, body.port, true, selfId, 0]
  );
  query
    .then(res => {
      console.log(res);
      var relayNodeId = res.rows[0].id;

      responseStruct.send({
        id: relayNodeId,
        masterId: selfId,
        videoName: videoName,
        videoFiles: videoTable[videoNumber],
      });
    })
    .catch(e => console.error(e.stack));
}

//----- route request to suitable relay
app.use(function(request, response, next) {
  var resourceName = util.getResourceNameFromUrl(request.url);

  if (
    path.extname(resourceName) == '.m3u8' ||
    path.extname(resourceName) == '.ts'
  ) {
    var message = 'Request from client for resource: ' + resourceName;
    util.addMasterConsoleLog(client, message, selfId);
    util.consoleAndPusherLog(pusherChannel, 'console', selfId, pusher, message);

    var videoName = resourceName.split('_')[0];
    console.log(videoName);

    client
      .query(
        'SELECT * from relayNodeTable where masterNodeId = $1 AND videoName = $2 AND status = true',
        [selfId, videoName]
      )
      .then(result => {
        console.log(result);
        if (result.rows.length != 0) {
          randomNumber = Math.floor(Math.random() * result.rows.length);
          var tempRow = result.rows[randomNumber];
          var relayId = tempRow.id;
          var relayIp = tempRow.ip;
          var relayPort = tempRow.port;
          var redirectUrl =
            'http://' + relayIp + ':' + relayPort + '/' + resourceName;

          console.log(redirectUrl);

          var ip = relayIp.split('.')[0];
          ip = ip.replace('ec2-', '');
          ip = ip.replace(/-/g, '.');

          var message =
            'Redirecting to relay: ' + ip + '. For resource: ' + resourceName;

          util.addMasterConsoleLog(client, message, selfId);
          util.consoleAndPusherLog(
            pusherChannel,
            'console',
            selfId,
            pusher,
            message
          );

          response.redirect(redirectUrl);
        } else {
          next();
        }
      })
      .catch(e => console.error(e.stack));
  } else {
    next();
  }
});

// ------- publisher posts resource to master
app.get('/uploadContent', function(request, response) {
  response.sendFile(rootPath + '/html/newpublisher.html');
});

app.get('/postResourceToMaster', function(request, response) {
  var fileNames = request.query['fileNames'];
  postResourceToMaster(fileNames);
});

function postResourceToMaster(fileNames){
  console.log(fileNames);
  var fileNameHashMap = {};
  for (index in fileNames) {
    var fileName = fileNames[index];
    //change the port =======================================================
    if (fileName == '') {
      continue;
    }
    var fileUrl = selfUrl + fileName;
    var localFilePath = mediaPath + fileName;

    checkAndUploadFile(localFilePath, fileName, fileUrl);
  }
}

function checkAndUploadFile(localFilePath, fileName, fileUrl) {
  fs.stat(localFilePath, function(err, stat) {
    if (err == null) {
      console.log('File exists');
      var pusherMessage =
        'Uploading to blockchain file details, filename: ' +
        fileName +
        ' | localFilePath: ' +
        localFilePath +
        ' | fileUrl: ' +
        fileUrl;
      //util.consoleAndPusherLog(pusherChannel, pusherEvent, pusher, pusherMessage);
      util.calculateHashAndUpload(fileUrl, localFilePath, fileDetailsUploadUrl);
    } else if (err.code == 'ENOENT') {
      // file does not exist
      var pusherMessage =
        'Upload request failed. file doesnt exist, filename: ' +
        fileName +
        ' | localFilePath: ' +
        localFilePath +
        ' | fileUrl: ' +
        fileUrl;
      //util.consoleAndPusherLog(pusherChannel, pusherEvent, pusher, pusherMessage);
    } else {
      console.log('Some other error: ', err.code);
    }
  });
}

// ------ pusher messages
app.post('/pusherMessage/', function(request, response) {
  var body = request.body;
  var temp_channel = body.channel;
  var temp_event = body.event;
  var temp_data = body.data;
  console.log('message from blockchain');
  response.send('POST request to the publisher');
  //util.consoleAndPusherLog(temp_channel, temp_event, pusher, temp_data);
});

// ------- accept service certificates
app.post('/service-certificate', function(request, response) {
  var body = request.body;
  receivedServiceCertificate(body);
  response.send('OK');
});

//---- relay accepts uploads
function uploadContentToRelay(params, responseStruct){
  var fileUrl = params.origin;
  var filehash = params.content_hash;
  var resourceName = util.getResourceNameFromUrl(fileUrl);
  var fileSavePath = path.join(mediaPath, resourceName);
  var localUrl = selfUrl + resourceName;
  response.send('POST request to the relay');
  var pusherMessage =
    'MSG from master to download file from publisher. Requesting from Master. Fileurl: ' +
    fileUrl +
    ' | resourceName: ' +
    resourceName +
    ' | fileSavePath: ' +
    fileSavePath;

  util.consoleAndPusherLog(
    pusherChannel,
    pusherEvent,
    selfId,
    pusher,
    pusherMessage
  );
  util.requestAndVerifyFileFromMaster(
    fileUrl,
    filehash,
    fileSavePath,
    localUrl,
    resourceName
  );
}

app.post('/uploadContentToRelay', function(request, response) {
  var body = request.body;
  uploadContentToRelay(body, response);
});

//---- relay serves content to users
app.use(function(request, response, next) {
  var resourceName = util.getResourceNameFromUrl(request.url);

  if (
    path.extname(resourceName) == '.m3u8' ||
    path.extname(resourceName) == '.ts'
  ) {
    var message = 'Request from client for resource: ' + resourceName;
    util.addRelayConsoleLog(client, message, selfId);
    util.consoleAndPusherLog(pusherChannel, 'console', selfId, pusher, message);

    var localFilePath = mediaPath + resourceName;
    fs.stat(localFilePath, function(err, stat) {
      if (err == null) {
        var pusherMessage = 'Serving to client: ' + resourceName;
        //pusher.trigger(pusherChannel, pusherEvent, pusher);
        util.consoleAndPusherLog(
          pusherChannel,
          'console',
          selfId,
          pusher,
          pusherMessage
        );
      } else if (err.code == 'ENOENT') {
        // file does not exist
        var pusherMessage =
          'Request from client for resource: ' +
          resourceName +
          '. File doesnt exist. localFilePath: ' +
          localFilePath;
        util.consoleAndPusherLog(
          pusherChannel,
          'console',
          selfId,
          pusher,
          pusherMessage
        );
      } else {
        console.log('Some other error: ', err.code);
      }
    });
  }
  next();
});

// relay registers with master node

RegisterWithMaster()
  .then(res => {
    loadContracts();
    app.listen(8000);
  })
  .catch(e => {
    console.log(e);
  });

async function RegisterWithMaster() {
  ethAccount = web3.eth.accounts.create();
  privateKey = ethAccount.privateKey;
  console.log(ethAccount);

  var regionQueryUrl =
    'http://169.254.169.254/latest/meta-data/placement/availability-zone';

  var region = await util.promiseRequest({
    url: regionQueryUrl,
    method: 'GET',
  });

  var masterUrl = 'http://master.' + region + '.demo-v2.marlin.pro/';

  res = await util.promiseRequest({
    url: 'http://169.254.169.254/latest/meta-data/public-hostname',
    method: 'GET',
  });
  selfIp = res;

  // comment this shit
  //var masterUrl = "http://localhost:81/";

  var jsonBody = {ip: selfIp, port: httpPort};
  body = await util.promiseRequest({
    url: masterUrl + 'registerRelay',
    method: 'POST',
    json: true,
    body: jsonBody,
  });

  console.log(body);
  selfId = body.id;
  masterId = body.masterId;

  promiseArray = body.videoFiles.map(item => {
    var filename = item;
    var fileurl = masterUrl + filename;
    return util
      .promiseRequest({
        url: fileurl,
        method: 'GET',
        encoding: null, // very very important parameter. LIFESAVER
      })
      .then(body => {
        return new Promise((resolve, reject) => {
          var filesavepath = path.join(mediaPath, filename);

          mkdirp(path.dirname(filesavepath), function(err) {
            if (err) {
              return reject(err);
            }

            fs.writeFile(filesavepath, body, 'binary', function(err) {
              if (err) {
                return reject(err);
              } else {
                console.log(body);
                console.log('wrote a file');
                resolve('success');
              }
            });
          });
        });
      });
  });

  await Promise.all(promiseArray);
  await client.query('UPDATE relayNodeTable SET videoName = $1 where id = $2', [
    body.videoName,
    selfId,
  ]);
}
//---- relay loads contract
function loadContracts() {
  let certificateAbiSource = fs.readFileSync('smartContracts/Certificate.abi');
  let linAbiSource = fs.readFileSync('smartContracts/Lin.abi');
  let certificateAbi = JSON.parse(certificateAbiSource);
  let linAbi = JSON.parse(linAbiSource);
  certificateContract = new web3.eth.Contract(
    certificateAbi,
    certificateContractAddress
  );
  linContract = new web3.eth.Contract(linAbi, linContractAddress);

  linContract.events
    .Transfer(
      {
        filter: {from: certificateContractAddress, to: ethAccount.address},
        fromBlock: 0,
      },
      function(error, event) {
        console.log(event);
        console.log(error);
      }
    )
    .on('data', function(event) {
      console.log('event');
      console.log(event); // same results as the optional callback above
      client
        .query(
          'UPDATE relayNodeTable SET tokens = tokens + 10 where id = $1 RETURNING tokens',
          [selfId]
        )
        .then(res => {
          console.log(res.rows[0].tokens);
          var message =
            'Transaction mined successfully for txnhash: ' +
            event.transactionHash;
          util.addRelayConsoleLog(client, message, selfId);
          util.consoleAndPusherLog(
            pusherChannel,
            'console',
            selfId,
            pusher,
            message
          );
          util.consoleAndPusherLog(
            pusherChannel,
            'tokens',
            selfId,
            pusher,
            res.rows[0].tokens
          );
        });
    })
    .on('changed', function(event) {
      // remove event from local database
    })
    .on('error', console.error);
}

module.exports = {fileConfirmationFromRelay,
                  registerRelay,
                  postResourceToMaster,
                  uploadContentToRelay };