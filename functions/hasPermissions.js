const ServerSettings = require("../schemas/ServerSettings");

module.exports = async (member) => {
    const serverSettings = await ServerSettings.findOne({ guildID: member.guild.id });

    if (member.id === serverSettings.ownerID) return true;

    for (let roleID of serverSettings.settingsAccess) {
        if (member.roles.cache.has(roleID.toString())) {
            return true;
        }
    }

    return false;
}