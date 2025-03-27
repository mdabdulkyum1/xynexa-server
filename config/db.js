
import mongoose from 'mongoose';

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        console.error(" --- ## --- MONGODB_URI is not set in env --- ## ---");
        process.exit(1);
    }
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

export default connectDB;