const mongoose = require("mongoose");

module.exports = async () => {
    console.time("Time elapsed on database connection");
    await mongoose.connect(process.env.CLOUD_MONGODB_CONNECTION_STRING, {
        keepAlive: true,
        dbName: "GenshinUpdates"
    });

    console.log("✅ MongoDB Client connected.");
    console.timeEnd("Time elapsed on database connection");
}