import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  alertId: {
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
  type: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL'],
    default: 'WARNING',
    index: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'],
    default: 'ACTIVE',
    index: true
  },
  workshop: {
    type: String,
    default: 'Welding Bay 01'
  },
  acknowledgedBy: {
    type: String,
    default: null
  },
  acknowledgedAt: {
    type: Date,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'alerts'
});

alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ helmetId: 1, createdAt: -1 });
alertSchema.index({ status: 1, severity: 1 });

export const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
export default Alert;
