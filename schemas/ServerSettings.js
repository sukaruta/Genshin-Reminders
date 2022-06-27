const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    guildName: {
        type: String,
        required: false
    },

    guildID: {
        type: String,
        required: false
    },

    ownerID: {
        type: String,
        required: false
    },

    settingsAccess: {
        type: [String],
        required: false,
    },

    prefix: {
        type: String,
        required: false,
        default: process.env.DEFAULT_PREFIX
    },

    updateCountDownChannel: {
        type: String,
        required: false
    },

    remindersChannel: {
        type: String,
        required: false
    },

    genshinAnnouncementsChannel: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model("ServerSettings", schema, "ServerSettings");