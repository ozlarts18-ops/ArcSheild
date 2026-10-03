import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { SECURITY_CONFIG } from '../config/security.js';
import { redisService } from './redisService.js';
import { auditLogger } from './auditLogger.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

// In-memory credential store when DB is in fallback mode
const inMemoryUsers = [
  {
    id: 'USR-101',
    name: 'Rahul Sharma',
    email: 'rahul.welder@iti.edu',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'USER',
    trade: 'Welding',
    workshop: 'Welding Bay 01',
    assignedHelmetId: 'ARC-001'
  },
  {
    id: 'USR-102',
    name: 'Alex Chen',
    email: 'alex.chen@arcshield.local',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'USER',
    trade: 'Industrial Welding',
    workshop: 'Fabrication Bay 4',
    assignedHelmetId: 'ARC-001'
  },
  {
    id: 'ADM-001',
    name: 'O. Sharma',
    email: 'admin@iti.edu',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'ADMIN',
    trade: 'Directorate Lead',
    workshop: 'Control Center',
    assignedHelmetId: 'N/A'
  },
  {
    id: 'ADM-002',
    name: 'Supervisor Sarah',
    email: 'admin@arcshield.local',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'ADMIN',
    trade: 'Chief Safety Officer',
    workshop: 'Central Monitoring Room',
    assignedHelmetId: 'N/A'
  }
];

