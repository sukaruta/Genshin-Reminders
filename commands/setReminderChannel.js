const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const ServerSettings = require("../schemas/ServerSettings");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("setreminderchannel")
            .setDescription("Tells the bot where reminders will be sent in."),

    cooldown: 10,
    whitelisted: true,
    async msgExecute(message, args) {
        if (!args[1]) {
            const serverSettings = await ServerSettings.findOne({ guildID: message.guild.id });

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Reminders Channel")
                        .setDescription(`
                        The reminders channel for this server is <#${ serverSettings.remindersChannel || "N/A" }>
                        `)
                ]
            });
        }

        const normalizedChannelID = normalizeChannelID(args[1]);
        if (!message.guild.channels.cache.has(normalizedChannelID)) return message.reply("This channel does not seem to exist!");

        if (message.guild.channels.cache.get(normalizedChannelID).type !== "GUILD_TEXT") 
            return message.reply("Please make sure that the channel you have selected is a text channel.");

        await ServerSettings.findOneAndUpdate({ guildID: message.guild.id }, { remindersChannel: parseInt(normalizedChannelID) });

        message.reply(`All outgoing reminders will now be sent in <#${normalizedChannelID}>`);

        return;

        function normalizeChannelID() {
            let regex = /[^A-Za-z0-9]+/gm;

            return args[1].replace(regex, "");
        }
    }

}