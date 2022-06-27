const mongoose = require("mongoose");
const { upcomingVersion } = require("../static/staticData.json");

const schema = new mongoose.Schema({
    creationDate: {
        type: Date,
        required: true
    },

    createdBy: {
        type: String,
        required: true
    },

    modifyableBy: {
        type: [String],
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
        default: "DEFAULT"
    },

    embedFooter: {
        type: String || Date,
        default: "Wow. Pogers."
    },

    embedFields: {
        type: mongoose.Schema.Types.Mixed
    },

    embedThumbnail: {
        type: String,
        default: "https://64.media.tumblr.com/075acd26387c8cb20fc0cbcc7c9fda92/d900fba9b3ad6ca6-a1/s400x600/3abb446605eb43cd85fd4e38cac51635785e1b75.png"
    }
});

module.exports = mongoose.model("Reminder", schema, "Reminders");