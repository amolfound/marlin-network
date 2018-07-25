const fs = require('fs-extra');
const {homedir, hostname} = require('os');
const path = require('path');
const Joi = require('joi');

const configFile = path.join(homedir(), '.marlin', hostname() + '.json');

// TODO: add validation
const setConfig = function(key, value, append) {
  const {error} = Joi.validate(
    {key, value},
    {
      key: Joi.string(),
      value: [Joi.object(), Joi.string(), Joi.number()],
    }
  );
  if (error) {
    throw new Error(error);
  }
  try {
    let config = fs.readJsonSync(configFile);
    if (append) {
      config[key].push(value);
    } else {
      config[key] = value;
    }
    config['lastUpdate'] = Date.now();
    fs.writeJsonSync(configFile, config);
  } catch (err) {
    throw new Error('Unable to write config file ' + err);
  }
  return true;
};

module.exports = setConfig;
