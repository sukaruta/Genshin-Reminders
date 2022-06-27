const ServerSettings = require("../schemas/ServerSettings");

module.exports = async (client, message) => {
    if (message.author.id === client.user.id) return;
    const serverSettings = await ServerSettings.find();

    for (let serverSetting of serverSettings) {

        if (serverSetting.genshinAnnouncementsChannel) {
            let channel = client.channels.cache.get(message.channel.id);
            if (!channel) {
                try {
                    channel = await client.channels.fetch(message.channel.id);
                } catch (err) {
                    console.log(`Failed to send Discord announcement to channel, ${err}`);
                }
            }


            channel.send({
                content: message.content,
                embeds: message.embeds.length > 0 ? message.embeds : [],
                attachments: message.attachments ? message.attachments : null
            });
        }
    }
}