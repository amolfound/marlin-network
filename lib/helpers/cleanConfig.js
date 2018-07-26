const fs = require('fs-extra');
const {homedir, hostname} = require('os');
const path = require('path');
const Joi = require('joi');

const configFile = path.join(homedir(), '.marlin', hostname() + '.json');

const _filter = (arr, name) => arr.filter(item => item.name !== name);

const cleanConfig = async function(containers) {
  try {
    let config = fs.readJsonSync(configFile);
    if (!containers) {
      config['masters'] = [];
      config['publishers'] = [];
      config['relays'] = [];
      config['db'] = {};
      config['geth'] = {};
    } else {
      await containers.forEach(async container => {
        let name = await container.name();
        let type = await container.type();
        switch (type) {
          case 'database':
            config['db'] = {};
            break;
          case 'blockchain':
            config['geth'] = {};
            break;
          case 'master':
            config['masters'] = _filter(config['masters'], name);
            break;
          case 'relay':
            config['relays'] = _filter(config['relays'], name);
            break;
          case 'publisher':
            config['publishers'] = _filter(config['publishers'], name);
            break;
        }
      });
    }
    config['lastUpdate'] = Date.now();
    fs.writeJsonSync(configFile, config);
  } catch (err) {
    throw new Error('Unable to write config file ' + err);
  }
  return true;
};

module.exports = cleanConfig;
