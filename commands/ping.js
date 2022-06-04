const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("ping")
            .setDescription("Displays the connection health of the bot client."),

    cooldown: 5,
    async msgExecute(message, _, client) {
        const responseMsg = await message.reply("🏓 Pong!");

        responseMsg.edit(`Client Ping: ${client.ws.ping}ms \n Websocket Ping: ${responseMsg.createdTimestamp - message.createdTimestamp}ms`);

        return;
    }
}