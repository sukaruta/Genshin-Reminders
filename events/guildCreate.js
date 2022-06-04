const createInitialGuildData = require("../functions/createInitialGuildData");


module.exports = async (_, guild) => {
    console.log(`Bot joined guild named: ${guild.name} with guild ID: ${guild.id}`);
    await createInitialGuildData(guild);

    return;
}