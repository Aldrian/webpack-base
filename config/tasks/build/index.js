require("colors");
const { logStart, logDone } = require("../../_common/helpers/logs-helper");
const { execSync } = require("@solid-js/cli");
const { clean } = require("../clean");
const { prebuild } = require("../prebuild");
const { sprites } = require("../sprites");

// ----------------------------------------------------------------------------- PRIVATE

/**
 * Start webpack dev server
 * @returns {Promise<void>}
 * @private
 */
const _build = async () => {
  logStart("Start dev server", false);
  // start webpack
  await execSync(
    "cross-env webpack -p --config config/webpack/webpack.production.js",
    3
  );
  logDone({});
};

// ----------------------------------------------------------------------------- PUBLIC

/**
 * Init Start
 * @returns {Promise<unknown>}
 */
const build = () =>
  new Promise(async resolve => {
    // clean folder
    await clean();
    // start prebuid
    await prebuild();
    // compile sprites
    await sprites();

    // start dev server
    await _build();
    // end
    resolve();
  });

module.exports = { build };