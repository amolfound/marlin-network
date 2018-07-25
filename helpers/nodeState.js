'use strict';

const fsm = require('fsm-event');

module.exports = (self, logger) => {
  const s = fsm('uninitalized', {
    uninitalized: {
      init: 'initializing',
      initialized: 'stopped',
    },
    initializing: {
      initialized: 'stopped',
    },
    stopped: {
      start: 'starting',
    },
    starting: {
      started: 'running',
    },
    running: {
      stop: 'stopping',
    },
    stopping: {
      stopped: 'stopped',
    },
  });

  // log events
  s.on('error', err => logger.error(err));
  s.on('done', () => logger('-> ' + s._state));

  s.init = () => {
    s('init');
  };

  s.initialized = () => {
    s('initialized');
  };

  s.stop = () => {
    s('stop');
  };

  s.stopped = () => {
    s('stopped');
  };

  s.start = () => {
    s('start');
  };

  s.started = () => {
    s('started');
  };

  s.state = () => s._state;

  return s;
};
