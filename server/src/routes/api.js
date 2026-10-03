import express from 'express';
import { evaluateSafetyState } from '../services/safetyEngine.js';

export function createApiRouter(state, simulator, io) {
  const router = express.Router();

  // -------------------------------------------------------------
  // 1. AUTHENTICATION & SESSION ROUTES
  // -------------------------------------------------------------
  router.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Normal User Login
    if (email === 'user@arcsheild.com' || email === 'rahul@arcsheild.com' || email === 'worker@arcsheild.com' || (email && !email.includes('admin'))) {
      const user = {
        id: 'USR-101',
        name: 'Rahul Sharma',
        email: email || 'rahul.sharma@arcsheild.com',
        role: 'USER',
        trade: 'Welding',
        workshop: 'Welding Bay 01',
        assignedHelmetId: 'ARC-001',
        certification: 'Level 2 Shielded Metal Arc Welding'
      };
      return res.json({ success: true, token: 'user-token-101', user });
    }

    res.status(401).json({ success: false, error: 'Invalid user credentials.' });
  });

  router.post('/auth/register', (req, res) => {
    const { name, email, password, trade, workshop } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }

    const newUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name,
      email,
      role: 'USER',
      trade: trade || 'Welding',
      workshop: workshop || 'Main Workshop',
      assignedHelmetId: 'ARC-001',
      certification: 'Apprentice Safety Trainee'
    };

    res.status(201).json({ success: true, message: 'Account created successfully', user: newUser });
  });

  router.post('/auth/admin-login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@arcsheild.com' || email.includes('admin') || password === 'admin123') {
      const adminUser = {
        id: 'ADM-001',
        name: 'O. Sharma',
        email: email || 'admin@arcsheild.com',
        role: 'ADMIN',
        title: 'Lead Safety Directorate Officer',
        center: 'Industrial Training Institute (ITI)'
      };
      return res.json({ success: true, token: 'admin-token-001', user: adminUser });
    }

    res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
  });

  // -------------------------------------------------------------
  // 2. NORMAL USER PERSONAL DATA APIS (/api/my/*)
  // Strict Isolation: Only returns current user's helmet and readings
  // -------------------------------------------------------------
  router.get('/my/safety', (req, res) => {
    const helmetId = 'ARC-001';
    const helmet = state.helmets.find(h => h.id === 'AS-001') || state.helmets[0];
    const rawReading = state.readings['AS-001'] || state.readings[helmet.id] || {};

    // Transform to user-friendly operational readings (Zero hardware chip names)
    const personalData = {
      user: {
        name: 'Rahul Sharma',
        trade: 'Welding',
        zone: 'Welding Bay 01',
        assignedHelmetId: 'ARC-001',
        connectionStatus: helmet.connectionStatus || 'ONLINE',
        lastActive: helmet.lastSeen || new Date().toISOString()
      },
      currentConditions: {
        safetyState: rawReading.overallSafetyState || 'SAFE',
        temperature: {
          current: rawReading.temperature?.thermocoupleMax6675 || 34.2,
          ambient: rawReading.temperature?.ambientDht22 || 30.8,
          status: (rawReading.temperature?.thermocoupleMax6675 || 34) >= 44 ? 'Elevated' : 'Normal',
          trend: '+1.2°C from session start'
        },
        humidity: {
          current: rawReading.humidity?.dht22 || 62,
          status: 'Normal'
        },
        uvArcExposure: {
          state: rawReading.uvExposure?.uvState || 'NORMAL',
          levelDescription: rawReading.uvExposure?.uvState === 'HIGH' ? 'High' : rawReading.uvExposure?.uvState === 'ELEVATED' ? 'Elevated' : 'Normal',
          trend: 'Stable'
        },
        light: {
          lux: rawReading.lightLux?.lux || 420,
          status: 'Normal'
        },
        gasExposure: {
          overallState: rawReading.gasLevels?.mq7?.state === 'HIGH' ? 'HIGH' : rawReading.gasLevels?.mq7?.state === 'ELEVATED' ? 'ELEVATED' : 'NORMAL',
          combustionIndicator: rawReading.gasLevels?.mq7?.state || 'NORMAL',
          airQualityIndicator: rawReading.gasLevels?.mq135?.state || 'NORMAL',
          fumeIndicator: rawReading.gasLevels?.mq2?.state || 'NORMAL',
          fuelGasIndicator: rawReading.gasLevels?.mq5?.state || 'NORMAL'
        },
        motion: {
          status: rawReading.motion?.motionState || 'NORMAL',
          movement: rawReading.motion?.postImpactInactivity ? 'Immobile' : 'Stable',
          fallDetected: rawReading.motion?.motionState === 'FALL DETECTED'
        },
        helmetStatus: {
          state: rawReading.helmetWearing?.helmetWorn ? 'WORN' : 'REMOVED',
          isWorn: rawReading.helmetWearing?.helmetWorn ?? true,
          complianceRate: 97.6,
          sessionTimeWornMinutes: 124,
          sessionTimeRemovedMinutes: 3,
          removalCount: 1
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

  router.get('/my/alerts', (req, res) => {
    // Only return alerts for Rahul Sharma / ARC-001
    const myAlerts = state.alerts.filter(a => a.helmetId === 'AS-001' || a.workerName?.includes('Rahul') || a.workerName?.includes('Rajesh'));
    res.json({ success: true, count: myAlerts.length, data: myAlerts });
  });

  router.get('/my/history', (req, res) => {
    const myHistory = [
      { id: 'HIST-1', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), event: 'PPE Verification', description: 'Helmet worn verified in Welding Bay 01', status: 'SAFE' },
      { id: 'HIST-2', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), event: 'Exposure Normal', description: 'UV and temperature normalized following torch rest', status: 'SAFE' },
      { id: 'HIST-3', timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(), event: 'Slight Temp Warning', description: 'Exposure reached 44.5°C; 5-min cooldown taken', status: 'RESOLVED' },
      { id: 'HIST-4', timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), event: 'Session Start', description: 'Shift commenced in Welding Bay 01', status: 'SAFE' },
    ];
    res.json({ success: true, data: myHistory });
  });

  router.get('/my/analytics', (req, res) => {
    // Personal comprehensive metrics for Rahul Sharma / ARC-001
    const summary = {
      overallSafety: 'SAFE',
      prototypeSafetyScore: 94, // Labelled explicitly as Prototype Safety Score
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
  // Multi-Helmet & Multi-User Organization-Wide Monitoring
  // -------------------------------------------------------------
  router.get('/admin/overview', (req, res) => {
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
        compliancePercent: state.activeSession?.overallCompliancePercent || 95.8,
        avgResponseSec: 18
      }
    });
  });

  router.get('/admin/helmets', (req, res) => {
    res.json({ success: true, data: state.helmets });
  });

  router.get('/admin/users', (req, res) => {
    res.json({ success: true, data: state.workers });
  });

  router.get('/admin/live', (req, res) => {
    res.json({
      success: true,
      data: {
        helmets: state.helmets,
        readings: state.readings
      }
    });
  });

  router.get('/admin/alerts', (req, res) => {
    res.json({ success: true, data: state.alerts });
  });

  router.patch('/admin/alerts/:id/lifecycle', (req, res) => {
    const { id } = req.params;
    const { status, note, supervisorAction } = req.body;
    const alert = state.alerts.find(a => a.id === id);
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });

    alert.lifecycleStatus = status;
    if (supervisorAction) alert.supervisorAction = supervisorAction;
    alert.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Admin updated status to ${status}`
    });

    if (status === 'RESOLVED') {
      alert.responseDurationSeconds = 18;
    }

    simulator.broadcastAll();
    res.json({ success: true, data: alert });
  });

  router.get('/admin/incidents', (req, res) => {
    res.json({ success: true, data: state.incidents });
  });

  router.post('/admin/incidents', (req, res) => {
    const { type, workerName, trade, workshopZone, description, supervisorAction, severity } = req.body;
    const newInc = {
      id: `INC-2026-${String(simulator.incidentCounter++).padStart(3, '0')}`,
      type: type || 'NEAR_MISS',
      timestamp: new Date().toISOString(),
      workerName: workerName || 'Trainee',
      trade: trade || 'Welding',
      workshopZone: workshopZone || 'Main Workshop',
      severity: severity || 'MEDIUM',
      description: description || 'Safety event logged',
      supervisorAction: supervisorAction || 'Investigated by supervisor',
      status: 'OPEN',
      resolution: 'Under review',
      responseTimeSeconds: 15
    };
    state.incidents.unshift(newInc);
    simulator.broadcastAll();
    res.status(201).json({ success: true, data: newInc });
  });

  router.get('/admin/reports/session-summary', (req, res) => {
    res.json({
      success: true,
      data: {
        reportId: `RPT-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        session: state.activeSession,
        monitoredWorkersCount: state.workers.length,
        safetyMetrics: {
          totalAlerts: state.alerts.length,
          criticalAlertsCount: state.alerts.filter(a => a.severity === 'CRITICAL').length,
          warningsCount: state.alerts.filter(a => a.severity === 'WARNING').length,
          incidentsCount: state.incidents.filter(i => i.type === 'INCIDENT').length,
          nearMissesCount: state.incidents.filter(i => i.type === 'NEAR_MISS').length,
          overallCompliance: Math.min(100, state.activeSession?.overallCompliancePercent || 95.8),
          averageSupervisorResponseSeconds: 18
        },
        auditSignOff: {
          supervisor: 'O. Sharma (Lead Safety Officer)',
          center: 'Industrial Training Institute (ITI)',
          status: 'CERTIFIED_VERIFIED'
        }
      }
    });
  });

  return router;
}
