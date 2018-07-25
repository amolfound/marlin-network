const Joi = require('joi');

const _wrap = schema => item => {
  let {error, value} = Joi.validate(item, schema);
  if (error) {
    let {name, details} = error;
    process.stdout.write(`${name}: ${details[0].message}\n`);
  }
  return !error;
};

const isObject = _wrap(Joi.object());

const isAddress = _wrap(Joi.string().regex(/^0x[\da-fA-F]{40,40}$/));

const isIP = _wrap(
  Joi.string().regex(
    /^((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))*$/
  )
);

const isPort = _wrap(
  Joi.number()
    .integer()
    .min(0)
    .max(65535)
);

const isNumber = _wrap(Joi.number().min(0));

const isString = _wrap(Joi.string());

const isArrayOfStrings = _wrap(Joi.array().items(Joi.string()));

const isArrayOfObjects = _wrap(Joi.array().items(Joi.object()));

const BaseSchema = Joi.object()
  .keys({
    name: Joi.string(),
    Image: Joi.string(), // "postgres:9.4"
    Hostname: Joi.string(), // "db"
    User: Joi.string().default('root'),
    Labels: Joi.object(), // { "pro.marlin.type":"master" }
    Cmd: [Joi.string(), Joi.array().items(Joi.string())],
    Env: Joi.array().items(Joi.string()), // ["POSTGRES_USER=marlin", ...]
    ExposedPorts: Joi.object(), //  { "22/tcp": {} }, note that the keys have to be identical with Binds
    Entrypoint: [Joi.string(), Joi.array().items(Joi.string())],
    WorkingDir: Joi.string(),
    HostConfig: Joi.object().keys({
      Binds: Joi.array().items(Joi.string()), // "/my/local/dir:/container/dir"
      PortBindings: Joi.object(), // { '5432/tcp': [{ "HostPort": "5432" }] }
      Memory: Joi.number(), // in bytes
      CpuPercent: Joi.number()
        .min(0)
        .max(100),
      RestartPolicy: Joi.object().keys({
        Name: Joi.string().default('unless-stopped'),
      }),
      NetworkMode: Joi.string().default('bridge'),
    }),
    // additional
    AttachStdin: Joi.boolean().default(false),
    AttachStdout: Joi.boolean().default(false),
    AttachStderr: Joi.boolean().default(true),
    Tty: Joi.boolean().default(false),
    OpenStdin: Joi.boolean().default(false),
    StdinOnce: Joi.boolean().default(false),
  })
  .with('Image', 'Hostname')
  .without('Entrypoint', 'Cmd');

const ValidateSchema = item => {
  let {error, value} = Joi.validate(item, BaseSchema);
  if (error) {
    let {name, details} = error;
    process.stdout.write(`${name}: ${details[0].message}\n`);
    return false;
  }
  return value;
};

const configSchema = Joi.object().keys({
  db: Joi.object().keys({
    port: Joi.number()
      .integer()
      .min(0)
      .max(65535),
    password: Joi.string()
      .allow(null)
      .allow(''),
    host: Joi.string().allow(null),
    user: Joi.string().allow(null),
    database: Joi.string().allow(null),
    init: Joi.boolean(),
  }),
  geth: Joi.object().keys({
    port: Joi.number()
      .integer()
      .min(0)
      .max(65535),
    host: Joi.string().allow(null),
    password: Joi.string().allow(''),
    method: Joi.string(),
    init: Joi.boolean(),
  }),
  masters: Joi.array().items(
    Joi.object().keys({
      port: Joi.number()
        .integer()
        .min(0)
        .max(65535),
      name: Joi.string().allow(null),
      memInMB: Joi.number(),
      cpuPercent: Joi.number(),
      address: Joi.string().regex(/^0x[\da-fA-F]{40,40}$/),
      strategy: Joi.string().allow(null),
      db: Joi.string().allow(null),
      geth: Joi.string().allow(null),
      init: Joi.boolean(),
      zone: Joi.string().allow(null),
      bandwidth: Joi.string().allow(null),
      storageLimit: Joi.string().allow(null),
      storagePath: Joi.string().allow(null),
      relays: Joi.array().items(Joi.object()),
    })
  ),
  relays: Joi.array().items(
    Joi.object().keys({
      port: Joi.number()
        .integer()
        .min(0)
        .max(65535),
      name: Joi.string().allow(null),
      memInMB: Joi.number(),
      cpuPercent: Joi.number(),
      address: Joi.string().regex(/^0x[\da-fA-F]{40,40}$/),
      masterIP: Joi.string().allow(null),
      db: Joi.string().allow(null),
      geth: Joi.string().allow(null),
      init: Joi.boolean(),
      master: Joi.string().allow(null),
      zone: Joi.string().allow(null),
      slice: Joi.string().allow(null),
      unit: Joi.string().allow(null),
      bandwidth: Joi.string().allow(null),
      storageLimit: Joi.string().allow(null),
      storagePath: Joi.string().allow(null),
    })
  ),
  publishers: Joi.array().items(
    Joi.object().keys({
      port: Joi.number()
        .integer()
        .min(0)
        .max(65535),
      name: Joi.string().allow(null),
      address: Joi.string().regex(/^0x[\da-fA-F]{40,40}$/),
      db: Joi.string().allow(null),
      geth: Joi.string().allow(null),
      init: Joi.boolean(),
      publishedContent: Joi.array(),
      contractsAddresses: Joi.array(),
    })
  ),
  mode: Joi.string(),
  lastUpdate: Joi.date(),
  clusterStarted: Joi.boolean().allow(null),
  marlinDir: Joi.string().allow(null),
  account: Joi.object().keys({
    username: Joi.string().allow(''),
    address: Joi.string().regex(/^0x[\da-fA-F]{40,40}$/),
    amount: [Joi.string(), Joi.number()],
  }),
  bootstrap: Joi.object(),
});

const isConfig = _wrap(configSchema);

module.exports = {
  isObject,
  isAddress,
  isIP,
  isPort,
  isString,
  isNumber,
  isArrayOfStrings,
  isArrayOfObjects,
  ValidateSchema,
  isConfig,
};
