const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const ServerSettings = require("../schemas/ServerSettings");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("serversettings")
            .setDescription("Allows you to modify the settings in how the bot behaves on your server."),
            
    cooldown: 10,
    aliases: ["guildSettings", "settings"],
    async msgExecute(message, args, client) {
        const serverSettings = await ServerSettings.findOne({ guildID: message.guild.id });
        
        message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Guild Settings")
                    .addFields(
                        { name: "Modify Settings Access", value: surrentSettings.settingsAccess.toString(), inline: true },
                        { name: "Prefix", value: surrentSettings.prefix, inline: true },
                    )
                    .setColor("BLUE")
                    .setTimestamp(new Date())
            ]
        })

        return;
    }
}