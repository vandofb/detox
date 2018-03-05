#!/usr/bin/env node
const fs = require("fs-extra");
const git = require("nodegit");
const versions = require("./versions");

// From https://gist.github.com/joerx/3296d972735adc5b4ec1
function clearRequireCache() {
  Object.keys(require.cache).forEach(function (key) {
    delete require.cache[key];
  });
}

const tempDir = fs.mkdtempSync('detox');
const sidebars = [];

(async function () {
  console.log("Cleanup versioned docs");
  await fs.emptyDir("./versioned_docs");
  await fs.emptyDir("./versioned_sidebars");

  console.log("Clone repository into tmp directory");
  const repo = await git.Clone("https://github.com/wix/detox.git", tempDir);

  await versions.map(async version => {
    console.log("Checking out version", version);
    await repo.checkoutBranch(version);

    console.log("Copy docs folder into versioned_docs");
    await fs.copy(`${tempDir}/docs`, `./versioned_docs/version-${version}`);


    console.log("Copy sidebar into versioned_sidebars");
    clearRequireCache();
    sidebars[version] = require(`./${tempDir}/website/sidebars`);

    sidebars[version][`version-${version}-docs`] = sidebars[version].docs;
    delete sidebars[version].docs;

    fs.writeFileSync(`./versioned_sidebars/version-${version}-sidebars.json`, JSON.stringify(sidebars[version]), "utf8");

    console.log("Cleanup temporary clone");
    await fs.remove(tempDir);
  })
})();

