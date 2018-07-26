const {cp} = require('../helpers/interface');
const setConfig = require('../helpers/setConfig');
const prints = require('../helpers/prints');
const v = require('../helpers/validation');

const getMatchingContainers = require('../containers/get')
  .getMatchingContainers;

const about = require('../containers/about').about;

const _loadRelays = function loadRelays() {
  // check for any running relay containers
  // print out info about current setup
  // compare them to config, see if they match, discard invalid config
  return getMatchingContainers('relay');
};

const _printRelays = function printRelays(containers) {
  if (!containers.length) {
    this.log('There are currently no dockerized relay nodes on your machine');
    return false;
  }
  this.log(
    prints.underline(
      'Current relay node' + (containers.length > 1 ? 's' : '') + ':\n'
    )
  );
  return Promise.all(containers.map(container => about(container.Id))).then(
    arr => this.log(...arr)
  );
};

const _confirmAction = function confirmAction(message) {
  this.log(prints.em(message));
  return this.prompt(cp('confirm', 'confirm', `Proceed?`, true)).then(
    answer => (answer.confirm ? true : false)
  );
};

const _getAddress = function getAddress() {
  return this.prompt(
    cp(
      'input',
      'address',
      'What Ethereum address to use with this relay node? ',
      '',
      [],
      v.isAddress
    )
  ).then(answer => answer.address);
};

const _getAction = function getAction() {
  // ask user if they want to modify current node or create new one
  return true;
};

// {
//       port: 4002,
//       name: 'relay0',
//       memInMB: '1200',
//       cpuPercent: '20',
//       address: '0x6d12879b81940c00bd42772ddc1acd17afe5da30',
//       masterIP: "localhost:4002",
//       db: 'localhost:4000',
//       geth: 'localhost:4001',
//     },
const _createNewRelay = async function getRelayConfig() {
  const confirmAction = _confirmAction.bind(this);
  const getAddress = _getAddress.bind(this);
  // ask user for config parametes they want
  let relay = {};
  let address = this.config['account']['address'];
  let db = `${this.config['db']['host']}:${this.config['db']['port']}`;
  let geth = `${this.config['geth']['host']}:${this.config['geth']['port']}`;
  let choice = await confirmAction(
    `Use address ${address} for the new relay node?`
  );
  if (!choice) {
    address = await getAddress();
  }
  relay = await this.prompt([
    cp(
      'input',
      'name',
      'Choose a name for the relay node: ',
      '',
      [],
      v.isString
    ),
    cp('input', 'port', 'Choose a port: ', '', [], v.isPort),
    cp(
      'input',
      'masterIP',
      'What is the IP address of the master node? ',
      'localhost:4002',
      [],
      v.isString
    ),
    cp(
      'input',
      'memInMB',
      'How much memory would you like to set as the limit for the node? (in MB) ',
      '0',
      [],
      v.isNumber
    ),
    cp(
      'input',
      'cpuPercent',
      'What percentage of your CPU processing power do you want to set as limit? ',
      '0',
      [],
      v.isNumber
    ),
  ]);
  relay['address'] = address;
  relay['db'] = db;
  relay['geth'] = geth;
  relay['init'] = true;
  setConfig('relays', relay, true);
  return true;
};

const _manageRelay = async function manageRelay(relay) {
  // about, stop, remove, resize, etc
  (await this.prompt(
    cp(
      'confirm',
      'manage',
      `Would you like to modify relay node ${relay.Names}`,
      true
    )
  ).then(answer => (answer.manage ? true : false)))
    ? this.log('This has not been implemented yet.')
    : null;
  return true;
};

//
// ─── PUBLIC API ─────────────────────────────────────────────────────────────────
//
const initRelays = async function initRelays() {
  const printRelays = _printRelays.bind(this);
  const createNewRelay = _createNewRelay.bind(this);
  const manageRelay = _manageRelay.bind(this);
  let choice = false;

  try {
    this.log(prints.header('Relay Nodes Setup'));
    // check for existing relay nodes
    let containers = await _loadRelays();
    await printRelays(containers);

    // if there are existing relays, ask if user wants to manage them
    if (containers.length) {
      choice = await this.prompt(
        cp('confirm', 'manage', `Do you want to modify current setup?`, true)
      ).then(answer => (answer.manage ? true : false));
      if (choice) {
        for (c in containers) {
          await manageRelay(containers[c]);
        }
      }
    }

    // ask user if they want new relay setup
    choice = await this.prompt(
      cp('confirm', 'create', `Do you want to add a new relay node?`, true)
    ).then(answer => (answer.create ? true : false));
    while (choice === true) {
      await createNewRelay();
      this.log('Queued creation of new relay node.');
      choice = await this.prompt(
        cp(
          'confirm',
          'create',
          `Do you want to add another new relay node?`,
          true
        )
      ).then(answer => (answer.create ? true : false));
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = initRelays;
