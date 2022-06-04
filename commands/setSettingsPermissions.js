const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const ServerSettings = require("../schemas/ServerSettings");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("setsettingspermissions")
            .setDescription("Add or remove roles that can modify and access this bot's settings."),

    cooldown: 10,
    whitelisted: true,
    async msgExecute(messasge, args) {
        const serverSettings = await ServerSettings.findOne({ guildID: messasge.guild.id });

        switch (args[1]) {
            case "add":
                grantRolePermissions();
                break;
            case "remove":
                revokeRolePermissions();
                break;
            default:
                
                return messasge.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Roles with settings modify permissions")
                            .addField("Roles", `${serverSettings.settingsAccess.map(r => `<@&${r}>,\n`).toString() || 'N/A'}` )
                            .setTimestamp(new Date())
                    ]
                })
        }

        async function grantRolePermissions() {
            args.shift();
            args.shift();

            const normalizedRoleIDs = normalizeRoleIDs(args);

            if (normalizedRoleIDs.roleArray.length !== 0) {
                let rolesToPush = [];

                for (let roleID of normalizedRoleIDs.roleArray) {
                    if (roleID && !serverSettings.settingsAccess.includes(parseInt(roleID))) rolesToPush.push(roleID);
                }

                await ServerSettings.findOneAndUpdate({ guildID: messasge.guild.id }, { settingsAccess: rolesToPush });
            }

            return messasge.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle(`${normalizedRoleIDs.roleArray.length} / ${args.length} roles whitelisted to permissions.`)
                        .setDescription(`Failed to add ${normalizedRoleIDs.invalidRoles.length} role(s) since they either cannot be validated as real roles or they are already whitelisted.`)
                ]
            });

        }

        async function revokeRolePermissions() {
            args.shift();
            args.shift();

            const normalizedRoleIDs = normalizeRoleIDs(args);
            let rolesToSplice = serverSettings.settingsAccess;

            for (let roleID of normalizedRoleIDs.roleArray) {
                if (serverSettings.settingsAccess.includes(roleID)) rolesToSplice.splice(rolesToSplice.indexOf(roleID), 1);
                
            }
            await ServerSettings.findOneAndUpdate({ guildID: messasge.guild.id }, { settingsAccess: rolesToSplice });

            return messasge.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle(`${normalizedRoleIDs.roleArray.length} / ${args.length} roles blacklisted to permissions.`)
                    .setDescription(`Failed to remove ${normalizedRoleIDs.invalidRoles.length} role(s) since they either cannot be validated as real roles or they are already blacklisted.`)
                ]
            });
        }

        function normalizeRoleIDs(arguments) {
            let roleArray = [];
            let invalidRoles = [];

            for (let role of arguments) {
                const normalizedID = role.replace(/[^A-Za-z0-9]+/gm, "");

            
                if (messasge.guild.roles.cache.has(normalizedID)) {
                    roleArray.push(parseInt(normalizedID));
                } else invalidRoles.push(parseInt(normalizedID));
            }

            return { roleArray, invalidRoles };
        }
    }
}