const fs = require("fs");
const path = require("path");
const { logger } = require("./logger");

const storagePath = path.join(__dirname, `../${process.env.STORAGE}`);
let storage = {};

load();

module.exports.retrieve = function (key) {
    return storage[key];
};

module.exports.store = function (key, value) {
    storage[key] = value;
    save();
};

function load() {
    if (fs.existsSync(storagePath)) {
        storage = JSON.parse(fs.readFileSync(storagePath, "utf8"));
    } else {
        logger("Invalid storage path!");
    }
}

function save() {
    if (fs.existsSync(storagePath)) {
        let storageString = JSON.stringify(storage);
        fs.writeFileSync(storagePath, storageString, { encoding: "utf8" });
    } else {
        logger("Invalid storage path!");
    }
}
