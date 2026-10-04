import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { SECURITY_CONFIG } from '../config/security.js';
import { redisService } from './redisService.js';
import { auditLogger } from './auditLogger.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

const googleClient = new OAuth2Client();

// In-memory credential store when DB is in fallback mode
// In-memory fallback for offline development mode (Admin data is strictly stored in MongoDB)
const inMemoryUsers = [
  {
    id: 'USR-102',
    name: 'Alex Chen',
    email: 'alex.chen@arcshield.local',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'USER',
    trade: 'Industrial Welding',
    workshop: 'Fabrication Bay 4',
    assignedHelmetId: 'ARC-001'
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
   * Authenticate a Worker via Google Identity Services ID Token
   */
  async authenticateGoogle(credential, ip = '127.0.0.1', userAgent = 'Unknown') {
    if (!credential || typeof credential !== 'string') {
      return {
        success: false,
        status: 400,
        message: 'Google credential token is required.'
      };
    }

    let payload = null;
    try {
      const clientId = SECURITY_CONFIG.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
      const verifyOptions = {
        idToken: credential
      };
      if (clientId) {
        verifyOptions.audience = clientId;
      }

      const ticket = await googleClient.verifyIdToken(verifyOptions);
      payload = ticket.getPayload();

      if (!payload || !payload.sub) {
        throw new Error('Google token payload missing subject (sub)');
      }

      // Verify token issuer
      const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
      if (!validIssuers.includes(payload.iss)) {
        throw new Error(`Invalid token issuer: ${payload.iss}`);
      }

      // If audience was configured, ensure match
      if (clientId && payload.aud !== clientId) {
        throw new Error('Audience mismatch on Google ID token');
      }
    } catch (err) {
      await auditLogger.logEvent({
        eventType: 'GOOGLE_LOGIN_FAILURE',
        role: 'ANONYMOUS',
        ipAddress: ip,
        userAgent,
        resource: '/api/auth/google',
        action: 'POST',
        success: false,
        metadata: { reason: 'Token verification failed', error: err.message }
      });

      return {
        success: false,
        status: 401,
        message: 'Google authentication failed. The token is invalid, expired, or untrusted.'
      };
    }

    const googleId = payload.sub;
    const normalizedEmail = (payload.email || '').toLowerCase().trim();
    const emailVerified = !!payload.email_verified;
    const name = payload.name || payload.given_name || 'ArcShield Worker';
    const picture = payload.picture || '';

    if (!normalizedEmail) {
      return {
        success: false,
        status: 400,
        message: 'Google account must have an associated email address.'
      };
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    try {
      let user = null;
      let isNewAccount = false;
      let isAccountLinked = false;

      if (isDbConnected) {
        // 1. Check existing account by googleId first (primary Google identifier)
        user = await User.findOne({ googleId });

        if (user) {
          // Prevent Google from accessing ADMIN role accounts
          if (user.role === 'ADMIN') {
            await auditLogger.logEvent({
              eventType: 'GOOGLE_LOGIN_FAILURE',
              userId: user.userId,
              role: 'ADMIN',
              ipAddress: ip,
              userAgent,
              resource: '/api/auth/google',
              action: 'POST',
              success: false,
              metadata: { reason: 'Admin accounts cannot authenticate via worker Google sign-in' }
            });

            return {
              success: false,
              status: 403,
              message: 'Administrative accounts must authenticate via dedicated administrative login.'
            };
          }

          // Update user activity
          user.lastLogin = new Date();
          if (!user.avatar && picture) user.avatar = picture;
          await user.save();
        } else {
          // 2. Check if an account already exists with the same email
          const existingByEmail = await User.findOne({ email: normalizedEmail });

          if (existingByEmail) {
            // Never permit Google auth to take over or grant access to ADMIN accounts
            if (existingByEmail.role === 'ADMIN') {
              await auditLogger.logEvent({
                eventType: 'GOOGLE_LOGIN_FAILURE',
                userId: existingByEmail.userId,
                role: 'ADMIN',
                ipAddress: ip,
                userAgent,
                resource: '/api/auth/google',
                action: 'POST',
                success: false,
                metadata: { reason: 'Admin accounts cannot be linked via worker Google sign-in' }
              });

              return {
                success: false,
                status: 403,
                message: 'Administrative accounts must authenticate via dedicated administrative login.'
              };
            }

            // Conflict check: Already linked to a different Google account
            if (existingByEmail.googleId && existingByEmail.googleId !== googleId) {
              return {
                success: false,
                status: 409,
                message: 'This email is already associated with a different Google identity.'
              };
            }

            // Secure account linking only if Google email is verified
            if (!emailVerified) {
              return {
                success: false,
                status: 400,
                message: 'Google email address is not verified by Google.'
              };
            }

            // Link the verified Google identity to the existing user
            existingByEmail.googleId = googleId;
            existingByEmail.authProvider = existingByEmail.passwordHash ? 'both' : 'google';
            if (!existingByEmail.avatar && picture) existingByEmail.avatar = picture;
            existingByEmail.lastLogin = new Date();
            await existingByEmail.save();

            user = existingByEmail;
            isAccountLinked = true;
          } else {
            // 3. Create a new USER (Role is STRICTLY USER, never ADMIN)
            user = await User.create({
              userId: `USR-${Date.now().toString().slice(-4)}`,
              name,
              email: normalizedEmail,
              googleId,
              authProvider: 'google',
              role: 'USER',
              trade: 'Welding & Fabrication',
              workshop: 'Welding Bay 01',
              assignedHelmetId: 'ARC-001',
              avatar: picture,
              isActive: true,
              lastLogin: new Date()
            });

            isNewAccount = true;
          }
        }
      } else {
        // In-memory fallback for offline test environments
        user = inMemoryUsers.find(u => u.googleId === googleId);
        if (user) {
          if (user.role === 'ADMIN') {
            return {
              success: false,
              status: 403,
              message: 'Administrative accounts must authenticate via dedicated administrative login.'
            };
          }
        } else {
          const existingByEmail = inMemoryUsers.find(u => u.email === normalizedEmail);
          if (existingByEmail) {
            if (existingByEmail.role === 'ADMIN') {
              return {
                success: false,
                status: 403,
                message: 'Administrative accounts must authenticate via dedicated administrative login.'
              };
            }
            existingByEmail.googleId = googleId;
            existingByEmail.authProvider = existingByEmail.passwordHash ? 'both' : 'google';
            user = existingByEmail;
            isAccountLinked = true;
          } else {
            user = {
              id: `USR-${Date.now().toString().slice(-4)}`,
              name,
              email: normalizedEmail,
              googleId,
              authProvider: 'google',
              role: 'USER',
              trade: 'Welding & Fabrication',
              workshop: 'Welding Bay 01',
              assignedHelmetId: 'ARC-001',
              avatar: picture,
              lastLogin: new Date()
            };
            inMemoryUsers.push(user);
            isNewAccount = true;
          }
        }
      }

      const safeUser = user.toSafeObject ? user.toSafeObject() : {
        id: user.id || user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        trade: user.trade,
        workshop: user.workshop,
        assignedHelmetId: user.assignedHelmetId || 'ARC-001',
        authProvider: user.authProvider || 'google',
        avatar: user.avatar || picture
      };

      // Log specific audit events
      if (isNewAccount) {
        await auditLogger.logEvent({
          eventType: 'GOOGLE_ACCOUNT_CREATED',
          userId: safeUser.id,
          role: safeUser.role,
          ipAddress: ip,
          userAgent,
          resource: '/api/auth/google',
          action: 'POST',
          success: true,
          metadata: { email: normalizedEmail, googleId }
        });
      } else if (isAccountLinked) {
        await auditLogger.logEvent({
          eventType: 'GOOGLE_ACCOUNT_LINKED',
          userId: safeUser.id,
          role: safeUser.role,
          ipAddress: ip,
          userAgent,
          resource: '/api/auth/google',
          action: 'POST',
          success: true,
          metadata: { email: normalizedEmail, googleId }
        });
      }

      await auditLogger.logEvent({
        eventType: 'GOOGLE_LOGIN_SUCCESS',
        userId: safeUser.id,
        role: safeUser.role,
        ipAddress: ip,
        userAgent,
        resource: '/api/auth/google',
        action: 'POST',
        success: true
      });

      // Issue ArcShield JWT Access and Refresh Tokens
      const token = this.generateAccessToken(safeUser);
      const refreshToken = this.generateRefreshToken(safeUser);

      return {
        success: true,
        token,
        refreshToken,
        user: safeUser
      };
    } catch (err) {
      await auditLogger.logEvent({
        eventType: 'GOOGLE_LOGIN_FAILURE',
        role: 'ANONYMOUS',
        ipAddress: ip,
        userAgent,
        resource: '/api/auth/google',
        action: 'POST',
        success: false,
        metadata: { error: err.message }
      });

      return {
        success: false,
        status: 500,
        message: 'Internal server error during Google authentication.'
      };
    }
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
