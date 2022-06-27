const needle = require("needle");
const ServerSettings = require("../schemas/ServerSettings");

module.exports = async (client) => {
    const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
    const streamURL = "https://api.twitter.com/2/tweets/search/stream?expansions=author_id"

        // process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET process.env.ACCESS_TOKEN, process.env.ACCESS_TOKEN_SECRET
        await setStreamRules([{ value: "from:GenshinImpact" }]);

        streamTweets();

        
    async function getStreamRules() {
        const response = await needle("get", rulesURL, {
            headers: {
                Authorization: `Bearer ${process.env.BEARER_TOKEN}`
            }
        })

        return response.body; 
    }

    async function setStreamRules(rules) {
        const response = await needle('post', rulesURL, { add: rules }, {
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${process.env.BEARER_TOKEN}`
    
            }
        })

        return response.body;
    }

    async function streamTweets() {
        const stream = needle.get(streamURL, {
            headers: {
                Authorization: `Bearer ${process.env.BEARER_TOKEN}`
            }
        })

        stream.on('data', (data) => {
            try {
                const json = JSON.parse(data);

                const statusURL = `https://twitter.com/${json.includes.users[0].username}/status/${json.data.id}`;

                notifyDiscordChannels(statusURL);
            } catch (err) {}
        });
    }

    async function notifyDiscordChannels(statusURL) {
        const serverSettings = await ServerSettings.find();

        for (let serverSetting of serverSettings) {
            if (serverSetting.genshinAnnouncementsChannel) {
                const channel = await client.channels.fetch(serverSetting.genshinAnnouncementsChannel);

                if (channel) channel.send(statusURL);
            }
        }
    }
}