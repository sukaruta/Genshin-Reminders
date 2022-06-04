const { SlashCommandBuilder } = require("@discordjs/builders");
const ServerSettings = require("../schemas/ServerSettings");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("setprefix")
            .setDescription("Sets up a custom prefix for your server."),
    
    cooldown: 10,
    whitelisted: true,
    async msgExecute(message, args) {
        
        if (!args[1]) {
            const serverSettings = await ServerSettings.findOne({ guildID: message.guild.id });
            return message.reply(`This server's prefix is \`${serverSettings.prefix}\``);
        } 
        
        if (args[1].length > 5) return message.reply("The character limit for prefixes is 5! Please make a shorter prefix.");

        await ServerSettings.findOneAndUpdate({ guildID: message.guild.id }, { prefix: args[1] });

        return message.reply(`This server's new prefix is \`${args[1]}\`. If you ever forget it just ping the bot.`);
    }
}
