require("colors")
const logs = require("../../helpers/logs-helper")
const { clean } = require("../clean")
const { prebuild } = require("../prebuild")

const _build = async () => {
  const webpack = require("webpack")
  const prodConfig = require("../../webpack/webpack.production")
  const compiler = webpack(prodConfig)

  logs.start("Start build")
  return new Promise((resolve, reject) => {
    // start webpack compiler
    compiler.run((err, stats) => {
      // if compiler error (err), or build error
      if (err || stats.hasErrors()) {
        logs.error("webpack build with error")
        reject(err)
      }

      stats.toJson("minimal")
      const log = stats.toString({
        chunks: false,
        all: false,
        assets: true,
        errors: true,
        warnings: true,
        colors: true,
        assetsSort: "size",
      })

      console.log(log)
      resolve(true)
    })
  })
}

const _buildDocker = async () => {
  const compose = require("docker-compose")
  const fs = require("fs")
  const util = require("util")
  const writeFile = util.promisify(fs.writeFile)
  const path = require("path")
  const appDir = path.dirname(require.main.filename)

  const projectName = require("../../../package.json").name
  const imageTag = process.env.CI_COMMIT_REF_SLUG || "prod"

  let configFile = `
  version: "3.8"
  services:`
  // Has client ?
  if (true) {
    configFile += `
    client:
      env_file:
        - .env.production
      environment:
        - NODE_ENV=production
      stdin_open: true
      image: ${projectName}-client:${imageTag}
      build:
        context: .
        dockerfile: Dockerfile.client.prod
    `
  }
  await writeFile(`${appDir}/../../docker-compose.yml`, configFile)
  return compose.buildAll({
    cwd: `${appDir}/../../`,
    log: true,
  })
}

/**
 * build task
 */
const build = async () => {
  clean()

  try {
    await prebuild()
    return await _build()
  } catch (e) {
    throw new Error("build task failed")
  }
}

const buildDocker = async () => {
  clean()

  try {
    return await _buildDocker()
  } catch (e) {
    throw new Error("build task failed")
  }
}

module.exports = { build, buildDocker }
