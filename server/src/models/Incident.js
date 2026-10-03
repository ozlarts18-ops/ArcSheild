import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['NEAR_MISS', 'INCIDENT'],
    default: 'NEAR_MISS',
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  affectedUserId: {
    type: String,
    required: true,
    index: true
  },
  affectedUserName: {
    type: String,
    required: true
  },
  helmetId: {
    type: String,
    required: true
  },
  workshop: {
    type: String,
    default: 'Welding Bay 01'
  },
  status: {
    type: String,
    enum: ['REPORTED', 'INVESTIGATING', 'RESOLVED', 'CLOSED'],
    default: 'RESOLVED'
  },
  actionTaken: {
    type: String,
    default: ''
  },
  loggedBy: {
    type: String,
    default: 'Supervisor Desk'
  }
}, {
  timestamps: true
});

export const Incident = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);
export default Incident;
