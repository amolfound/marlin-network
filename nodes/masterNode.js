'use strict';

const EventEmitter = require('events');
const setConfig = require('../helpers/setConfig');
const nodeState = require('../helpers/nodeState');

// -------- components for the master node ------
// manage follower relays
const RelaysManager = require('../daemons/relaysManager');
// route incoming requests
const RequestRouter = require('../daemons/requestRouter');
// report to resource manager
const ResourceManager = require('../daemons/resourceManager');
//  accept and start web sockets and HTTP connections
const Server = require('../daemons/server');

class Master extends EventEmitter {
  constructor(config, logger) {
    super();

    // master node core components - connects to them or creates them if not running
    this.relaysManager = new RelaysManager(logger);
    this.requestRouter = new RequestRouter(logger);
    this.resourceManager = new ResourceManager(logger);
    this.server = new Server(logger);

    // state machine for the master node
    this.state = nodeState(this, logger);

    this.init();
  }

  init() {
    // creating account, finding bootstrap nodes, advertising
  }

  start() {
    // logic for starting
  }

  stop() {
    // stopping
  }

  status() {
    // is the node online, accepting requests, resources and what's left, how many relays, ports in use, etc
  }

  config() {
    // returns node address, public parameters, time since joining, balance, zone, storage directory
  }
}

module.exports = Master;
