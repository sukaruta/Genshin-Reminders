const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const ServerSettings = require("../schemas/ServerSettings");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("setcountdownchannel.")
            .setDescription("Tells the bot where the update countdown tracker will be sent in."),

    cooldown: 10,
    whitelisted: true,
    async msgExecute(message, args) {
        if (!args[1]) {
            const serverSettings = await ServerSettings.findOne({ guildID: message.guild.id });

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Update Countdown Tracker Channel")
                        .setDescription(`
                        The reminders channel for this server is <#${ serverSettings.updateCountDownChannel || "N/A" }>
                        `)
                ]
            });
        }

        const normalizedChannelID = normalizeChannelID(args[1]);
        if (!message.guild.channels.cache.has(normalizedChannelID)) return message.reply("This channel does not seem to exist!");

        if (message.guild.channels.cache.get(normalizedChannelID).type !== "GUILD_TEXT") 
            return message.reply("Please make sure that the channel you have selected is a text channel.");

        await ServerSettings.findOneAndUpdate({ guildID: message.guild.id }, { updateCountDownChannel: normalizedChannelID });

        message.reply(`The update countdown will <#${normalizedChannelID}>`);

        return;

        function normalizeChannelID() {
            let regex = /[^A-Za-z0-9]+/gm;

            return args[1].replace(regex, "");
        }
    }

}