const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const ServerSettings = require("../schemas/ServerSettings");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("serversettings")
            .setDescription("View all current settings on your server."),
            
    cooldown: 10,
    aliases: ["guildSettings", "settings"],
    async msgExecute(message) {

        const {
            prefix,
            settingsAccess, 
            remindersChannel, 
            updateCountdownChannel, 
            updateNotificationChannel

        } = await ServerSettings.findOne({ guildID: message.guild.id });
        
        message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Guild Settings")
                    .addFields(
                        { name: "Modify Settings Access (Server owner ignores any permission restrictions)", value: `${ await getRoleNameByIDs() || "Server owner."}`, inline: true },
                        { name: "Prefix", value: prefix, inline: true },
                        { name: "Reminders channel", value:  `${ await getChannelNameByID(remindersChannel) || "N/A"}`, inline: true },
                        { name: "Update countdown channel", value: `${ await getChannelNameByID(updateCountdownChannel) || "N/A"}`, inline: true },
                        { name: "Update notification channel", value: `${await getChannelNameByID(updateNotificationChannel) || "N/A"}`, inline: true }
                    )
                    .setColor("BLUE")
                    .setTimestamp(new Date())
            ]
        })

        return;

        async function getRoleNameByIDs() {
            if (!settingsAccess) return null;

            let roleNames = [];

            for (let r of settingsAccess) {
                console.log(r);

                const role = await message.guild.roles.fetch(r);
                console.log(role);

                roleNames.push(`@${ role ? role.name : r.toString()}`);
            }

            return roleNames.map(role => `${role},\n`).join();
        }

        async function getChannelNameByID(channelID) {
            if (!channelID) return null;

            console.log(channelID)

            const channel = await message.guild.channels.fetch("796677623879172109");

            console.log(channel);

            return `#${channel.name || channelID}`;
        }
    }
}