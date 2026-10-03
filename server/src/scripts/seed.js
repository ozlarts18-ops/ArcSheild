import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import initializeDatabase from '../services/dbInitService.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Centralized root .env loading
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

async function runSeed() {
  console.log('====================================================');
  console.log('🌱 ArcShield Development / Demo Database Seed Script');
  console.log('====================================================');
  console.log('[Notice] This script is intended strictly for development and manual demonstration.');

  const isConnected = await connectDB();
  if (!isConnected) {
    console.error('❌ Could not connect to MongoDB Atlas. Ensure MONGODB_URI is set in root .env.');
    process.exit(1);
  }

  await initializeDatabase();
  console.log('✅ Seed and index verification completed.');
  await mongoose.disconnect();
  console.log('🔌 Disconnected cleanly.');
  process.exit(0);
}

runSeed().catch(err => {
  console.error('❌ Seed Script Error:', err);
  process.exit(1);
});