export const authService = {
  /**
   * Generate signed Access Token
   */
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id || user.userId,
        email: user.email,
        role: user.role,
        name: user.name,
        assignedHelmetId: user.assignedHelmetId || 'ARC-001'
      },
      SECURITY_CONFIG.JWT_SECRET,
      { expiresIn: SECURITY_CONFIG.ACCESS_TOKEN_EXPIRES }
    );
  },

  /**
   * Generate signed Refresh Token
   */
  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user.id || user.userId,
        role: user.role
      },
      SECURITY_CONFIG.JWT_REFRESH_SECRET,
      { expiresIn: SECURITY_CONFIG.REFRESH_TOKEN_EXPIRES }
    );
  },

  /**
   * Authenticate a normal worker
   */
  async authenticateUser(email, password, ip = '127.0.0.1', userAgent = 'Unknown') {
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    // 1. Check brute force throttle in Redis
    const lockStatus = await redisService.checkBruteForceLockout(ip, normalizedEmail);
    if (lockStatus.locked) {
      await auditLogger.logEvent({
        eventType: 'BRUTE_FORCE_BLOCKED',
        role: 'USER',
        ipAddress: ip,
        userAgent,
        resource: '/api/auth/login',
        action: 'POST',
        success: false,
        metadata: { email: normalizedEmail, attempts: lockStatus.attempts }
      });

      return {
        success: false,
        status: 429,
        message: lockStatus.message
      };
    }

    if (lockStatus.delayMs > 0) {
      await new Promise(r => setTimeout(r, lockStatus.delayMs));
    }

    let user = null;
    let isPasswordValid = false;

    // 2. Query user from MongoDB if connected, else check fallback store
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: normalizedEmail, role: 'USER' });
      if (user) {
        isPasswordValid = await user.comparePassword(password);
      }
    } else {
      user = inMemoryUsers.find(u => u.email === normalizedEmail && u.role === 'USER');
      if (user) {
        isPasswordValid = await bcrypt.compare(password, user.passwordHash).catch(() => false);
      }
    }

    // 3. Handle invalid credentials (Generic error to prevent user enumeration)
    if (!user || !isPasswordValid) {
      const attempts = await redisService.recordFailedLogin(ip, normalizedEmail);

      await auditLogger.logEvent({
        eventType: 'LOGIN_FAILURE',
        role: 'USER',
        ipAddress: ip,
        userAgent,
        resource: '/api/auth/login',
        action: 'POST',
        success: false,
        metadata: { email: normalizedEmail, attempts }
      });

      return {
        success: false,
        status: 401,
        message: 'Unable to authenticate with the provided credentials.'
      };
    }

    // 4. Clear brute force counters on success
    await redisService.clearFailedLogin(ip, normalizedEmail);

    const safeUser = user.toSafeObject ? user.toSafeObject() : {
      id: user.id || user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      trade: user.trade,
      workshop: user.workshop,
      assignedHelmetId: user.assignedHelmetId || 'ARC-001'
    };

    const token = this.generateAccessToken(safeUser);
    const refreshToken = this.generateRefreshToken(safeUser);

    await auditLogger.logEvent({
      eventType: 'LOGIN_SUCCESS',
      userId: safeUser.id,
      role: 'USER',
      ipAddress: ip,
      userAgent,
      resource: '/api/auth/login',
      action: 'POST',
      success: true
    });

    return {
      success: true,
      token,
      refreshToken,
      user: safeUser
    };
  },

  /**
   * Authenticate an Admin / Safety Supervisor
   */
  async authenticateAdmin(email, password, ip = '127.0.0.1', userAgent = 'Unknown') {
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    const lockStatus = await redisService.checkBruteForceLockout(ip, normalizedEmail);
    if (lockStatus.locked) {
      await auditLogger.logEvent({
        eventType: 'BRUTE_FORCE_BLOCKED',
        role: 'ADMIN',
        ipAddress: ip,
        userAgent,
        resource: '/api/auth/admin-login',
        action: 'POST',
        success: false,
        metadata: { email: normalizedEmail, attempts: lockStatus.attempts }
      });

      return {
        success: false,
        status: 429,
        message: lockStatus.message
      };
    }

    if (lockStatus.delayMs > 0) {
      await new Promise(r => setTimeout(r, lockStatus.delayMs));
    }

    let admin = null;
    let isPasswordValid = false;

    if (mongoose.connection.readyState === 1) {
      admin = await User.findOne({ email: normalizedEmail, role: 'ADMIN' });
      if (admin) {
        isPasswordValid = await admin.comparePassword(password);
      }
    } else {
      admin = inMemoryUsers.find(u => u.email === normalizedEmail && u.role === 'ADMIN');
      if (admin) {
        isPasswordValid = await bcrypt.compare(password, admin.passwordHash).catch(() => false);
      }
    }

    if (!admin || !isPasswordValid) {
      const attempts = await redisService.recordFailedLogin(ip, normalizedEmail);
      await auditLogger.logEvent({
        eventType: 'ADMIN_LOGIN_FAILURE',
        role: 'ADMIN',
        ipAddress: ip,
        userAgent,
        resource: '/api/auth/admin-login',
        action: 'POST',
        success: false,
        metadata: { email: normalizedEmail, attempts }
      });

      return {
        success: false,
        status: 401,
        message: 'Unable to authenticate with the provided credentials.'
      };
    }

    await redisService.clearFailedLogin(ip, normalizedEmail);

    const safeAdmin = admin.toSafeObject ? admin.toSafeObject() : {
      id: admin.id || admin.userId,
      name: admin.name,
      email: admin.email,
      role: 'ADMIN',
      trade: 'Lead Safety Directorate',
      workshop: 'Control Center',
      assignedHelmetId: 'N/A'
    };

    const token = this.generateAccessToken(safeAdmin);
    const refreshToken = this.generateRefreshToken(safeAdmin);

    await auditLogger.logEvent({
      eventType: 'ADMIN_LOGIN_SUCCESS',
      userId: safeAdmin.id,
      role: 'ADMIN',
      ipAddress: ip,
      userAgent,
      resource: '/api/auth/admin-login',
      action: 'POST',
      success: true
    });

    return {
      success: true,
      token,
      refreshToken,
      user: safeAdmin
    };
  },

  /**
   * Register a new Trainee / Worker
   */
  async registerUser(data, ip, userAgent) {
    const normalizedEmail = data.email.toLowerCase().trim();

    // Check duplicate
    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return {
          success: false,
          status: 400,
          message: 'An account is already associated with this email address.'
        };
      }

      const passwordHash = await User.hashPassword(data.password);
      const newUser = await User.create({
        userId: `USR-${Date.now().toString().slice(-4)}`,
        name: data.name,
        email: normalizedEmail,
        passwordHash,
        role: 'USER',
        trade: data.trade || 'Welding',
        workshop: data.workshop || 'Welding Bay 01',
        phoneNumber: data.phoneNumber || ''
      });

      const safeUser = newUser.toSafeObject();
      const token = this.generateAccessToken(safeUser);
      const refreshToken = this.generateRefreshToken(safeUser);

      await auditLogger.logEvent({
        eventType: 'USER_REGISTERED',
        userId: safeUser.id,
        role: 'USER',
        ipAddress: ip,
        userAgent,
        resource: '/api/auth/register',
        action: 'POST',
        success: true
      });

      return { success: true, token, refreshToken, user: safeUser };
    } else {
      // In-memory fallback
      const existing = inMemoryUsers.find(u => u.email === normalizedEmail);
      if (existing) {
        return {
          success: false,
          status: 400,
          message: 'An account is already associated with this email address.'
        };
      }

      const passwordHash = await bcrypt.hash(data.password, 10);
      const safeUser = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: data.name,
        email: normalizedEmail,
        role: 'USER',
        trade: data.trade || 'Welding',
        workshop: data.workshop || 'Welding Bay 01',
        assignedHelmetId: 'ARC-001'
      };

      // Store with password hash, return sanitized safeUser
      inMemoryUsers.push({ ...safeUser, passwordHash });
      const token = this.generateAccessToken(safeUser);
      const refreshToken = this.generateRefreshToken(safeUser);

      await auditLogger.logEvent({
        eventType: 'USER_REGISTERED',
        userId: safeUser.id,
        role: 'USER',
        ipAddress: ip,
        userAgent,
        resource: '/api/auth/register',
        action: 'POST',
        success: true
      });

      return { success: true, token, refreshToken, user: safeUser };
    }
  },

  /**
   * Exchange a valid Refresh Token for a new Access Token
   */
  async refreshAccessToken(refreshToken, ip = '127.0.0.1', userAgent = 'Unknown') {
    if (!refreshToken) {
      return {
        success: false,
        status: 400,
        message: 'Refresh token is required.'
      };
    }

    try {
      // Check if refresh token was invalidated
      const isBlacklisted = await redisService.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        return {
          success: false,
          status: 401,
          message: 'Refresh token has been revoked.'
        };
      }

      // Verify token cryptographic signature
      const decoded = jwt.verify(refreshToken, SECURITY_CONFIG.JWT_REFRESH_SECRET);

      let user = null;
      if (mongoose.connection.readyState === 1) {
        user = await User.findOne({ userId: decoded.id });
      } else {
        user = inMemoryUsers.find(u => u.id === decoded.id);
      }

      if (!user) {
        return {
          success: false,
          status: 401,
          message: 'User session no longer exists.'
        };
      }

      const safeUser = user.toSafeObject ? user.toSafeObject() : {
        id: user.id || user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        trade: user.trade,
        workshop: user.workshop,
        assignedHelmetId: user.assignedHelmetId || 'ARC-001'
      };

      const newAccessToken = this.generateAccessToken(safeUser);
      const newRefreshToken = this.generateRefreshToken(safeUser);

      // Invalidate the old refresh token
      await redisService.blacklistToken(refreshToken, 7 * 24 * 3600);

      await auditLogger.logEvent({
        eventType: 'TOKEN_REFRESHED',
        userId: safeUser.id,
        role: safeUser.role,
        ipAddress: ip,
        userAgent,
        resource: '/api/auth/refresh',
        action: 'POST',
        success: true
      });

      return {
        success: true,
        token: newAccessToken,
        refreshToken: newRefreshToken,
        user: safeUser
      };
    } catch (err) {
      return {
        success: false,
        status: 401,
        message: 'Invalid or expired refresh token.'
      };
    }
  }
};

export default authService;
