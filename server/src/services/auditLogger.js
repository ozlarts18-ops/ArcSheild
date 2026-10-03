import { SecurityEvent } from '../models/SecurityEvent.js';
import mongoose from 'mongoose';

// In-memory buffer for logs when DB is in memory mode
const inMemoryAuditBuffer = [];

export const auditLogger = {
  async logEvent({ eventType, userId = null, role = 'ANONYMOUS', ipAddress = '127.0.0.1', userAgent = 'Unknown', resource = '/', action = 'API_REQUEST', success = true, metadata = {} }) {
    const entry = {
      eventType,
      userId,
      role,
      ipAddress,
      userAgent: String(userAgent).substring(0, 200),
      resource: String(resource).substring(0, 200),
      action,
      success,
      metadata,
      timestamp: new Date()
    };

    try {
      if (mongoose.connection.readyState === 1) {
        await SecurityEvent.create(entry);
      } else {
        inMemoryAuditBuffer.push(entry);
        if (inMemoryAuditBuffer.length > 200) {
          inMemoryAuditBuffer.shift(); // keep bounded
        }
      }
    } catch (err) {
      console.warn(`[AuditLogger] Failed to persist event: ${err.message}`);
    }
  },

  getRecentLogs(limit = 20) {
    return inMemoryAuditBuffer.slice(-limit).reverse();
  }
};

export default auditLogger;
