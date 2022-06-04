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
        type: Number,
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
        type: Number,
        required: false
    },

    remindersChannel: {
        type: Number,
        required: false
    },

    updateRemindersChannel: {
        type: Number,
        required: false
    }
});

module.exports = mongoose.model("ServerSettings", schema, "ServerSettings");