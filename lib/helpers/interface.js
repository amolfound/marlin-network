'use strict';
const Vorpal = require('vorpal');
const Joi = require('joi');

//
// ─── CREATE VORPAL INSTANCES AND KEEP TRACK OF HISTORY ──────────────────────────
//
const vorpalSchema = {
  delimeter: Joi.string()
    .min(3)
    .required(),
  commands: Joi.array().items(
    Joi.object().keys({
      keyword: Joi.string()
        .alphanum()
        .required(),
      description: Joi.string()
        .min(2)
        .required(),
      action: Joi.func()
        .arity(3)
        .required(),
      parse: Joi.func(),
      alias: Joi.string(),
      options: Joi.array().items(
        Joi.object().keys({keyword: Joi.string(), description: Joi.string()})
      ),
      types: Joi.object(),
      hidden: Joi.boolean(),
      remove: Joi.boolean(),
      validate: Joi.func(),
      autocomplete: [Joi.func(), Joi.array().items(Joi.string()), Joi.string()],
      cancel: Joi.func(),
    })
  ),
  config: Joi.object(),
  vorpals: Joi.array(),
};

const createVorpal = function(delimeter, commands, config, vorpals) {
  const {error} = Joi.validate(
    {delimeter, commands, config, vorpals},
    vorpalSchema
  );
  if (error) {
    throw new Error(error);
  }

  const vorpal = Vorpal();
  // for nested instances, the exit command is removed to allow for backward tree traversal
  if (vorpals.length > 0) {
    vorpal.find('exit').remove();
  }

  commands.forEach(cmd => {
    let new_command = vorpal
      .command(cmd.keyword, cmd.description)
      .action(function(args, callback) {
        let action = cmd.action.bind(this);
        try {
          action(args, config, vorpals).then(callback);
        } catch (err) {
          this.log('ERROR! ' + err);
        }
      });

    cmd.options.forEach(opt => {
      new_command.option(opt.keyword, opt.description);
    });

    new_command.types(cmd.types);

    if (cmd.alias) {
      new_command.alias(cmd.alias);
    }
  });

  vorpal.delimiter(vorpal.chalk.magenta.bold(delimeter + '$'));

  return vorpal;
};

//
// ─── GENERATE PROMPTS OBJECTS EASIER AND SAFER ──────────────────────────────────
//
const promptSchema = {
  type: Joi.string()
    .valid('input', 'list', 'rawlist', 'checkbox', 'confirm', 'password')
    .required(),
  name: Joi.string()
    .min(3)
    .required(),
  message: Joi.string()
    .min(3)
    .required(),
  defaultVal: [Joi.string().allow(''), Joi.boolean()],
  choices: Joi.array()
    .items(Joi.string())
    .optional(),
  validate: Joi.func().optional(),
};
const createPrompts = function(
  type,
  name,
  message,
  defaultVal,
  choices,
  validate
) {
  const {error} = Joi.validate(
    {type, name, message, defaultVal, choices},
    promptSchema
  );
  if (error) {
    throw new Error(error);
  }
  let prompt = {
    type: type,
    name: name,
    message: message,
  };

  defaultVal && defaultVal !== '' ? (prompt['default'] = defaultVal) : null;
  choices && choices !== [] ? (prompt['choices'] = choices) : null;
  validate ? (prompt['validate'] = validate) : null;

  return prompt;
};

module.exports = {
  createVorpal: createVorpal,
  cp: createPrompts,
};
