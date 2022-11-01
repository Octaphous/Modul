const fs = require("fs");
const path = require("path");
const util = require("util");
const storage = require("./storage");
const { logger } = require("./logger");
const exec = util.promisify(require("child_process").exec);

const modulesDir = path.join(__dirname, `../${process.env.MODULE_DIR}`);

// Run all installed modules
async function init(client) {
    let modules = fs.readdirSync(modulesDir);
    for (mod of modules) {
        await require(path.join(modulesDir, mod)).init(client, logger, storage);
    }
}

async function install(repository) {
    let oldModules = fs.readdirSync(modulesDir);

    // Clone repo to module directory
    await exec(`git clone ${repository}`, { cwd: modulesDir });

    // Get path to new repo directory
    let newModules = fs.readdirSync(modulesDir);
    let newRepo = newModules.filter((mod) => !oldModules.includes(mod))[0];
    let moduleDir = path.join(modulesDir, newRepo);

    // Install module dependencies
    await exec(`npm install`, { cwd: moduleDir });

    await logger(`Installed module "${newRepo}" from repository ${repository}`);
}

async function uninstall(moduleName) {
    let modulePath = path.join(modulesDir, moduleName);

    if (fs.existsSync(modulePath)) {
        fs.rmSync(modulePath, { recursive: true, force: true });
    } else {
        throw new Error("Specified module doesn't exist");
    }

    await logger(`Uninstalled module "${moduleName}"`);
}

// Update module with git pull and npm install
async function update(moduleName) {
    let modulePath = path.join(modulesDir, moduleName);

    if (fs.existsSync(modulePath)) {
        await exec(`git pull`, { cwd: modulePath });
        await exec(`npm install`, { cwd: modulePath });
    } else {
        throw new Error("Specified module doesn't exist");
    }

    await logger(`Updated module "${moduleName}"`);
}

module.exports.init = init;
module.exports.install = install;
module.exports.uninstall = uninstall;
module.exports.update = update;
