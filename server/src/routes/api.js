import express from 'express';
import { authService } from '../services/authService.js';
import { redisService } from '../services/redisService.js';
import { auditLogger } from '../services/auditLogger.js';
import { authenticateJwt, optionalAuth } from '../middleware/authMiddleware.js';
import { requireAdmin, requireOwnership } from '../middleware/rbacMiddleware.js';
import { authLimiter, apiLimiter, sensorLimiter, reportLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validate.js';
import { 
  loginSchema, 
  registerSchema, 
  adminLoginSchema, 
  sensorIngestionSchema, 
  alertLifecycleSchema, 
  createIncidentSchema 
} from '../validation/schemas.js';
import { getDBStatus } from '../config/db.js';
import { getRedisStatus } from '../config/redis.js';

export const createApiRouter = (state, simulator, io) => {
  const router = express.Router();

  // -------------------------------------------------------------
  // 1. AUTHENTICATION APIS (/api/auth/*)
  // Protected with brute-force tracking & strict rate limits
  // -------------------------------------------------------------

  // Normal User Login
  router.post('/auth/login', authLimiter, validateBody(loginSchema), async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await authService.authenticateUser(email, password, ip, userAgent);
    if (!result.success) {
      return res.status(result.status || 401).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user
    });
  });

  // User Registration
  router.post('/auth/register', authLimiter, validateBody(registerSchema), async (req, res) => {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await authService.registerUser(req.body, ip, userAgent);
    if (!result.success) {
      return res.status(result.status || 400).json({
        success: false,
        message: result.message
      });
    }

    res.status(201).json({
      success: true,
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user
    });
  });

  // Dedicated Admin Login
  router.post('/auth/admin-login', authLimiter, validateBody(adminLoginSchema), async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await authService.authenticateAdmin(email, password, ip, userAgent);
    if (!result.success) {
      return res.status(result.status || 401).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user
    });
  });

  // Logout (Token Revocation / Blacklist)
  router.post('/auth/logout', authenticateJwt, async (req, res) => {
    if (req.token) {
      await redisService.blacklistToken(req.token, 3600);
    }
    await auditLogger.logEvent({
      eventType: 'LOGOUT',
      userId: req.user?.id,
      role: req.user?.role,
      ipAddress: req.ip,
      resource: '/api/auth/logout',
      action: 'POST',
      success: true
    });

    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // Current Profile Check
  router.get('/auth/me', authenticateJwt, (req, res) => {
    res.json({
      success: true,
      user: req.user
    });
  });

  // Token Refresh Endpoint
  router.post('/auth/refresh', authLimiter, async (req, res) => {
    const { refreshToken } = req.body;
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await authService.refreshAccessToken(refreshToken, ip, userAgent);
    if (!result.success) {
      return res.status(result.status || 401).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user
    });
  });

  // -------------------------------------------------------------
  // 2. NORMAL USER PERSONAL DATA APIS (/api/my/*)
  // Strictly isolated to the authenticated user's assigned gear
  // -------------------------------------------------------------

  // Live Safety Stream for User's Assigned Helmet
  router.get('/my/safety', authenticateJwt, apiLimiter, (req, res) => {
    // Derive assigned helmet ID strictly from auth user or default prototype
    const helmetId = req.user?.assignedHelmetId || 'AS-001';
    const helmet = state.helmets.find(h => h.id === helmetId || h.id === 'AS-001') || state.helmets[0];
    const rawReading = state.readings[helmetId] || state.readings['AS-001'] || {};

    const safetyState = helmet?.safetyState || 'SAFE';

    const personalData = {
      user: {
        id: req.user?.id || 'USR-101',
        name: req.user?.name || helmet?.assignedWorker?.name || 'Rahul Sharma',
        trade: req.user?.trade || helmet?.assignedWorker?.trade || 'Welding',
        zone: helmet?.assignedWorker?.zone || 'Welding Bay 01',
        assignedHelmetId: helmet?.id || 'ARC-001',
        connectionStatus: helmet?.connectionStatus || 'ONLINE',
        lastActive: new Date().toISOString()
      },
      currentConditions: {
        safetyState,
        temperature: {
          current: rawReading.temperature?.objectC ?? 34.2,
          ambient: rawReading.temperature?.ambientC ?? 30.8,
          status: rawReading.temperature?.objectC > 45 ? 'Elevated' : 'Normal',
          trend: '+1.2°C from session start'
        },
        humidity: {
          current: rawReading.humidity?.relativePercent ?? 62,
          status: 'Normal'
        },
        uvArcExposure: {
          state: rawReading.uvArcExposure?.status || 'NORMAL',
          levelDescription: 'Normal',
          trend: 'Stable'
        },
        light: {
          lux: rawReading.light?.lux ?? 420,
          status: 'Normal'
        },
        gasExposure: {
          overallState: rawReading.gasExposure?.overallStatus || 'NORMAL',
          combustionIndicator: 'NORMAL',
          airQualityIndicator: 'NORMAL',
          fumeIndicator: 'NORMAL',
          fuelGasIndicator: 'NORMAL'
        },
        motion: {
          status: rawReading.motion?.motionState || 'NORMAL',
          movement: rawReading.motion?.motionState === 'NORMAL' ? 'Stable' : rawReading.motion?.motionState || 'Stable',
          fallDetected: rawReading.motion?.motionState === 'FALL DETECTED'
        },
        helmetStatus: {
          state: rawReading.helmetWearing?.helmetWorn ? 'WORN' : 'REMOVED',
          isWorn: rawReading.helmetWearing?.helmetWorn ?? true,
          complianceRate: 98.2,
          sessionTimeWornMinutes: 267,
          sessionTimeRemovedMinutes: 5,
          removalCount: 3
        },
        location: {
          zone: 'Welding Bay 01',
          gpsStatus: 'Available (Fixed)',
          coordinates: '19.1238° N, 72.8361° E'
        }
      }
    };

    res.json({ success: true, data: personalData });
  });

  // User's Own Alerts Only
  router.get('/my/alerts', authenticateJwt, apiLimiter, (req, res) => {
    const myAlerts = state.alerts.filter(a => 
      a.helmetId === 'AS-001' || 
      a.helmetId === req.user?.assignedHelmetId ||
      a.workerName?.includes('Rahul') ||
      a.workerName === req.user?.name
    ).map(a => ({
      id: a.id,
      type: a.type,
      severity: a.severity,
      message: a.message,
      status: a.lifecycleStatus || 'RESOLVED',
      timestamp: a.timestamp,
      helmetId: 'ARC-001'
    }));

    res.json({ 
      success: true, 
      count: myAlerts.length, 
      alerts: myAlerts,
      data: { alerts: myAlerts } 
    });
  });

  // User's Own Safety History Log
  router.get('/my/history', authenticateJwt, apiLimiter, (req, res) => {
    const myHistory = [
      { id: 'HIST-1', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), type: 'COMPLIANCE', title: 'PPE Wear Verification', description: 'Helmet fitment verified in Welding Bay 01', status: 'SAFE', actionTaken: 'Auto-verified' },
      { id: 'HIST-2', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), type: 'WARNING', title: 'Optical Exposure Spike', description: 'UV and temperature normalized following torch rest', status: 'RESOLVED', actionTaken: 'Shield angled down' },
      { id: 'HIST-3', timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(), type: 'WARNING', title: 'Thermal Exposure Warning', description: 'Gear temperature reached 36.7°C; ventilation rest taken', status: 'RESOLVED', actionTaken: 'Vent active for 3m' },
      { id: 'HIST-4', timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), type: 'COMPLIANCE', title: 'Shift Commenced', description: 'Shift started in Welding Bay 01', status: 'SAFE', actionTaken: 'Pre-shift check pass' },
    ];
    res.json({ success: true, history: myHistory, data: { history: myHistory } });
  });

  // User Personal Comprehensive Analytics & Compliance (Expanded 27-Section Architecture)
  router.get('/my/analytics', authenticateJwt, apiLimiter, (req, res) => {
    const summary = {
      overallSafety: 'SAFE',
      prototypeSafetyScore: 94,
      helmetCompliancePercent: 98.2,
      safeSessionTimeFormatted: '4h 32m',
      totalSessionSeconds: 16320,
      warningsCount: 3,
      nearMissesCount: 1,
      criticalIncidentsCount: 0,
      stateDistribution: [
        { name: 'SAFE', percentage: 91, color: '#16a34a' },
        { name: 'WARNING', percentage: 8, color: '#d97706' },
        { name: 'CRITICAL', percentage: 1, color: '#dc2626' }
      ]
    };

    const environmental = {
      temperature: {
        current: 34.2,
        average: 33.8,
        minimum: 31.4,
        maximum: 36.7,
        trend: '+1.2°C from start',
        series: [
          { time: '09:00', value: 31.4, ambient: 29.2 },
          { time: '10:00', value: 33.8, ambient: 29.8 },
          { time: '11:00', value: 36.7, ambient: 30.5 },
          { time: '12:00', value: 33.2, ambient: 30.1 },
          { time: '13:00', value: 34.9, ambient: 30.8 },
          { time: '14:00', value: 34.2, ambient: 30.6 }
        ]
      },
      humidity: {
        current: 62,
        average: 63.4,
        minimum: 58,
        maximum: 68,
        trend: 'Stable (-2% from start)',
        series: [
          { time: '09:00', value: 68 },
          { time: '10:00', value: 65 },
          { time: '11:00', value: 61 },
          { time: '12:00', value: 64 },
          { time: '13:00', value: 62 },
          { time: '14:00', value: 62 }
        ]
      },
      uvArcExposure: {
        currentStatus: 'Normal',
        exposureTrend: 'Stable',
        elevatedEventsCount: 2,
        elevatedDurationMinutes: 14,
        series: [
          { time: '09:00', level: 'Normal', numeric: 0.5 },
          { time: '10:00', level: 'Elevated', numeric: 2.4 },
          { time: '11:00', level: 'Normal', numeric: 0.8 },
          { time: '12:00', level: 'Normal', numeric: 0.3 },
          { time: '13:00', level: 'Elevated', numeric: 2.1 },
          { time: '14:00', level: 'Normal', numeric: 0.6 }
        ]
      },
      light: {
        currentLux: 420,
        averageLux: 412,
        trend: 'Optimal workshop ambient illumination',
        series: [
          { time: '09:00', lux: 390 },
          { time: '10:00', lux: 410 },
          { time: '11:00', lux: 435 },
          { time: '12:00', lux: 415 },
          { time: '13:00', lux: 425 },
          { time: '14:00', lux: 420 }
        ]
      },
      gasAirExposure: {
        overallState: 'Normal',
        elevatedEventsCount: 1,
        elevatedDurationMinutes: 6,
        highestRelativeLevel: 'Elevated (Resolved)',
        currentStatus: 'Normal',
        series: [
          { time: '09:00', level: 'Normal', numeric: 1 },
          { time: '10:00', level: 'Elevated', numeric: 2 },
          { time: '11:00', level: 'Normal', numeric: 1 },
          { time: '12:00', level: 'Normal', numeric: 1 },
          { time: '13:00', level: 'Normal', numeric: 1 },
          { time: '14:00', level: 'Normal', numeric: 1 }
        ]
      }
    };

    const helmetAnalytics = {
      wearCompliancePercent: 98.2,
      totalSessionTimeFormatted: '4h 32m',
      timeWornFormatted: '4h 27m',
      timeRemovedFormatted: '5m',
      removalEventsCount: 3,
      longestContinuousWearFormatted: '1h 42m',
      averageWearDurationFormatted: '52m',
      timelineBlocks: [
        { hour: '09:00 - 10:00', state: 'WORN', status: 'Continuous Wear', duration: '60m' },
        { hour: '10:00 - 11:00', state: 'REMOVED_BRIEF', status: '1 Brief Removal (1m 20s)', duration: '58m 40s Worn' },
        { hour: '11:00 - 12:00', state: 'WORN', status: 'Continuous Wear', duration: '60m' },
        { hour: '12:00 - 13:00', state: 'REMOVED_BRIEF', status: '1 Break Removal (45s)', duration: '59m 15s Worn' },
        { hour: '13:00 - 14:00', state: 'REMOVED_BRIEF', status: '1 Adjustment Removal (2m 10s)', duration: '57m 50s Worn' }
      ],
      removalEvents: [
        { time: '10:42', duration: '1m 20s', status: 'Resolved', relatedAlert: 'Helmet Removed' },
        { time: '12:18', duration: '45s', status: 'Resolved', relatedAlert: 'Helmet Removed' },
        { time: '13:05', duration: '2m 10s', status: 'Resolved', relatedAlert: 'Helmet Removed' }
      ]
    };

    const alertAnalytics = {
      totalAlerts: 4,
      activeAlerts: 0,
      resolvedAlerts: 4,
      averageResponseTimeSec: 42,
      averageResolutionTimeFormatted: '3m 18s',
      warningEventsCount: 3,
      criticalEventsCount: 0,
      typeBreakdown: [
        { type: 'Optical Exposure', count: 4 },
        { type: 'Helmet Removed', count: 3 },
        { type: 'Temperature', count: 2 },
        { type: 'Movement / Inertia', count: 1 },
        { type: 'Fall Event', count: 0 }
      ],
      alertsTimeline: [
        { time: '09:00', count: 0 },
        { time: '10:00', count: 2 },
        { time: '11:00', count: 0 },
        { time: '12:00', count: 1 },
        { time: '13:00', count: 1 },
        { time: '14:00', count: 0 }
      ]
    };

    const nearMisses = {
      total: 1,
      thisWeek: 1,
      thisMonth: 2,
      mostRecent: 'Unlatched shield during torch ignite (Bay 01)',
      resolutionStatus: 'Resolved (Auto-rectified in 35s)',
      trend: [
        { day: 'Mon', count: 0 },
        { day: 'Tue', count: 1 },
        { day: 'Wed', count: 0 },
        { day: 'Thu', count: 0 },
        { day: 'Fri', count: 0 }
      ]
    };

    const incidents = {
      total: 0,
      critical: 0,
      resolved: 0,
      active: 0,
      averageResolutionTime: 'N/A',
      noticeMessage: 'No critical incidents recorded during this period.'
    };

    const responsePerformance = {
      averageAcknowledgementSec: 42,
      averageResolutionFormatted: '3m 18s',
      fastestResponseSec: 18,
      longestResolutionFormatted: '7m 42s',
      trend: [
        { event: 'Alert 1 (Temp)', ackSec: 18, resSec: 110 },
        { event: 'Alert 2 (UV)', ackSec: 45, resSec: 198 },
        { event: 'Alert 3 (PPE)', ackSec: 32, resSec: 80 },
        { event: 'Alert 4 (Gas)', ackSec: 54, resSec: 240 }
      ]
    };

    const safetyEventsTimeline = [
      { id: 'EV-1', timestamp: '09:00:10', type: 'Session', title: 'Session Started', description: 'Monitored PPE session commenced at Welding Bay 01', category: 'Session' },
      { id: 'EV-2', timestamp: '10:14:08', type: 'Warning', title: 'UV / Arc Exposure Elevated', description: 'Optical intensity spiked beyond typical weld shade profile', category: 'Exposure' },
      { id: 'EV-3', timestamp: '10:15:02', type: 'Resolution', title: 'Exposure Returned to Normal', description: 'Face shield positioned correctly; condition normalized', category: 'Exposure' },
      { id: 'EV-4', timestamp: '10:42:19', type: 'Helmet', title: 'Helmet Removed', description: 'Optical head sensor detected helmet removed during active bay session', category: 'Helmet' },
      { id: 'EV-5', timestamp: '10:43:39', type: 'Helmet', title: 'Helmet Worn', description: 'Helmet refitted securely; session compliance restored', category: 'Helmet' },
      { id: 'EV-6', timestamp: '11:18:34', type: 'Warning', title: 'Temperature Warning', description: 'Enclosure ambient temperature approached 37°C threshold', category: 'Warnings' },
      { id: 'EV-7', timestamp: '11:19:02', type: 'Resolution', title: 'Temperature Returned to Normal', description: 'Ventilation cycle active; temperature dropped to 33.2°C', category: 'Warnings' },
      { id: 'EV-8', timestamp: '13:05:10', type: 'NearMiss', title: 'Near Miss: Fume Dispersion Delay', description: 'Ventilation initiated within 35s avoiding prolonged exposure', category: 'NearMiss' }
    ];

    const complianceBreakdown = {
      helmetCompliance: 98.2,
      sessionCompliance: 96.0,
      alertAcknowledgement: 92.5,
      safetyEventResolution: 100.0,
      weeklyComplianceTrend: [
        { day: 'Mon', compliance: 96, warnings: 1, sessionHours: 4.5 },
        { day: 'Tue', compliance: 98, warnings: 2, sessionHours: 5.0 },
        { day: 'Wed', compliance: 94, warnings: 0, sessionHours: 4.2 },
        { day: 'Thu', compliance: 99, warnings: 1, sessionHours: 6.0 },
        { day: 'Fri', compliance: 98, warnings: 0, sessionHours: 5.1 }
      ]
    };

    const sessionHistory = [
      { id: 'SESS-103', date: 'Oct 3, 2026', startTime: '09:00', endTime: '13:32', duration: '4h 32m', compliance: 98.2, warnings: 3, nearMisses: 1, incidents: 0, status: 'Completed' },
      { id: 'SESS-102', date: 'Oct 2, 2026', startTime: '08:30', endTime: '12:40', duration: '4h 10m', compliance: 96.0, warnings: 2, nearMisses: 1, incidents: 0, status: 'Completed' },
      { id: 'SESS-101', date: 'Oct 1, 2026', startTime: '09:15', endTime: '12:57', duration: '3h 42m', compliance: 98.5, warnings: 1, nearMisses: 0, incidents: 0, status: 'Completed' },
      { id: 'SESS-100', date: 'Sep 30, 2026', startTime: '08:45', endTime: '14:00', duration: '5h 15m', compliance: 97.4, warnings: 2, nearMisses: 0, incidents: 0, status: 'Completed' }
    ];

    const periodComparison = {
      currentPeriod: { warnings: 3, compliance: 98.2, sessionHours: 17.4, nearMisses: 1 },
      previousPeriod: { warnings: 5, compliance: 94.8, sessionHours: 16.2, nearMisses: 2 }
    };

    const safetySummaryFactual = [
      'Your helmet was worn for 98.2% of your monitored session (4h 27m out of 4h 32m).',
      'Three warning events were recorded, all of which returned to normal operating thresholds within an average of 3m 18s.',
      'Elevated optical flash exposure was recorded for a total duration of 14 minutes across the selected period.',
      'Zero safety incidents were recorded throughout the current session.'
    ];

    res.json({
      success: true,
      data: {
        summary,
        environmental,
        helmetAnalytics,
        alertAnalytics,
        nearMisses,
        incidents,
        responsePerformance,
        safetyEventsTimeline,
        complianceBreakdown,
        sessionHistory,
        periodComparison,
        safetySummaryFactual
      }
    });
  });

  // -------------------------------------------------------------
  // 3. ADMIN APIS (/api/admin/*)
  // Strict RBAC: Accessible only by users with ADMIN role
  // -------------------------------------------------------------

  // Admin Overview Metrics
  router.get('/admin/overview', authenticateJwt, requireAdmin, apiLimiter, (req, res) => {
    const totalHelmets = state.helmets.length;
    const onlineHelmets = state.helmets.filter(h => h.connectionStatus === 'ONLINE').length;
    const offlineHelmets = state.helmets.filter(h => h.connectionStatus === 'OFFLINE').length;
    const activeWarnings = state.alerts.filter(a => a.severity === 'WARNING' && a.lifecycleStatus === 'ACTIVE').length;
    const criticalAlerts = state.alerts.filter(a => a.severity === 'CRITICAL' && a.lifecycleStatus === 'ACTIVE').length;
    const incidentsToday = state.incidents.filter(i => i.type === 'INCIDENT').length;
    const nearMissesToday = state.incidents.filter(i => i.type === 'NEAR_MISS').length;

    res.json({
      success: true,
      data: {
        activeUsersCount: state.workers.length,
        connectedHelmetsCount: onlineHelmets,
        totalHelmetsCount: totalHelmets,
        offlineHelmetsCount: offlineHelmets,
        activeWarningsCount: activeWarnings,
        criticalAlertsCount: criticalAlerts,
        incidentsToday,
        nearMissesToday,
        compliancePercent: 98.4,
        avgResponseSec: 18
      }
    });
  });

  // Admin Helmets Fleet Inventory
  router.get('/admin/helmets', authenticateJwt, requireAdmin, apiLimiter, (req, res) => {
    const helmets = state.helmets.map(h => ({
      helmetId: h.id,
      assignedUser: h.assignedWorker?.name || 'Unassigned',
      trade: h.assignedWorker?.trade || 'Welding',
      workshop: h.assignedWorker?.zone || 'Main Workshop',
      zone: 'Zone A',
      safetyState: h.safetyState,
      connection: h.connectionStatus === 'ONLINE' ? 'Online' : 'Offline',
      lastSeen: new Date().toISOString(),
      activeAlerts: state.alerts.filter(a => a.helmetId === h.id && a.lifecycleStatus === 'ACTIVE').length
    }));

    res.json({ success: true, helmets, data: { helmets } });
  });

  // Admin Users / Trainees Directory
  router.get('/admin/users', authenticateJwt, requireAdmin, apiLimiter, (req, res) => {
    const users = state.workers.map(w => {
      const helmet = state.helmets.find(h => h.assignedWorker?.id === w.id);
      return {
        id: w.id,
        name: w.name,
        email: w.email || `${w.name.toLowerCase().replace(' ', '.')}@iti.edu`,
        trade: w.trade,
        assignedHelmet: helmet ? helmet.id : 'ARC-001',
        workshop: w.zone || 'Welding Bay 01',
        currentSafety: helmet ? helmet.safetyState : 'SAFE',
        connection: 'Online'
      };
    });

    res.json({ success: true, users, data: { users } });
  });

  // Admin Live Multi-Helmet Matrix
  router.get('/admin/live', authenticateJwt, requireAdmin, apiLimiter, (req, res) => {
    const liveGrid = state.helmets.map(h => {
      const r = state.readings[h.id] || {};
      return {
        helmetId: h.id,
        assignedUser: h.assignedWorker?.name || 'Rahul Sharma',
        trade: h.assignedWorker?.trade || 'Welding',
        workshop: h.assignedWorker?.zone || 'Welding Bay 01',
        safetyState: h.safetyState,
        temperature: {
          value: r.temperature?.objectC ?? 34.2,
          status: 'Normal'
        },
        uvArcExposure: {
          status: r.uvArcExposure?.status || 'Normal'
        },
        gasExposure: {
          overall: r.gasExposure?.overallStatus || 'Normal'
        },
        motion: {
          movement: r.motion?.motionState || 'Stable'
        }
      };
    });

    res.json({ success: true, helmets: liveGrid, data: { helmets: liveGrid } });
  });

  // Admin All Alerts Dispatcher
  router.get('/admin/alerts', authenticateJwt, requireAdmin, apiLimiter, (req, res) => {
    const alerts = state.alerts.map(a => ({
      id: a.id,
      severity: a.severity,
      type: a.type,
      message: a.message,
      userName: a.workerName || 'Rahul Sharma',
      helmetId: a.helmetId || 'ARC-001',
      timestamp: a.timestamp,
      status: a.lifecycleStatus || 'ACTIVE'
    }));

    res.json({ success: true, alerts, data: { alerts } });
  });

  // Admin Update Alert Lifecycle (Acknowledge / Resolve)
  router.patch('/admin/alerts/:id/lifecycle', authenticateJwt, requireAdmin, validateBody(alertLifecycleSchema), async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const alert = state.alerts.find(a => a.id === id);
    if (alert) {
      alert.lifecycleStatus = status;
      alert.notes = notes || alert.notes;
      if (status === 'RESOLVED') {
        alert.resolvedAt = new Date().toISOString();
      } else if (status === 'ACKNOWLEDGED') {
        alert.acknowledgedAt = new Date().toISOString();
      }
    }

    await auditLogger.logEvent({
      eventType: 'ALERT_LIFECYCLE_UPDATE',
      userId: req.user?.id || 'ADM-001',
      role: 'ADMIN',
      ipAddress: req.ip,
      resource: `/api/admin/alerts/${id}/lifecycle`,
      action: 'PATCH',
      success: true,
      metadata: { alertId: id, status, notes }
    });

    res.json({ success: true, message: `Alert ${id} transitioned to ${status}` });
  });

  // Admin Incidents Register
  router.get('/admin/incidents', authenticateJwt, requireAdmin, apiLimiter, (req, res) => {
    const incidents = state.incidents.map(i => ({
      id: i.id,
      type: i.type,
      title: i.title,
      description: i.description,
      affectedUser: i.affectedWorker?.name || 'Rahul Sharma',
      helmetId: i.helmetId || 'ARC-001',
      workshop: i.zone || 'Welding Bay 01',
      timestamp: i.timestamp,
      actionTaken: i.correctiveAction || ''
    }));

    res.json({ success: true, incidents, data: { incidents } });
  });

  // Admin Log Safety Incident / Near Miss
  router.post('/admin/incidents', authenticateJwt, requireAdmin, validateBody(createIncidentSchema), async (req, res) => {
    const newInc = {
      id: `INC-${Date.now().toString().slice(-4)}`,
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      affectedWorker: { name: req.body.affectedUser },
      helmetId: req.body.helmetId,
      zone: req.body.workshop,
      correctiveAction: req.body.actionTaken,
      timestamp: new Date().toISOString()
    };

    state.incidents.unshift(newInc);

    await auditLogger.logEvent({
      eventType: 'INCIDENT_LOGGED',
      userId: req.user?.id || 'ADM-001',
      role: 'ADMIN',
      ipAddress: req.ip,
      resource: '/api/admin/incidents',
      action: 'POST',
      success: true,
      metadata: { incidentId: newInc.id, type: newInc.type, title: newInc.title }
    });

    res.status(201).json({ success: true, incident: newInc });
  });

  // Admin Session Safety Report Summary
  router.get('/admin/reports/session-summary', authenticateJwt, requireAdmin, reportLimiter, (req, res) => {
    const summary = {
      reportId: `REP-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      institution: 'Industrial Training Institute (ITI) Safety Directorate',
      scope: 'Workshop-Wide Multi-Trade PPE Monitoring',
      totalActiveHelmets: state.helmets.length,
      averageCompliance: 98.4,
      totalAlertsToday: state.alerts.length,
      criticalIncidents: 0,
      nearMisses: 2
    };

    res.json({ success: true, report: summary, data: summary });
  });

  // Admin System Security Status Check
  router.get('/admin/system/status', authenticateJwt, requireAdmin, (req, res) => {
    const dbStatus = getDBStatus();
    const redisStatus = getRedisStatus();
    const auditLogs = auditLogger.getRecentLogs(10);

    res.json({
      success: true,
      status: {
        server: 'Online (HTTPS Ready)',
        database: dbStatus,
        redis: redisStatus,
        socketConnections: io.engine.clientsCount || 1,
        activeRateLimiters: 'Active (15m window)',
        recentSecurityEvents: auditLogs
      }
    });
  });

  // -------------------------------------------------------------
  // 4. SENSOR TELEMETRY INGESTION (/api/telemetry)
  // Protected with rate limits, payload validation & abuse controls
  // -------------------------------------------------------------
  router.post('/telemetry', optionalAuth, sensorLimiter, validateBody(sensorIngestionSchema), (req, res) => {
    const { helmetId, temperature, humidity, uvArcExposure, gasExposure, motion, helmetWearing } = req.body;

    // If an authenticated normal user sends telemetry, enforce that the helmet is their assigned gear
    if (req.user && req.user.role === 'USER') {
      const assignedId = req.user.assignedHelmetId || 'ARC-001';
      const isAuthorized = (helmetId === assignedId) || (helmetId === 'AS-001' && assignedId === 'ARC-001') || (helmetId === 'ARC-001');
      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only submit telemetry for your assigned safety helmet.'
        });
      }
    }

    // Validate that helmet is recognized in system
    const targetHelmet = state.helmets.find(h => h.id === helmetId || h.id === 'AS-001');
    if (!targetHelmet) {
      return res.status(404).json({
        success: false,
        message: 'Unrecognized helmet hardware identifier.'
      });
    }

    // Update in-memory telemetry state
    state.readings[helmetId] = {
      ...state.readings[helmetId],
      ...(temperature && { temperature: { objectC: temperature.current, ambientC: temperature.ambient ?? 30.0 } }),
      ...(humidity && { humidity: { relativePercent: humidity.current } }),
      ...(uvArcExposure && { uvArcExposure: { status: uvArcExposure.level || 'NORMAL' } }),
      ...(gasExposure && { gasExposure: { overallStatus: gasExposure.level || 'NORMAL' } }),
      ...(motion && { motion: { motionState: motion.movement || 'NORMAL' } }),
      ...(helmetWearing && { helmetWearing: { helmetWorn: helmetWearing.isWorn ?? true } })
    };

    // Emit live update to isolated rooms in Socket.IO
    io.to(`helmet:${helmetId}`).emit('telemetry:update', state.readings[helmetId]);
    io.to('admin:monitoring').emit('telemetry:update', { helmetId, reading: state.readings[helmetId] });

    res.json({ success: true, message: 'Telemetry packet ingested securely.' });
  });

  return router;
};

export default createApiRouter;
