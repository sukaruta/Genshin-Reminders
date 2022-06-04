const ServerSettings = require("../schemas/ServerSettings");

module.exports = async (guild) => {
    await ServerSettings({
        guildName: guild.name,
        guildID: guild.id,
        ownerID: guild.ownerId
    }).save();

    return;
}