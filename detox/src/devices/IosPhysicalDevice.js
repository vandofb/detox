const Device = require('./Device');
const IosDeploy = require('../utils/ios_deploy');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const exec = require('child-process-promise').exec;
const argparse = require('../utils/argparse');

class IosPhysicalDevice extends Device {
  constructor(client, session, deviceConfig) {
    super(client, session, deviceConfig);

    this._iosDeploy = new IosDeploy();
  }

  async prepare() {
    this._bundleId = await this._getBundleIdFromApp(this._deviceConfig.binaryPath);
    await this.relaunchApp({delete: !argparse.getArgValue('reuse')});
  }

  async relaunchApp(params = {}, bundleId) {
    console.log("1 A");
    if (params.url && params.userNotification) {
      throw new Error(`detox can't understand this 'relaunchApp(${JSON.stringify(params)})' request, either request to launch with url or with userNotification, not both`);
    }

    if (params.delete) {
      console.log("1 B 1 A");
      await this._iosDeploy.uninstall(this._deviceConfig.deviceId, this._bundleId);
      console.log("1 B 1 B");
      await this._iosDeploy.install(this._deviceConfig.deviceId, this._getAppAbsolutePath(this._deviceConfig.binaryPath));
      console.log("1 B 1 C");
    } else {
      console.log("1 B 2");
      // Calling `relaunch` is not good as it seems `fbsimctl` does not forward env variables in this mode.
      await this._iosDeploy.terminate(this._deviceConfig.deviceId, this._bundleId);
    }
    console.log("1 C");

    let additionalLaunchArgs;
    if (params.url) {
      additionalLaunchArgs = {'-detoxURLOverride': params.url};
    } else if (params.userNotification) {
      additionalLaunchArgs = {'-detoxUserNotificationDataURL': this.createPushNotificationJson(params.userNotification)};
    }

    const _bundleId = bundleId || this._bundleId;
    console.log("1 D");
    await this._iosDeploy.launch(
      this._deviceConfig.deviceId,
      this._getAppAbsolutePath(this._deviceConfig.binaryPath),
      this._prepareLaunchArgs(additionalLaunchArgs)
    );
    console.log("1 E");
    await this.client.waitUntilReady();
  }

  async _getBundleIdFromApp(appPath) {
    const absPath = this._getAppAbsolutePath(appPath);
    try {
      const result = await exec(`/usr/libexec/PlistBuddy -c "Print CFBundleIdentifier" ${path.join(absPath, 'Info.plist')}`);
      return _.trim(result.stdout);
    } catch (ex) {
      throw new Error(`field CFBundleIdentifier not found inside Info.plist of app binary at ${absPath}`);
    }
  }

  _getAppAbsolutePath(appPath) {
    const absPath = path.join(process.cwd(), appPath);
    if (fs.existsSync(absPath)) {
      return absPath;
    } else {
      throw new Error(`app binary not found at ${absPath}, did you build it?`);
    }
  }

  async installApp(binaryPath) {
    console.log("IosPhysicalDevice::installApp()");
    if(!binaryPath) {
      binaryPath = this._getAppAbsolutePath(this._deviceConfig.binaryPath);
    }

    await this._iosDeploy.install(deviceConfig.deviceId, binaryPath);
  }

  async uninstallApp(bundleId) {
    const _bundleId = bundleId || this._bundleId;
    await this._iosDeploy.uninstall(this._deviceConfig.deviceId, bundleId);
  }
}

module.exports = IosPhysicalDevice;
