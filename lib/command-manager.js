const { logger } = require("./logger");
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const moduleChoices = getModuleChoices();

let commands = [
    {
        name: "install-module",
        default_member_permissions: 0,
        description: "Install module from git repository",
        options: [
            {
                name: "module-repository",
                type: 3,
                description: "Git repository for the module",
                required: true,
            },
        ],
    },
    {
        name: "uninstall-module",
        default_member_permissions: 0,
        description: "Nuke module from orbit",
        options: [
            {
                name: "module-name",
                type: 3,
                description: "Name of module to uninstall",
                required: true,
                choices: moduleChoices,
            },
        ],
    },
    {
        name: "update-module",
        default_member_permissions: 0,
        description: "Perform pull request on module repo",
        options: [
            {
                name: "module-name",
                type: 3,
                description: "Name of module to update",
                required: true,
                choices: moduleChoices,
            },
        ],
    },
];

// Generate command choices from installed modules
function getModuleChoices() {
    let moduleDir = path.join(__dirname, `../${process.env.MODULE_DIR}`);
    let modules = fs.readdirSync(moduleDir);

    return modules.map((moduleName) => ({
        name: moduleName,
        value: moduleName,
    }));
}

// Apply Commands
async function applyCommands(guild) {
    // Load all module commands
    let modulesDir = path.join(__dirname, `../${process.env.MODULE_DIR}`);
    let modules = fs.readdirSync(modulesDir);
    for (mod of modules) {
        let cmds = require(path.join(modulesDir, mod)).commands;
        commands = commands.concat(cmds);
    }

    let restClient = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

    let clientID = guild.client.user.id;
    let guildID = guild.id;

    try {
        logger(`Applying commands on guild "${guild.name}"...`);
        await restClient.put(Routes.applicationGuildCommands(clientID, guildID), { body: commands });
    } catch (error) {
        logger(`Error initializing commands: ${error}`);
    }
}

module.exports.applyCommands = applyCommands;
