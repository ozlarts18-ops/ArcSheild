import mongoose from 'mongoose';

const helmetSchema = new mongoose.Schema({
  helmetId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  assignedUserId: {
    type: String,
    default: null,
    index: true
  },
  assignedUserName: {
    type: String,
    default: 'Unassigned'
  },
  trade: {
    type: String,
    default: 'Welding'
  },
  workshop: {
    type: String,
    default: 'Welding Bay 01'
  },
  zone: {
    type: String,
    default: 'Zone A'
  },
  safetyState: {
    type: String,
    enum: ['SAFE', 'WARNING', 'CRITICAL', 'OFFLINE'],
    default: 'SAFE'
  },
  connectionStatus: {
    type: String,
    enum: ['ONLINE', 'OFFLINE', 'SYNCING'],
    default: 'ONLINE'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'helmets'
});

helmetSchema.index({ connectionStatus: 1, safetyState: 1 });
helmetSchema.index({ assignedUserId: 1, lastSeen: -1 });

export const Helmet = mongoose.models.Helmet || mongoose.model('Helmet', helmetSchema);
export default Helmet;
