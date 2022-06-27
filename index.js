console.time("Total elapsed time on initialization");
require("dotenv").config();

const fs = require("fs");
const { Client, Intents, Collection, Message } = require("discord.js");
const runAllReminders = require("./functions/runAllReminders");

const client = new Client({
    intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

client.commands = new Collection();
client.cooldowns = new Collection();

const commandFiles = fs.readdirSync("./commands/").filter(f => f.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.data.name, command);
        console.log(`| ✅ Command "${command.data.name}" read and loaded.`);
    }


fs.readdir('./events/', (err, files) => {
    if (err) return console.log(err);
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        const event = require(`./events/${file}`);
        const eventName = file.split('.')[0];
        client.on(eventName, event.bind(null, client));
        delete require.cache[require.resolve(`./events/${file}`)];
    });
});


(async () => {
    await require("./functions/mongodbConnection")();
    
    client.once("ready", _ => {
        runAllReminders.initalizeAllOngoingReminders(client);
        // require("./functions/genshinTweetsHandler")(client);
        console.log(`✅ Genshin Updates Discord bot logged in on "${client.user.username}#${client.user.discriminator}"`);
        console.timeEnd("Time elapsed on bot login");
        
    console.timeEnd("Total elapsed time on initialization");
});

console.time("Time elapsed on bot login");
client.login(process.env.DISCORD_TOKEN);
})();


