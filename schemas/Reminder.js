const mongoose = require("mongoose");
const { upcomingVersion } = require("../static/staticData.json");

const schema = new mongoose.Schema({
    guildName: {
        type: String,
        required: true
    },
    
    guildID: {
        type: Number,
        required: true
    },

    createdBy: {
        type: String,
        required: true
    },

    reminderDate: {
        type: Date,
        required: true
    },

    title: {
        type: String,
        default: "Reminder!"
    },

    description: {
        type: String,
        default: upcomingVersion.description
    },

    embedColor: {
        type: String,
        default: "BLUE"
    },

    embedFooter: {
        type: String,
        default: new Date().toLocaleDateString()
    },

    embedThumbnail: {
        type: String,
        default: "https://64.media.tumblr.com/075acd26387c8cb20fc0cbcc7c9fda92/d900fba9b3ad6ca6-a1/s400x600/3abb446605eb43cd85fd4e38cac51635785e1b75.png"
    }
});

module.exports = mongoose.model("Reminder", schema, "Reminders");