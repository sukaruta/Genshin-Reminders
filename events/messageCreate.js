const { Collection } = require('discord.js');
const createInitialGuildData = require("../functions/createInitialGuildData");
const hasPermissions = require('../functions/hasPermissions');
const ServerSettings = require("../schemas/ServerSettings");
const genshinDiscordHandler = require("../functions/genshinDiscordHandler");


module.exports = async (client, message) => {
    if (message.channel.id === "990966325633499147") return genshinDiscordHandler(client, message);

    if (message.author.bot) return;
    if (!await ServerSettings.exists({guildID: message.guild.id})) await createInitialGuildData(message.guild);

    const { prefix } = await ServerSettings.findOne({ guildID: message.guild.id });

    if (message.content === `<@${client.user.id}>`) return message.reply(`This server's prefix is \`${prefix}\``);

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.substring(prefix.length).split(' ');
    const command = client.commands.get(args[0]) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));

    if (!command) return;

    if (!client.cooldowns.has(command.name)) {
        client.cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();

    const timestamps = client.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 0) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationDate = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationDate) {
            const timeLeft = (expirationDate - now) / 1000;
            let timeMeasurement = 'seconds';
            if (timeLeft.toFixed(1) <= 1.0) {
                timeMeasurement = 'second';
            }
            return message.reply(`Please wait ${timeLeft.toFixed(1)} ${timeMeasurement} before reusing this command!`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    if (command.whitelisted) await hasPermissions(message.member);

    try {
        command.msgExecute(message, args, client);
    } catch (error) {
        console.log(error);
    }
}