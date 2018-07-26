const {cp} = require('../helpers/interface');
const setConfig = require('../helpers/setConfig');
const prints = require('../helpers/prints');
const v = require('../helpers/validation');

const getMatchingContainers = require('../containers/get')
  .getMatchingContainers;

const about = require('../containers/about').about;

const _loadMasters = function loadMasters() {
  // check for any running master containers
  // print out info about current setup
  // compare them to config, see if they match, discard invalid config
  return getMatchingContainers('master');
};

const _printMasters = function printMasters(containers) {
  if (!containers.length) {
    this.log('There are currently no dockerized master nodes on your machine');
    return false;
  }
  this.log(
    prints.underline(
      'Current master node' + (containers.length > 1 ? 's' : '') + ':\n'
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
      'What Ethereum address to use with this master node? ',
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
//       name: 'master0',
//       memInMB: '1200',
//       cpuPercent: '30',
//       address: '0x6d12879b81940c00bd42772ddc1acd17afe5da30',
//       strategy: 'default',
//       db: 'localhost:4000',
//       geth: 'localhost:4001',
//     },
const _createNewMaster = async function getMasterConfig() {
  const confirmAction = _confirmAction.bind(this);
  const getAddress = _getAddress.bind(this);
  // ask user for config parametes they want
  let master = {};
  let address = this.config['account']['address'];
  let db = `${this.config['db']['host']}:${this.config['db']['port']}`;
  let geth = `${this.config['geth']['host']}:${this.config['geth']['port']}`;
  let choice = await confirmAction(
    `Use address ${address} for the new master node?`
  );
  if (!choice) {
    address = await getAddress();
  }
  // TODO: ask for strategy choice when decision is made about possibilities
  master = await this.prompt([
    cp(
      'input',
      'name',
      'Choose a name for the master node: ',
      '',
      [],
      v.isString
    ),
    cp('input', 'port', 'Choose a port: ', '', [], v.isPort),
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
  master['address'] = address;
  master['strategy'] = 'default';
  master['db'] = db;
  master['geth'] = geth;
  master['init'] = true;
  setConfig('masters', master, true);
  return true;
};

const _manageMaster = async function manageMaster(master) {
  // about, stop, remove, resize, etc
  (await this.prompt(
    cp(
      'confirm',
      'manage',
      `Would you like to modify master node ${master.Names}`,
      true
    )
  ).then(answer => (answer.manage ? true : false)))
    ? this.log('This has not been implemented yet.')
    : null;

  // for management, the idea is to present the user with a few options
  // and based on what they want to change, either change env variables
  // in the container and restart it or queue its removal and the starting
  // of a new one with the new configuration
  return true;
};

//
// ─── PUBLIC API ─────────────────────────────────────────────────────────────────
//
const initMasters = async function initMasters() {
  const printMasters = _printMasters.bind(this);
  const createNewMaster = _createNewMaster.bind(this);
  const manageMaster = _manageMaster.bind(this);
  let choice = false;

  try {
    this.log(prints.header('Master Nodes Setup'));
    // check for existing master nodes
    let containers = await _loadMasters();
    await printMasters(containers);

    // if there are existing masters, ask if user wants to manage them
    if (containers.length) {
      choice = await this.prompt(
        cp('confirm', 'manage', `Do you want to modify current setup?`, true)
      ).then(answer => (answer.manage ? true : false));
      if (choice) {
        for (c in containers) {
          await manageMaster(containers[c]);
        }
      }
    }

    // ask user if they want new master setup
    choice = await this.prompt(
      cp('confirm', 'create', `Do you want to add a new master node?`, true)
    ).then(answer => (answer.create ? true : false));
    while (choice === true) {
      await createNewMaster();
      this.log('Queued creation of new master node.');
      choice = await this.prompt(
        cp(
          'confirm',
          'create',
          `Do you want to add another new master node?`,
          true
        )
      ).then(answer => (answer.create ? true : false));
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = initMasters;
