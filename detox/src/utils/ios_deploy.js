const exec = require('../utils/exec');
const log = require('npmlog');

class IosDeploy {
  async _run(args) {
    log.verbose(`Running ios-deploy with args: ${args}`);
    return await exec.execWithRetriesAndLogs('ios-deploy', {args: args});
  }

  async uninstall(deviceId, bundleId) {
    await this._run(`-i ${deviceId} -9 -1 ${bundleId}`);
  }

  async install(deviceId, appPath) {
    await this._run(`-i ${deviceId} -b ${appPath}`);
  }

  async launch(deviceId, appPath, args) {
    await this._run(`-i ${deviceId} -b ${appPath} -m -L -a '${args.join(' ')}'`);
  }
}

module.exports = IosDeploy;