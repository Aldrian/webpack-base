const { prebuildAtoms } = require("../../tasks/atoms");
const { Files } = require("@zouloux/files");

// params
const PLUGIN_NAME = "less-to-js-plugin";
const log = require("debug")(`config:${PLUGIN_NAME}`);

/**
 * Less to JS Plugin
 * Allow to parse and transform Less variables to JS object.
 */
module.exports = class LessToJsPlugin {
  /**
   * Constructor
   * @param watcher: files string url to watch, accept glob
   * @param outputPath: output path
   * @param outputFilename: name of the output file
   */
  constructor({ watcher = "", outputPath = "", outputFilename = "" }) {
    this.watcher = watcher;
    this.outputPath = outputPath;
    this.outputFilename = outputFilename;
  }

  // ---------------------------–---------------------------–------------------- PRIVATE

  /**
   * Get compilation files changes names
   * @param pCompilation
   * @private
   */
  _getChangedFiles(pCompilation) {
    // get get changed times
    const changedTimes =
      pCompilation.watchFileSystem.watcher &&
      pCompilation.watchFileSystem.watcher.mtimes;
    // get changes files
    return Object.keys(changedTimes).map(file => file);
  }

  /**
   * Check if a file of glob list as changed
   * @param pCompilation
   * @returns {boolean}
   * @private
   */
  _fileAsChanged(pCompilation) {
    // check files to watch
    const glob = Files.getFiles(this.watcher);

    // check if is glob (glob.files.length > 0)
    if (glob.files && glob.files.length > 0) {
      // register file as change boolean
      return glob.files.some(globEl =>
        // check if a file of change file list match with one of glob files
        this._getChangedFiles(pCompilation).some(
          changeEl => changeEl === globEl
        )
      );
    } else return false;
  }

  /**
   * Check if output file exist
   * @param pOutputPath
   * @param pOutputFilename
   * @returns {boolean}
   * @private
   */
  _outputFileExist(
    pOutputPath = this.outputPath,
    pOutputFilename = this.outputFilename
  ) {
    return Files.getFiles(`${pOutputPath}/${pOutputFilename}`).files.length > 0;
  }

  // ---------------------------–---------------------------–------------------- PUBLIC

  /**
   * Apply
   * @param compiler
   */
  apply(compiler) {
    /**
     * The "beforeRun" hook runs only on single webpack build, triggering only once
     * (only for production build, not dev server)
     */
    compiler.hooks.beforeRun.tapAsync(PLUGIN_NAME, async compilation => {
      log(`Prebuild atoms...`);
      return await prebuildAtoms({});
    });

    /**
     * The "watchRun" hook runs only when using 'watch mode' with webpack
     * triggering every time that webpack recompiles on a change triggered by the watcher
     */
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, async compilation => {
      log({
        _outputFileExist: this._outputFileExist(),
        _fileAsChanged: this._fileAsChanged(compilation)
      });

      if (!this._outputFileExist() || this._fileAsChanged(compilation)) {
        // return prebuild
        log(`Prebuild atoms... `);
        return await prebuildAtoms({
          pOutputFilename: this.outputFilename
        });
      } else {
        log("Not prebluild, matches files doesn't changed");
      }
    });
  }
};
