const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    guildName: {
        type: String,
        required: false
    },

    guildID: {
        type: Number,
        required: false
    },

    ownerID: {
        type: String,
        required: false
    },

    settingsAccess: {
        type: [Number],
        required: false,
    },

    prefix: {
        type: String,
        required: false,
        default: process.env.PREFIX
    },

    updateCountDownChannel: {
        type: String,
        required: false
    },

    remindersChannel: {
        type: String,
        required: false
    },

    updateNotificationsChannel: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model("ServerSettings", schema, "ServerSettings");