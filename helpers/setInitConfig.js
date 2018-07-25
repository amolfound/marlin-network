const fs = require('fs-extra');
const {homedir, hostname} = require('os');
const path = require('path');
const Joi = require('joi');

const configFile = path.join(homedir(), '.marlin', hostname() + '.json');

const _filter = (arr, name) => arr.filter(item => item.name === name);
const _notFilter = (arr, name) => arr.filter(item => item.name !== name);

const setInitConfig = async function(container) {
  try {
    let config = fs.readJsonSync(configFile);
    let name = await container.name();
    name = name.slice(1);
    let type = await container.type();
    let item;
    switch (type) {
      case 'database':
        config['db']['init'] = true;
        break;
      case 'blockchain':
        config['geth']['init'] = true;
        break;
      case 'master':
        item = _filter(config['masters'], name)[0];
        item['init'] = false;
        config['masters'] = _notFilter(config['masters'], name).concat(item);
        break;
      case 'relay':
        item = _filter(config['relays'], name)[0];
        item['init'] = false;
        config['relays'] = _notFilter(config['relays'], name).concat(item);
        break;
      case 'publisher':
        item = _filter(config['publishers'], name)[0];
        item['init'] = false;
        config['publishers'] = _notFilter(config['publishers'], name).concat(
          item
        );
        break;
    }

    config['lastUpdate'] = Date.now();
    fs.writeJsonSync(configFile, config);
  } catch (err) {
    throw new Error('Unable to write config file\n' + err);
  }
  return true;
};

module.exports = setInitConfig;
