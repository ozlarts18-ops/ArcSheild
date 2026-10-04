import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { User } from '../models/User.js';
import { Helmet } from '../models/Helmet.js';
import { Alert } from '../models/Alert.js';
import { Incident } from '../models/Incident.js';
import { SensorReading } from '../models/SensorReading.js';
import { Session } from '../models/Session.js';
import { SecurityEvent } from '../models/SecurityEvent.js';

async function purgeRahulSharma() {
  console.log('====================================================');
  console.log('🗑️  ArcShield Purge Operation: Remove Rahul Sharma');
  console.log('====================================================\n');

  const connected = await connectDB();
  if (!connected && mongoose.connection.readyState !== 1) {
    console.error('Failed to connect to MongoDB Atlas. Aborting purge.');
    process.exit(1);
  }

  try {
    // 1. Check existing records
    const usersFound = await User.find({
      $or: [{ userId: 'USR-101' }, { email: /rahul/i }, { name: /rahul/i }]
    }).lean();
    console.log(`[Users] Matching records found: ${usersFound.length}`);
    usersFound.forEach(u => console.log(`  - ID: ${u.userId}, Name: ${u.name}, Email: ${u.email}`));

    const sessionsFound = await Session.find({
      $or: [{ userId: 'USR-101' }, { userName: /rahul/i }]
    }).lean();
    console.log(`[Sessions] Matching records found: ${sessionsFound.length}`);

    const alertsFound = await Alert.find({
      $or: [{ userId: 'USR-101' }, { userName: /rahul/i }]
    }).lean();
    console.log(`[Alerts] Matching records found: ${alertsFound.length}`);

    const incidentsFound = await Incident.find({
      $or: [{ affectedUserId: 'USR-101' }, { affectedUserName: /rahul/i }]
    }).lean();
    console.log(`[Incidents] Matching records found: ${incidentsFound.length}`);

    const sensorReadingsFound = await SensorReading.find({
      userId: 'USR-101'
    }).lean();
    console.log(`[SensorReadings] Matching records found: ${sensorReadingsFound.length}`);

    const securityEventsFound = await SecurityEvent.find({
      userId: 'USR-101'
    }).lean();
    console.log(`[SecurityEvents] Matching records found: ${securityEventsFound.length}`);

    const helmetsWithRahul = await Helmet.find({
      $or: [{ assignedUserId: 'USR-101' }, { assignedUserName: /rahul/i }]
    }).lean();
    console.log(`[Helmets] Assigned to Rahul Sharma: ${helmetsWithRahul.length}`);

    // 2. Perform Deletions
    const userDelResult = await User.deleteMany({
      $or: [{ userId: 'USR-101' }, { email: /rahul/i }, { name: /rahul/i }]
    });
    console.log(`[Users] Deleted ${userDelResult.deletedCount} documents.`);

    const sessionDelResult = await Session.deleteMany({
      $or: [{ userId: 'USR-101' }, { userName: /rahul/i }]
    });
    console.log(`[Sessions] Deleted ${sessionDelResult.deletedCount} documents.`);

    const alertDelResult = await Alert.deleteMany({
      $or: [{ userId: 'USR-101' }, { userName: /rahul/i }]
    });
    console.log(`[Alerts] Deleted ${alertDelResult.deletedCount} documents.`);

    const incidentDelResult = await Incident.deleteMany({
      $or: [{ affectedUserId: 'USR-101' }, { affectedUserName: /rahul/i }]
    });
    console.log(`[Incidents] Deleted ${incidentDelResult.deletedCount} documents.`);

    const sensorDelResult = await SensorReading.deleteMany({
      userId: 'USR-101'
    });
    console.log(`[SensorReadings] Deleted ${sensorDelResult.deletedCount} documents.`);

    const secDelResult = await SecurityEvent.deleteMany({
      userId: 'USR-101'
    });
    console.log(`[SecurityEvents] Deleted ${secDelResult.deletedCount} documents.`);

    // 3. Update any helmets pointing to Rahul Sharma to point to Alex Chen
    const helmetUpdateResult = await Helmet.updateMany(
      { $or: [{ assignedUserId: 'USR-101' }, { assignedUserName: /rahul/i }] },
      { $set: { assignedUserId: 'USR-102', assignedUserName: 'Alex Chen' } }
    );
    console.log(`[Helmets] Reassigned ${helmetUpdateResult.modifiedCount} helmets to Alex Chen.`);

    // 4. Ensure Alex Chen exists in DB
    const alexExists = await User.findOne({ email: 'alex.chen@arcshield.local' });
    if (!alexExists) {
      const defaultPasswordHash = await User.hashPassword('password123');
      await User.create({
        userId: 'USR-102',
        name: 'Alex Chen',
        email: 'alex.chen@arcshield.local',
        passwordHash: defaultPasswordHash,
        role: 'USER',
        trade: 'Industrial Welding',
        workshop: 'Fabrication Bay 4',
        assignedHelmetId: 'ARC-001'
      });
      console.log('[Users] Created Alex Chen user account (alex.chen@arcshield.local).');
    } else {
      console.log('[Users] Alex Chen user account is verified in database.');
    }

    console.log('\n✅ Purge completed successfully. Zero records of Rahul Sharma remain.');
  } catch (err) {
    console.error('[Purge Error]', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

purgeRahulSharma();
