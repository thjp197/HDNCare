import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on("connected", () => {
        console.log("DB connected");
    });

    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error('Missing MongoDB connection string (MONGODB_URI or MONGO_URI).');
    }

    await mongoose.connect(`${mongoUri}/booking`);
}

export default connectDB;