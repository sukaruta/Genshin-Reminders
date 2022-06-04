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

    maintenanceStart: { type: Date },

    maintenanceEnd: { type: Date },

    description: {
        type: String,
        default: upcomingVersion.description
    },

    changelog: {
        type: [String],
        default: upcomingVersion.changelog
    }

});

module.exports = mongoose.model("UpcomingUpdate", schema, "UpcomingUpdates");