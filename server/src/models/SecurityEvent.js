import mongoose from 'mongoose';

const securityEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    index: true
    // e.g. LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, RBAC_VIOLATION, BRUTE_FORCE_BLOCKED, INCIDENT_LOGGED, ADMIN_ACCESS
  },
  userId: {
    type: String,
    default: null,
    index: true
  },
  role: {
    type: String,
    default: 'ANONYMOUS'
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  resource: {
    type: String,
    default: '/'
  },
  action: {
    type: String,
    default: 'API_REQUEST'
  },
  success: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

export const SecurityEvent = mongoose.models.SecurityEvent || mongoose.model('SecurityEvent', securityEventSchema);
export default SecurityEvent;
