import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('[MongoDB] Warning: MONGODB_URI not configured in environment.');
    console.log('[ArcShield] Running in resilient in-memory datastore mode with auto-sync.');
    return false;
  }

  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority'
    };

    const conn = await mongoose.connect(mongoUri, options);
    isConnected = true;
    
    // Mask sensitive connection details for safe logging
    const host = conn.connection.host || 'Atlas Cluster';
    console.log(`[MongoDB Atlas] Connected securely to cluster (${host})`);

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Runtime error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Connection lost. Attempting auto-reconnect...');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Connection re-established.');
      isConnected = true;
    });

    return true;
  } catch (error) {
    console.warn(`[MongoDB] Atlas connection failed (${error.message}).`);
    console.log(`[ArcShield] Falling back to resilient in-memory operational datastore.`);
    return false;
  }
};

export const getDBStatus = () => {
  return {
    connected: isConnected && mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: isConnected ? mongoose.connection.host : 'In-Memory Store'
  };
};

export default connectDB;
