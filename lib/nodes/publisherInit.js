const {cp} = require('../helpers/interface');
const setConfig = require('../helpers/setConfig');
const prints = require('../helpers/prints');
const v = require('../helpers/validation');

const getMatchingContainers = require('../containers/get')
  .getMatchingContainers;

const about = require('../containers/about').about;

const _loadPublishers = function loadPublishers() {
  // check for any running publisher containers
  // print out info about current setup
  // TODO: compare them to config, see if they match, discard invalid config
  return getMatchingContainers('publisher');
};

const _printPublishers = function printPublishers(containers) {
  if (!containers.length) {
    this.log(
      'There are currently no dockerized publisher nodes on your machine'
    );
    return false;
  }
  this.log(
    prints.underline(
      'Current publisher node' + (containers.length > 1 ? 's' : '') + ':\n'
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
      'What Ethereum address to use with this publisher node? ',
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

const _createNewPublisher = async function getPublisherConfig() {
  const confirmAction = _confirmAction.bind(this);
  const getAddress = _getAddress.bind(this);
  // ask user for config parametes they want
  let publisher = {};
  let address = this.config['account']['address'];
  let db = `${this.config['db']['host']}:${this.config['db']['port']}`;
  let geth = `${this.config['geth']['host']}:${this.config['geth']['port']}`;
  let choice = await confirmAction(
    `Use address ${address} for the new publisher node?`
  );
  if (!choice) {
    address = await getAddress();
  }
  publisher = await this.prompt([
    cp(
      'input',
      'name',
      'Choose a name for the publisher node: ',
      '',
      [],
      v.isString
    ),
    cp('input', 'port', 'Choose a port: ', '', [], v.isPort),
  ]);
  publisher['address'] = address;
  publisher['db'] = db;
  publisher['geth'] = geth;
  publisher['init'] = true;
  await setConfig('publishers', publisher, true);
  return true;
};

const _managePublisher = async function managePublisher(publisher) {
  // about, stop, remove, resize, etc
  (await this.prompt(
    cp(
      'confirm',
      'manage',
      `Would you like to modify publisher node ${publisher.Names}`,
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
const initPublishers = async function initPublishers() {
  const printPublishers = _printPublishers.bind(this);
  const createNewPublisher = _createNewPublisher.bind(this);
  const managePublisher = _managePublisher.bind(this);
  let choice = false;

  try {
    this.log(prints.header('Publisher Nodes Setup'));
    // check for existing publisher nodes
    let containers = await _loadPublishers();
    await printPublishers(containers);

    // if there are existing publishers, ask if user wants to manage them
    if (containers.length) {
      choice = await this.prompt(
        cp('confirm', 'manage', `Do you want to modify current setup?`, true)
      ).then(answer => (answer.manage ? true : false));
      if (choice) {
        for (c in containers) {
          await managePublisher(containers[c]);
        }
      }
    }

    // ask user if they want new publisher setup
    choice = await this.prompt(
      cp('confirm', 'create', `Do you want to add a new publisher node?`, true)
    ).then(answer => (answer.create ? true : false));
    while (choice === true) {
      await createNewPublisher();
      this.log('Queued creation of new publisher node.');
      choice = await this.prompt(
        cp(
          'confirm',
          'create',
          `Do you want to add another new publisher node?`,
          true
        )
      ).then(answer => (answer.create ? true : false));
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = initPublishers;
