import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { SECURITY_CONFIG } from '../config/security.js';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER',
    index: true
  },
  trade: {
    type: String,
    default: 'Welding & Fabrication'
  },
  workshop: {
    type: String,
    default: 'Welding Bay 01'
  },
  assignedHelmetId: {
    type: String,
    default: 'ARC-001'
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Password verification helper method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static helper to hash password
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(SECURITY_CONFIG.BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

// Safe DTO serialization (never expose passwordHash or internal fields)
userSchema.methods.toSafeObject = function () {
  return {
    id: this.userId,
    name: this.name,
    email: this.email,
    role: this.role,
    trade: this.trade,
    workshop: this.workshop,
    assignedHelmetId: this.assignedHelmetId,
    phoneNumber: this.phoneNumber,
    createdAt: this.createdAt
  };
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
