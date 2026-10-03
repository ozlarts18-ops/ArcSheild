import mongoose from 'mongoose';

const sensorReadingSchema = new mongoose.Schema({
  helmetId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    default: null,
    index: true
  },
  sessionId: {
    type: String,
    default: null,
    index: true
  },
  temperature: {
    objectC: { type: Number, default: 34.0 },
    ambientC: { type: Number, default: 30.0 },
    status: { type: String, enum: ['Normal', 'Elevated', 'Critical'], default: 'Normal' }
  },
  humidity: {
    relativePercent: { type: Number, default: 60.0 },
    status: { type: String, default: 'Normal' }
  },
  uvArcExposure: {
    status: { type: String, enum: ['NORMAL', 'ELEVATED', 'CRITICAL', 'ARC_DETECTED'], default: 'NORMAL' },
    levelDescription: { type: String, default: 'Normal' }
  },
  light: {
    lux: { type: Number, default: 400 },
    status: { type: String, default: 'Normal' }
  },
  gasExposure: {
    overallStatus: { type: String, enum: ['NORMAL', 'ELEVATED', 'HIGH', 'CRITICAL'], default: 'NORMAL' },
    combustionIndicator: { type: String, default: 'NORMAL' },
    airQualityIndicator: { type: String, default: 'NORMAL' },
    fumeIndicator: { type: String, default: 'NORMAL' },
    fuelGasIndicator: { type: String, default: 'NORMAL' }
  },
  motion: {
    motionState: { type: String, enum: ['NORMAL', 'ACTIVE', 'INACTIVE', 'IMPACT', 'FALL DETECTED'], default: 'NORMAL' },
    movement: { type: String, default: 'Stable' },
    fallDetected: { type: Boolean, default: false }
  },
  helmetWearing: {
    helmetWorn: { type: Boolean, default: true },
    state: { type: String, enum: ['WORN', 'REMOVED'], default: 'WORN' }
  },
  location: {
    zone: { type: String, default: 'Welding Bay 01' },
    gpsStatus: { type: String, default: 'Available (Fixed)' },
    coordinates: { type: String, default: '19.1238° N, 72.8361° E' }
  },
  safetyState: {
    type: String,
    enum: ['SAFE', 'WARNING', 'CRITICAL', 'OFFLINE'],
    default: 'SAFE',
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'sensorReadings'
});

// Compound time-series query indexes
sensorReadingSchema.index({ helmetId: 1, timestamp: -1 });
sensorReadingSchema.index({ userId: 1, timestamp: -1 });
sensorReadingSchema.index({ sessionId: 1, timestamp: -1 });

// TTL retention index: 30-day automated rolling expiration for high-frequency telemetry
sensorReadingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 3600, name: 'telemetry_retention_ttl' });

export const SensorReading = mongoose.models.SensorReading || mongoose.model('SensorReading', sensorReadingSchema);
export default SensorReading;
