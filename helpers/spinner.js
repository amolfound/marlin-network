const sprintf = require('util').format;

let spinners = [
  {
    frame: [
      '[    ]',
      '[=   ]',
      '[==  ]',
      '[=== ]',
      '[ ===]',
      '[  ==]',
      '[   =]',
      '[    ]',
      '[   =]',
      '[  ==]',
      '[ ===]',
      '[====]',
      '[=== ]',
      '[==  ]',
      '[=   ]',
    ],
    interval: 125,
  },
  {
    frame: ['▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸'],
    interval: 100,
  },
  {
    frame: [
      '( ●    )',
      '(  ●   )',
      '(   ●  )',
      '(    ● )',
      '(     ●)',
      '(    ● )',
      '(   ●  )',
      '(  ●   )',
      '( ●    )',
      '(●     )',
    ],
    interval: 150,
  },
  {frame: ['∙∙∙', '●∙∙', '∙●∙', '∙∙●', '∙∙∙'], interval: 200},
  {
    frame: ['┤', '┘', '┴', '└', '├', '┌', '┬', '┐'],
    interval: 100,
  },
  {
    frame: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    interval: 150,
  },
  {
    frame: ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'],
    interval: 200,
  },
  {frame: ['⢄', '⢂', '⢁', '⡁', '⡈', '⡐', '⡠'], interval: 150},
  {frame: ['.  ', '.. ', '...', '   '], interval: 300},
  {frame: ['☱', '☲', '☴'], interval: 300},
  {frame: ['-', '=', '≡'], interval: 300},
  {frame: [' ', '.', 'o', 'O', '@', '*', ' '], interval: 200},
  {frame: ['.', 'o', 'O', '°', 'O', 'o', '.'], interval: 200},
  {frame: ['▓', '▒', '░'], interval: 200},
  {frame: ['◢', '◣', '◤', '◥'], interval: 100},
  {frame: ['◡', '⊙', '◠'], interval: 200},
  {frame: ['◰', '◳', '◲', '◱'], interval: 100},
  {frame: ['◴', '◷', '◶', '◵'], interval: 100},
  {frame: ['■', '□', '▪', '▫'], interval: 200},
  {frame: ['◉', '◎'], interval: 200},
  {
    frame: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
    interval: 100,
  },
  {
    frame: ['⬆️ ', '↗️ ', '➡️ ', '↘️ ', '⬇️ ', '↙️ ', '⬅️ ', '↖️ '],
    interval: 100,
  },
  {frame: ['🌍 ', '🌎 ', '🌏 '], interval: 200},
  {frame: ['🚶 ', '🏃 '], interval: 200},
];

class Spinner {
  constructor(message, style, interval) {
    var spinnerMessage = message;
    var spinnerStyle = style;

    this.start = function() {
      var self = this;
      var spinner = spinnerStyle;

      if (!spinner || spinner.length === 0) {
        spinner =
          'win32' == process.platform
            ? ['|', '/', '-', '\\']
            : ['◜', '◠', '◝', '◞', '◡', '◟'];
      }

      function play(arr, interval) {
        var len = arr.length,
          i = 0;
        interval = interval || 100;

        var drawTick = function() {
          var str = arr[i++ % len];
          process.stdout.write(
            '\u001b[0G' + str + '\u001b[90m' + spinnerMessage + '\u001b[0m'
          );
        };

        self.timer = setInterval(drawTick, interval);
      }

      var frames = spinner.map(function(c) {
        return sprintf('  \u001b[96m%s ', c);
      });

      play(frames, interval);
    };

    this.message = function(message) {
      spinnerMessage = message;
    };

    this.stop = function() {
      process.stdout.write('\u001b[0G\u001b[2K');
      clearInterval(this.timer);
    };
  }
}

// usage:
// let s = spinner('Some message', 0, 150);
// s.start();
// // later
// s.stop();
module.exports = (message, index, interval) => {
  // validation of inputs
  if (!index || index < 0 || index > spinners.length - 1) {
    index = 0;
  }

  return new Spinner(
    message,
    spinners[index].frame,
    interval || spinners[index].interval
  );
};
