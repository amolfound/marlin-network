const clc = require('cli-color');
const sprintf = require('util').format;
const ansiTrim = require('cli-color/trim');
// Chainable wrapper for line content
const Line = function(defaultBuffer) {
  var lineContent = '';
  var self = this;
  self.defaultBuffer = defaultBuffer;

  // Put text in the line
  this.text = function(text, styles) {
    for (var styleNumber in styles) {
      text = styles[styleNumber](text);
    }
    lineContent += text;
    return self;
  };

  // Put padding in the line.
  this.padding = function(width, styles) {
    var padding = Array(width + 1).join(' ');
    for (var styleNumber in styles) {
      padding = styles[styleNumber](padding);
    }
    lineContent += padding;
    return self;
  };

  // Put padding in the line.
  this.column = function(text, columnWidth, textStyles) {
    var textWidth = ansiTrim(text).length;

    if (textWidth > columnWidth) {
      self.text(text.slice(0, columnWidth), textStyles);
    } else if (textWidth < columnWidth) {
      self.text(text, textStyles).padding(columnWidth - textWidth);
    } else {
      self.text(text, textStyles);
    }
    return self;
  };

  // Fill the rest of the width of the line with space.
  this.fill = function(styles) {
    var fillWidth = process.stdout.columns - ansiTrim(lineContent).length;
    if (fillWidth > 0) self.padding(fillWidth, styles);
    return self;
  };

  // Store a line in a line buffer to be output later.
  this.store = function(buffer) {
    if (typeof buffer == 'undefined') {
      if (typeof self.defaultBuffer == 'undefined')
        process.stderr.write(
          'Attempt to store a line in a line buffer, without providing a line buffer to store that line in.'
        );
      else self.defaultBuffer.addLine(self);
    } else {
      buffer.addLine(self);
    }
    return self;
  };

  // Output a line directly to the screen.
  this.output = function() {
    process.stdout.write(lineContent);
    return self;
  };

  // Return the contents
  this.contents = function() {
    return lineContent;
  };
};

// Make an ascii horizontal gauge
const Gauge = function(value, maxValue, width, type, suffix) {
  if (maxValue === 0) {
    return '[]';
  } else {
    var barLength = value ? Math.ceil((value / maxValue) * width) : 1;
    if (barLength > width) barLength = width;

    var barColor = clc.green;
    if (value > 0.8 * maxValue)
      barColor = type === 'resource' ? clc.red : clc.blue;

    return (
      '[' +
      barColor(Array(barLength).join('▓')) + // The filled portion
      Array(width + 1 - barLength).join('-') + // The empty portion
      '] ' +
      clc.blackBright(suffix)
    );
  }
};

const DynamicGuage = function(label, value, maxValue, type, unit) {
  let self = this;
  this.value = value;
  this.update = v => {
    this.value = v || this.value + 1;
    process.stdout.clearLine(); // clear current text
    process.stdout.cursorTo(0);
    this.render();
  };
  this.render = () =>
    new Line()
      .padding(2)
      .column(label, 20, [clc.cyan])
      .column(
        Gauge(
          (20 * this.value) / maxValue,
          20,
          20,
          type,
          `${this.value}/${maxValue}${unit}`
        ),
        40
      )
      .fill()
      .output();

  return self;
};

module.exports = DynamicGuage;
