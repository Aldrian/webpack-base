const paths = require("./paths");

module.exports = {
  /**
   * Output Path
   * Where assets and bundle are build in production
   * (à voir si on doit faire la même chose pour le dev server)
   */
  outputPath: paths.static,

  /**
   * Generate an index.html from template /src/template.html
   */
  generateHtmlIndex: true,

  /**
   * On dev server
   * Use proxy allow to redirect /my/path/to/dist/ to localhost:3000
   * Usefull if we are not generate html index and we want to target
   * index.php for example
   */
  useProxy: true,


  /**
   * Clean outputfolder before every build
   */
  cleanOutputfolder: true,

};
