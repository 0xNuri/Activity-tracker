const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect
        (`${process.env.DB_URL}`)

        console.log(`\n MongoDB connected..
            ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log("MongoDB connection failed", error);
        process.exit(1)
    }
}

module.exports = connectDB;