import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    default: 'Rahul Sharma'
  },
  helmetId: {
    type: String,
    required: true,
    index: true
  },
  workshop: {
    type: String,
    default: 'Welding Bay 01'
  },
  trade: {
    type: String,
    default: 'Welding'
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  endedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'TERMINATED'],
    default: 'ACTIVE',
    index: true
  },
  durationSeconds: {
    type: Number,
    default: 0
  },
  helmetWearPercentage: {
    type: Number,
    default: 100
  },
  timeWornSeconds: {
    type: Number,
    default: 0
  },
  timeRemovedSeconds: {
    type: Number,
    default: 0
  },
  removalCount: {
    type: Number,
    default: 0
  },
  warningCount: {
    type: Number,
    default: 0
  },
  nearMissCount: {
    type: Number,
    default: 0
  },
  incidentCount: {
    type: Number,
    default: 0
  },
  safetyStateSummary: {
    type: String,
    enum: ['SAFE', 'WARNING', 'CRITICAL'],
    default: 'SAFE'
  }
}, {
  timestamps: true,
  collection: 'sessions'
});

// Compound analytics indexes
sessionSchema.index({ userId: 1, startedAt: -1 });
sessionSchema.index({ helmetId: 1, startedAt: -1 });
sessionSchema.index({ status: 1, startedAt: -1 });

export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
export default Session;
