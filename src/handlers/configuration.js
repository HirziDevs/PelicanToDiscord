const cliColor = require("cli-color");
const yaml = require("js-yaml");
const fs = require("node:fs");

console.log(cliColor.cyanBright("[PelicanToDiscord] ") + cliColor.yellow("Loading configuration..."));

let config = yaml.load(fs.readFileSync("./config.yml", "utf8"));
if (fs.existsSync("config-dev.yml")) {
    console.log(cliColor.cyanBright("[PelicanToDiscord] ") + cliColor.yellow("Using development configuration..."));
    config = yaml.load(fs.readFileSync("./config-dev.yml", "utf8"));
}

if (config.version !== 1) {
    console.error('Config Error | Invalid config version! The config has been updated. Please get the new config format from: \n>> https://github.com/HirziDevs/PelicanToDiscord/blob/main/config.yml <<');
    process.exit();
}

console.log(cliColor.cyanBright("[PelicanToDiscord] ") + cliColor.yellow("Configuration loaded"));

module.exports = config;