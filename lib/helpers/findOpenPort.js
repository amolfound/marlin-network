'use strict';

const net = require('net');

const isPortFree = function(port) {
  return new Promise(function(resolve, reject) {
    var server = net.createServer();

    // reject if port in use
    server.once('error', function(err) {
      if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
        reject(new Error('port in use'));
      }
    });

    // listen for connection and resolve if no errors
    server.once('listening', function() {
      server.once('close', function() {
        resolve(port);
      });

      server.close();
    });

    server.listen(port, '0.0.0.0');
  });
};

const findOpenPort = function findOpenPort(start) {
  process.stdout.clearLine(); // clear current text
  process.stdout.cursorTo(0);
  // check if port is free
  return isPortFree(start)
    .then(open => {
      process.stdout.write(`The next available port is ${open}.\n`);
      return open;
    })
    .catch(err => {
      process.stdout.write(`Port ${start} is not available.`);
      return findOpenPort(Number(start) + 1);
    });
};

module.exports = findOpenPort;
