logChannel = null;

async function initLogger(client) {
    try {
        logChannel = await client.channels.fetch(process.env.LOG_CHANNEL);
    } catch (err) {
        console.error(`Log channel error: ${err}`);
    }
}

async function logger(message) {
    console.log(message);
    if (logChannel) await logChannel.send(message);
}

module.exports.logger = logger;
module.exports.initLogger = initLogger;
