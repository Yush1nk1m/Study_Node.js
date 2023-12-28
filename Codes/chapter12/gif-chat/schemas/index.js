const mongoose = require("mongoose");
const { MONGO_ID, MONGO_PASSWORD, NODE_ENV } = process.env;
const MONGO_URL = `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@localhost:27017/admin`;

const connect = () => {
    if (NODE_ENV !== "production") {
        mongoose.set("debug", true);
    }

    mongoose.connect(MONGO_URL, {
        dbName: "gifchat",
        useNewUrlParser: true,
    }).then(() => {
        console.log("MongoDB connected.");
    }).catch((err) => {
        console.error("MongoDB connection error:", err);
    });
};

mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
});

mongoose.connection.on("disconnected", () => {
    console.error("MongoDB disconnected. Try to connect again.");
    connect();
});

module.exports = connect;