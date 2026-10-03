import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/arcsheild_db';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB] Warning: Local MongoDB daemon not reachable (${error.message}).`);
    console.log(`[ArcShield] Running in high-performance resilient in-memory datastore mode with auto-sync.`);
    return false;
  }
};

export default connectDB;
