import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;
let connectionError = null;

const isProduction = process.env.NODE_ENV === 'production';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    if (isProduction) {
      connectionError = 'MONGODB_URI environment variable is missing.';
      console.error('[MongoDB Atlas][CRITICAL] Production requires MONGODB_URI to be configured.');
    } else {
      console.warn('[MongoDB] Warning: MONGODB_URI not configured in development environment.');
      console.log('[ArcShield] Running in development resilient in-memory datastore mode.');
    }
    return false;
  }

  try {
    const options = {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 25,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority'
    };

    const conn = await mongoose.connect(mongoUri, options);
    isConnected = true;
    connectionError = null;
    
    // Mask sensitive connection details for safe logging
    const host = conn.connection.host || 'Atlas Cluster';
    console.log(`[MongoDB Atlas] Connected securely to cluster (${host}) with TLS/SSL enabled.`);

    mongoose.connection.on('error', (err) => {
      connectionError = err.message;
      console.error(`[MongoDB] Runtime error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Connection lost. Attempting auto-reconnect...');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Connection re-established.');
      isConnected = true;
      connectionError = null;
    });

    return true;
  } catch (error) {
    connectionError = error.message;
    if (isProduction) {
      console.error(`[MongoDB Atlas][CRITICAL] Connection failed: ${error.message}`);
    } else {
      console.warn(`[MongoDB] Atlas connection failed (${error.message}).`);
      console.log(`[ArcShield] Falling back to development resilient in-memory operational datastore.`);
    }
    return false;
  }
};

export const getDBStatus = () => {
  const dbConnected = isConnected && mongoose.connection.readyState === 1;
  return {
    connected: dbConnected,
    readyState: mongoose.connection.readyState,
    status: dbConnected ? 'Connected (MongoDB Atlas)' : isProduction ? `Disconnected (${connectionError || 'MONGODB_URI Missing'})` : 'Development In-Memory Store'
  };
};

export default connectDB;
