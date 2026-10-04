import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Helmet } from '../models/Helmet.js';
import { Alert } from '../models/Alert.js';
import { Incident } from '../models/Incident.js';
import { SensorReading } from '../models/SensorReading.js';
import { Session } from '../models/Session.js';
import { SecurityEvent } from '../models/SecurityEvent.js';
import {
  INITIAL_HELMETS,
  INITIAL_ALERTS,
  INITIAL_INCIDENTS,
  INITIAL_WORKERS,
  ACTIVE_SESSION
} from './store.js';

/**
 * Safe, Non-Destructive Database Initialization Service.
 * - Ensures collections and indexes exist in MongoDB Atlas.
 * - Seeds initial entities ONLY if the database is completely empty (cold start).
 * - NEVER drops collections, deletes documents, or resets user data.
 */
export async function initializeDatabase() {
  if (mongoose.connection.readyState !== 1) {
    console.log('[DB Init] MongoDB not connected; skipping database initialization.');
    return false;
  }

  try {
    console.log('[DB Init] Synchronizing MongoDB Atlas collections and indexes...');

    // 1. Synchronize Indexes Safely across all Collections
    const models = [
      { name: 'User', model: User },
      { name: 'Helmet', model: Helmet },
      { name: 'Alert', model: Alert },
      { name: 'Incident', model: Incident },
      { name: 'SensorReading', model: SensorReading },
      { name: 'Session', model: Session },
      { name: 'SecurityEvent', model: SecurityEvent }
    ];

    for (const { name, model } of models) {
      try {
        await model.createIndexes();
      } catch (idxErr) {
        if (idxErr.code === 85 || idxErr.message.includes('IndexOptionsConflict') || idxErr.message.includes('same name')) {
          console.log(`[DB Init] Normalizing index options for ${name}...`);
          try {
            // Drop old conflicting non-TTL index on sensorReadings if needed
            if (name === 'SensorReading') {
              await model.collection.dropIndex('timestamp_1').catch(() => {});
            }
            await model.createIndexes();
          } catch (retryErr) {
            console.warn(`[DB Init] Notice on ${name} index: ${retryErr.message}`);
          }
        } else {
          console.warn(`[DB Init] Warning on ${name} indexes: ${idxErr.message}`);
        }
      }
    }

    console.log('[DB Init] Indexes verified and synced successfully.');

    // 2. Safe Cold-Start Entity Seeding (Only if collections are empty)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[DB Init] Seeding initial worker account...');
      const defaultPasswordHash = await User.hashPassword('password123');

      const initialUsers = [
        {
          userId: 'USR-102',
          name: 'Alex Chen',
          email: 'alex.chen@arcshield.local',
          passwordHash: defaultPasswordHash,
          role: 'USER',
          trade: 'Industrial Welding',
          workshop: 'Fabrication Bay 4',
          assignedHelmetId: 'ARC-001'
        }
      ];

      await User.insertMany(initialUsers);
      console.log(`[DB Init] Created ${initialUsers.length} seed user accounts.`);
    }

    const helmetCount = await Helmet.countDocuments();
    if (helmetCount === 0) {
      console.log('[DB Init] Seeding initial helmet records...');
      const helmetsToInsert = INITIAL_HELMETS.map(h => ({
        helmetId: h.id,
        assignedUserId: h.assignedWorkerId || 'USR-102',
        assignedUserName: h.assignedWorkerName || 'Alex Chen',
        trade: h.trade || 'Welding',
        workshop: h.workshopZone || 'Welding Bay 01',
        zone: h.workshopZone || 'Zone A',
        safetyState: h.safetyState || 'SAFE',
        connectionStatus: h.connectionStatus || 'ONLINE',
        lastSeen: new Date()
      }));
      await Helmet.insertMany(helmetsToInsert);
      console.log(`[DB Init] Created ${helmetsToInsert.length} helmet records.`);
    }

    const alertCount = await Alert.countDocuments();
    if (alertCount === 0) {
      console.log('[DB Init] Seeding initial alerts...');
      const alertsToInsert = INITIAL_ALERTS.map(a => ({
        alertId: a.id,
        userId: 'USR-102',
        userName: a.workerName || 'Alex Chen',
        helmetId: a.helmetId || 'ARC-001',
        type: a.type || 'THERMAL',
        severity: a.severity || 'WARNING',
        message: a.message || 'Thermal exposure warning',
        status: a.lifecycleStatus || 'ACTIVE',
        workshop: a.zone || 'Welding Bay 01'
      }));
      await Alert.insertMany(alertsToInsert);
      console.log(`[DB Init] Created ${alertsToInsert.length} initial alert records.`);
    }

    const incidentCount = await Incident.countDocuments();
    if (incidentCount === 0) {
      console.log('[DB Init] Seeding initial incidents...');
      const incidentsToInsert = INITIAL_INCIDENTS.map(i => ({
        incidentId: i.id,
        type: i.type || 'NEAR_MISS',
        title: i.title || 'Safety Near Miss',
        description: i.description || 'Pre-emptive safety warning triggered.',
        affectedUserId: i.affectedWorker?.id || 'USR-102',
        affectedUserName: i.workerName || i.affectedWorker?.name || 'Alex Chen',
        helmetId: i.helmetId || 'ARC-001',
        workshop: i.workshopZone || i.zone || 'Welding Bay 01',
        status: 'RESOLVED',
        actionTaken: i.supervisorAction || i.correctiveAction || 'Ventilation activated'
      }));
      await Incident.insertMany(incidentsToInsert);
      console.log(`[DB Init] Created ${incidentsToInsert.length} initial incident records.`);
    }

    const sessionCount = await Session.countDocuments();
    if (sessionCount === 0) {
      console.log('[DB Init] Seeding initial active session...');
      await Session.create({
        sessionId: ACTIVE_SESSION.id || 'SES-2026-001',
        userId: 'USR-102',
        userName: 'Alex Chen',
        helmetId: 'ARC-001',
        workshop: 'Fabrication Bay 4',
        trade: 'Industrial Welding',
        startedAt: new Date(Date.now() - 4 * 3600 * 1000),
        status: 'ACTIVE',
        durationSeconds: 16320,
        helmetWearPercentage: 98.2,
        timeWornSeconds: 16020,
        timeRemovedSeconds: 300,
        removalCount: 2,
        warningCount: 3,
        nearMissCount: 1,
        incidentCount: 0,
        safetyStateSummary: 'SAFE'
      });
      console.log('[DB Init] Created initial session record.');
    }

    console.log('[DB Init] Database initialization and verification completed cleanly.');
    return true;
  } catch (error) {
    console.error('[DB Init][ERROR] Database initialization error:', error.message);
    return false;
  }
}

export default initializeDatabase;
