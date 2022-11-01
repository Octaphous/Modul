require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const { initLogger, logger } = require("./lib/logger");
const moduleManager = require("./lib/module-manager");
const commandManager = require("./lib/command-manager");

const allIntents = 65535;
const client = new Client({ intents: [allIntents] });

client.on("ready", async () => {
    await initLogger(client);

    await moduleManager.init(client);

    // Apply base commands on every guild
    for (let index = 0; index < client.guilds.cache.size; index++) {
        commandManager.applyCommands(client.guilds.cache.at(index));
    }

    logger(`${client.user.tag} started.`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
        switch (interaction.commandName) {
            case "install-module":
                await interaction.deferReply({ ephemeral: true });
                let repo = interaction.options.getString("module-repository");
                await moduleManager.install(repo);

                await interaction.editReply({ content: `Installation Successfull. Restarting...` });
                process.exit(0);

            case "uninstall-module":
                await interaction.deferReply({ ephemeral: true });
                let moduleToRemove = interaction.options.getString("module-name");
                await moduleManager.uninstall(moduleToRemove);

                await interaction.editReply({ content: `Uninstall Successfull. Restarting...` });
                process.exit(0);

            case "update-module":
                await interaction.deferReply({ ephemeral: true });
                let moduleToUpdate = interaction.options.getString("module-name");
                await moduleManager.update(moduleToUpdate);

                await interaction.editReply({ content: `Update Successfull. Restarting...` });
                process.exit(0);
        }
    } catch (err) {
        interaction.editReply({ content: `[Command Exception]: ${err}` });
        console.error(err);
    }
});

process.on("uncaughtException", function (err) {
    logger(`[UNCAUGHT EXCEPTION]\`\`\`${err.stack}\`\`\``);
});

client.login(process.env.BOT_TOKEN);
