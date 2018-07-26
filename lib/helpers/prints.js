const clear = require('clear');
const chalk = require('vorpal')().chalk;

//
// ─── FORMATTING HELPERS ─────────────────────────────────────────────────────────
//
const error = chalk.red.bold;
const em = chalk.bold;
const item = (label, desc) => `${em(`⧆ ${label}:`)} ${desc}`;

const header = text => lowLine + em(text) + highLine;
const underline = text => text + '¯'.repeat(text.length) + '\n';
//
// ─── PATTERNS ───────────────────────────────────────────────────────────────────
//
const logoFull = `
            ::: ::::     :::     :::::::::  :::        ::::::::::: ::::    ::: 
          :+: :+::+:   :+: :+:   :+:    :+: :+:            :+:     :+:+:   :+: 
        +:+ +:+  +:+  +:+   +:+  +:+    +:+ +:+            +:+     :+:+:+  +:+ 
      +#+ +#+    +#+ +#++:++#++: +#++:++#:  +#+            +#+     +#+ +:+ +#+ 
    +#+ +#+      +#+ +#+     +#+ +#+    +#+ +#+            +#+     +#+  +#+#+# 
  #+# #+#        #+# #+#     #+# #+#    #+# #+#            #+#     #+#   #+#+# 
### ###          ### ###     ### ###    ### ########## ########### ###    ####`;
const logo = `
            ::: ::::
          :+: :+::+:
        +:+ +:+  +:+
      +#+ +#+    +#+
    +#+ +#+      +#+
  #+# #+#        #+#
### ###          ###
`;
const seperator = `
________ ________ ________ ________ ________ ________ ________ ________ ________
"""""""" """""""" """""""" """""""" """""""" """""""" """""""" """""""" """"""""`;

const lowLine =
  '\n________________________________________________________________________________\n';
const highLine =
  '\n¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\n';
// ────────────────────────────────────────────────────────────────────────────────

//
// ─── FORMATTED TEXTS ────────────────────────────────────────────────────────────
//
const marlin = chalk.blue.bold('Marlin');
// print welcome message at start
const welcome = function() {
  clear();
  console.log(
    chalk.cyan(seperator),
    chalk.blue(logoFull),
    chalk.cyan(seperator)
  );
};
// print overview
const overview = function() {
  console.log(`Welcome to ${marlin}. With this tool you can:`);
  console.log(
    `${chalk.bold('⧆ Join Marlin')}: init, account
${chalk.bold('⧆ Run Nodes')}: init, start, restart, stop, manage
${chalk.bold('⧆ Use Marlin')}: fetch, publish`,
    `\nType ${chalk.bold('help')} for more details.\n`
  );
};

module.exports = {
  welcome,
  overview,
  marlin,
  error,
  em,
  item,
  seperator,
  header,
  underline,
};
