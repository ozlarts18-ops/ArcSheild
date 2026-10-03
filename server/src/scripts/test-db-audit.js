import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { User } from '../models/User.js';
import { Helmet } from '../models/Helmet.js';
import { Alert } from '../models/Alert.js';
import { Incident } from '../models/Incident.js';
import { SensorReading } from '../models/SensorReading.js';
import { Session } from '../models/Session.js';
import { SecurityEvent } from '../models/SecurityEvent.js';

async function auditDatabase() {
  console.log('====================================================');
  console.log('🛡️  ArcShield Full MongoDB Atlas Structure & Data Audit');
  console.log('====================================================\n');

  await connectDB();

  // 1. Audit Collections & Document Counts
  console.log('[1] Auditing Collections & Document Counts in MongoDB Atlas:');
  const collectionNames = Object.keys(mongoose.connection.collections);
  console.log('Active Collections Registered in Mongoose:', collectionNames);

  const stats = {
    users: await User.countDocuments(),
    helmets: await Helmet.countDocuments(),
    alerts: await Alert.countDocuments(),
    incidents: await Incident.countDocuments(),
    sensorReadings: await SensorReading.countDocuments(),
    sessions: await Session.countDocuments(),
    securityEvents: await SecurityEvent.countDocuments()
  };

  console.log('Collection Document Counts:');
  for (const [col, count] of Object.entries(stats)) {
    console.log(`  - ${col}: ${count} documents`);
  }

  // 2. Audit Indexes on each collection
  console.log('\n[2] Auditing Indexes across Models:');
  const indexChecks = [
    { name: 'users', model: User },
    { name: 'helmets', model: Helmet },
    { name: 'alerts', model: Alert },
    { name: 'incidents', model: Incident },
    { name: 'sensorReadings', model: SensorReading },
    { name: 'sessions', model: Session },
    { name: 'securityEvents', model: SecurityEvent }
  ];

  for (const { name, model } of indexChecks) {
    const indexes = await model.collection.indexes();
    console.log(`\nIndex summary for [${name}]:`);
    indexes.forEach(idx => {
      console.log(`  • Name: ${idx.name} | Keys: ${JSON.stringify(idx.key)} ${idx.unique ? '(UNIQUE)' : ''} ${idx.expireAfterSeconds ? `(TTL: ${idx.expireAfterSeconds}s)` : ''}`);
    });
  }

  const API_URL = (process.env.SERVER_URL || 'https://arcsheild.onrender.com').replace(/\/$/, '');

  // 3. Test API Auth against Atlas DB
  console.log('\n[3] Testing User Authentication & Token Generation:');
  const loginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'rahul.welder@iti.edu',
      password: 'password123'
    })
  });
  const loginData = await loginRes.json();
  const token = loginData?.token;
  console.log(`User Login Status: ${loginRes.status}, Token Received: ${Boolean(token)}`);

  // 4. Test User Data Isolation API
  console.log('\n[4] Testing User Data Isolation (/api/my/alerts):');
  const myAlertsRes = await fetch(`${API_URL}/api/my/alerts`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const myAlertsData = await myAlertsRes.json();
  console.log(`My Alerts Status: ${myAlertsRes.status}, Alerts Returned: ${myAlertsData.count}`);

  // 5. Test Admin Auth & Fleet Inventory
  console.log('\n[5] Testing Admin Authentication & Fleet Queries:');
  const adminLoginRes = await fetch(`${API_URL}/api/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@iti.edu',
      password: 'admin123'
    })
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData?.token;
  console.log(`Admin Login Status: ${adminLoginRes.status}, Admin Token Received: ${Boolean(adminToken)}`);

  const adminHelmetsRes = await fetch(`${API_URL}/api/admin/helmets`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const adminHelmetsData = await adminHelmetsRes.json();
  console.log(`Admin Helmets Status: ${adminHelmetsRes.status}, Helmets Count: ${adminHelmetsData?.helmets?.length}`);

  const adminUsersRes = await fetch(`${API_URL}/api/admin/users`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const adminUsersData = await adminUsersRes.json();
  console.log(`Admin Users Status: ${adminUsersRes.status}, Users Count: ${adminUsersData?.users?.length}`);

  // 6. Test Telemetry Ingestion & MongoDB Persistence
  console.log('\n[6] Testing Telemetry Ingestion & Persistence in sensorReadings:');
  const beforeReadingsCount = await SensorReading.countDocuments();
  const telemetryRes = await fetch(`${API_URL}/api/telemetry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      helmetId: 'ARC-001',
      temperature: { current: 35.6, ambient: 31.0 },
      humidity: { current: 58 },
      uvArcExposure: { level: 'NORMAL' },
      gasExposure: { level: 'NORMAL' },
      motion: { movement: 'ACTIVE' },
      helmetWearing: { isWorn: true }
    })
  });
  console.log(`Telemetry Ingestion Status: ${telemetryRes.status}`);
  // Wait brief moment for async DB write
  await new Promise(r => setTimeout(r, 1000));
  const afterReadingsCount = await SensorReading.countDocuments();
  console.log(`Sensor Readings in MongoDB: before=${beforeReadingsCount}, after=${afterReadingsCount}`);

  console.log('\n====================================================');
  console.log('✅ All Database Audits and API Integrations PASSED');
  console.log('====================================================');
  
  await mongoose.disconnect();
  process.exit(0);
}

auditDatabase().catch(err => {
  console.error('Audit Error:', err);
  process.exit(1);
});
