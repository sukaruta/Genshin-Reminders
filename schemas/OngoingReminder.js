const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    reminder: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    triggerDate: {
        type: Date,
        required: true
    },

    triggerOnChannel: {
        type: String,
        required: true
    },

    activatedBy: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("OngoingReminder", schema, "OngoingReminders");