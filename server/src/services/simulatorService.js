import { evaluateSafetyState } from './safetyEngine.js';

export class SimulatorService {
  constructor(state, io) {
    this.state = state;
    this.io = io;
    this.activeInterval = null;
    this.alertCounter = 1093;
    this.incidentCounter = 4;
    this.timelineCounter = 8;
  }

  startBackgroundSimulation() {
    if (this.activeInterval) clearInterval(this.activeInterval);
    
    // Background telemetry jitter
    this.activeInterval = setInterval(() => {
      this.tickTelemetryJitter();
    }, 3000);
  }

  tickTelemetryJitter() {
    const helmets = this.state.helmets;
    const readings = this.state.readings;

    helmets.forEach((helmet) => {
      if (helmet.connectionStatus !== 'ONLINE') return;

      const r = readings[helmet.id];
      if (!r) return;

      // Realistic fluctuations
      if (r.temperature) {
        const drift = (Math.random() - 0.5) * 0.4;
        if (typeof r.temperature.thermocoupleMax6675 === 'number') {
          r.temperature.thermocoupleMax6675 = +(r.temperature.thermocoupleMax6675 + drift).toFixed(1);
        }
        if (typeof r.temperature.ambientDht22 === 'number') {
          r.temperature.ambientDht22 = +(r.temperature.ambientDht22 + (Math.random() - 0.5) * 0.2).toFixed(1);
        }
        if (typeof r.temperature.objectC === 'number') {
          r.temperature.objectC = +(r.temperature.objectC + drift).toFixed(1);
        }
      }

      if (r.humidity && typeof r.humidity.dht22 === 'number') {
        r.humidity.dht22 = +(r.humidity.dht22 + (Math.random() - 0.5) * 0.3).toFixed(1);
      } else if (r.humidity && typeof r.humidity.relativePercent === 'number') {
        r.humidity.relativePercent = +(r.humidity.relativePercent + (Math.random() - 0.5) * 0.3).toFixed(1);
      }

      if (r.lightLux && r.lightLux.lightState === 'NORMAL' && typeof r.lightLux.lux === 'number') {
        r.lightLux.lux = Math.round(r.lightLux.lux + (Math.random() - 0.5) * 40);
      }

      if (r.motion && r.motion.motionState === 'NORMAL') {
        if (!r.motion.accel) r.motion.accel = { magnitudeG: 0.98 };
        if (!r.motion.orientation) r.motion.orientation = { pitch: 0, roll: 0 };
        r.motion.accel.magnitudeG = +(0.98 + (Math.random() - 0.5) * 0.04).toFixed(2);
        r.motion.orientation.pitch = +((r.motion.orientation.pitch || 0) + (Math.random() - 0.5) * 0.5).toFixed(1);
      }

      r.timestamp = new Date().toISOString();
      helmet.lastSeen = r.timestamp;

      const evalResult = evaluateSafetyState(r, helmet);
      r.overallSafetyState = evalResult.overallSafetyState;
    });

    // Update active session duration & compliance stats
    if (this.state.activeSession && this.state.activeSession.status === 'IN_PROGRESS') {
      const activeHelmets = helmets.filter(h => h.connectionStatus === 'ONLINE');
      const activeCount = activeHelmets.length;
      this.state.activeSession.activeHelmetsCount = activeCount;
      
      const compliantCount = activeHelmets.filter(h => readings[h.id]?.helmetWearing?.helmetWorn).length;
      const ratio = activeCount > 0 ? (compliantCount / activeCount) * 100 : 100;
      this.state.activeSession.overallCompliancePercent = +(Math.min(100, Math.max(0, ratio))).toFixed(1);
    }

    if (this.io) {
      this.io.emit('telemetry:batch', {
        readings: this.state.readings,
        helmets: this.state.helmets,
        activeSession: this.state.activeSession
      });
    }
  }

  triggerScenario(scenarioType, targetHelmetId = 'AS-004') {
    const helmet = this.state.helmets.find(h => h.id === targetHelmetId) || this.state.helmets[0];
    const r = this.state.readings[helmet.id];
    if (!r) return null;

    const timestamp = new Date().toISOString();
    let generatedAlert = null;
    let generatedNearMissOrIncident = null;

    switch (scenarioType) {
      case 'NORMAL_WELDING': {
        helmet.connectionStatus = 'ONLINE';
        r.temperature.thermocoupleMax6675 = 34.2;
        r.temperature.ambientDht22 = 30.8;
        r.temperature.thermalExposureState = 'NORMAL';
        r.humidity.dht22 = 61.5;
        r.uvExposure.uvRawMv = 150;
        r.uvExposure.uvLevel = 1.2;
        r.uvExposure.uvState = 'NORMAL';
        r.lightLux.lux = 1250;
        r.gasLevels.mq2.state = 'NORMAL';
        r.gasLevels.mq5.state = 'NORMAL';
        r.gasLevels.mq7.state = 'NORMAL';
        r.gasLevels.mq135.state = 'NORMAL';
        r.motion.motionState = 'NORMAL';
        r.motion.impactDetected = false;
        r.motion.postImpactInactivity = false;
        r.motion.accel = { x: 0.08, y: 0.12, z: 0.98, magnitudeG: 0.99 };
        r.helmetWearing.helmetWorn = true;
        r.helmetWearing.helmetState = 'HELMET WORN';
        r.overallSafetyState = 'SAFE';

        this.addTimelineEvent({
          helmetId: helmet.id,
          eventType: 'CONDITIONS_NORMAL',
          message: `${helmet.assignedWorkerName} (${helmet.id}) safety conditions stabilized in ${helmet.workshopZone}.`,
          severity: 'INFO'
        });
        break;
      }

      case 'HIGH_UV': {
        r.uvExposure.uvRawMv = 780;
        r.uvExposure.uvLevel = 8.6;
        r.uvExposure.uvState = 'HIGH';
        r.temperature.thermocoupleMax6675 = 44.5;
        r.overallSafetyState = 'CRITICAL';

        generatedAlert = {
          id: `ALT-${this.alertCounter++}`,
          timestamp,
          helmetId: helmet.id,
          workerName: helmet.assignedWorkerName,
          trade: helmet.trade,
          workshopZone: helmet.workshopZone,
          severity: 'CRITICAL',
          category: 'UV_ARC_EXPOSURE',
          title: 'High Arc Flash / UV Exposure Warning',
          message: 'Direct unshielded ultraviolet radiation detected exceeding workplace safe exposure limits.',
          sensorSource: 'UV / Arc Radiation Monitor',
          value: 'Exposure: High (Level 8.6)',
          lifecycleStatus: 'ACTIVE',
          timeline: [
            { status: 'ACTIVE', timestamp, note: 'Intense arc flash detected in work zone' }
          ],
          responseDurationSeconds: null,
          supervisorAction: null
        };

        generatedNearMissOrIncident = {
          id: `INC-2026-${String(this.incidentCounter++).padStart(3, '0')}`,
          type: 'NEAR_MISS',
          timestamp,
          helmetId: helmet.id,
          workerName: helmet.assignedWorkerName,
          trade: helmet.trade,
          workshopZone: helmet.workshopZone,
          eventType: 'UNSHIELDED_ARC_EXPOSURE',
          severity: 'HIGH',
          sensorSource: 'Optical Exposure Monitor',
          description: 'High UV intensity recorded during welding torch operation without adequate side baffling.',
          supervisorAction: 'Wearer alerted by local buzzer; supervisor checking booth curtains.',
          status: 'OPEN',
          resolution: 'Pending investigation',
          responseTimeSeconds: null,
          durationMinutes: 0
        };

        this.addTimelineEvent({
          helmetId: helmet.id,
          eventType: 'HIGH_UV_EXPOSURE',
          message: `Elevated arc flash exposure (Level 8.6) detected in ${helmet.workshopZone}`,
          severity: 'CRITICAL'
        });
        break;
      }

      case 'GAS_EXPOSURE': {
        r.gasLevels.mq7.state = 'HIGH';
        r.gasLevels.mq7.relativeIndex = 'High';
        r.gasLevels.mq135.state = 'ELEVATED';
        r.gasLevels.mq135.relativeIndex = 'Elevated';
        r.overallSafetyState = 'WARNING';

        generatedAlert = {
          id: `ALT-${this.alertCounter++}`,
          timestamp,
          helmetId: helmet.id,
          workerName: helmet.assignedWorkerName,
          trade: helmet.trade,
          workshopZone: helmet.workshopZone,
          severity: 'WARNING',
          category: 'GAS_EXPOSURE',
          title: 'Elevated Fume & Combustion Gas Buildup',
          message: 'Elevated relative gas byproduct concentrations detected in the active workshop zone.',
          sensorSource: 'Gas Exposure Monitor',
          value: 'CO State: HIGH | Air Quality: ELEVATED',
          lifecycleStatus: 'ACTIVE',
          timeline: [
            { status: 'ACTIVE', timestamp, note: 'Gas exposure threshold reached' }
          ],
          responseDurationSeconds: null,
          supervisorAction: null
        };

        generatedNearMissOrIncident = {
          id: `INC-2026-${String(this.incidentCounter++).padStart(3, '0')}`,
          type: 'NEAR_MISS',
          timestamp,
          helmetId: helmet.id,
          workerName: helmet.assignedWorkerName,
          trade: helmet.trade,
          workshopZone: helmet.workshopZone,
          eventType: 'GAS_BUILDUP_NEAR_MISS',
          severity: 'MEDIUM',
          sensorSource: 'Gas Exposure Monitor',
          description: 'Fume extraction airflow reduced; combustion byproduct concentration reached HIGH state.',
          supervisorAction: 'Exhaust speed increased; supervisor dispatched to verify airflow.',
          status: 'OPEN',
          resolution: 'Pending ventilation clearance',
          responseTimeSeconds: null,
          durationMinutes: 0
        };

        this.addTimelineEvent({
          helmetId: helmet.id,
          eventType: 'GAS_EXPOSURE_WARNING',
          message: `Elevated gas exposure state detected in ${helmet.workshopZone}`,
          severity: 'WARNING'
        });
        break;
      }

      case 'HELMET_REMOVED': {
        r.helmetWearing.helmetWorn = false;
        r.helmetWearing.helmetState = 'HELMET REMOVED';
        helmet.metrics.removalCount += 1;
        helmet.metrics.sessionTimeRemovedSeconds += 60;
        helmet.metrics.compliancePercent = Math.max(70, +(helmet.metrics.compliancePercent - 4.5).toFixed(1));
        r.overallSafetyState = 'WARNING';

        generatedAlert = {
          id: `ALT-${this.alertCounter++}`,
          timestamp,
          helmetId: helmet.id,
          workerName: helmet.assignedWorkerName,
          trade: helmet.trade,
          workshopZone: helmet.workshopZone,
          severity: 'WARNING',
          category: 'PPE_COMPLIANCE',
          title: 'PPE Violation: Helmet Removed',
          message: 'Safety helmet was unclasped/removed while worker was inside an active training zone.',
          sensorSource: 'Optical Wearing Sensor',
          value: 'HELMET REMOVED',
          lifecycleStatus: 'ACTIVE',
          timeline: [
            { status: 'ACTIVE', timestamp, note: 'Wearing sensor state changed to REMOVED' }
          ],
          responseDurationSeconds: null,
          supervisorAction: null
        };

        this.addTimelineEvent({
          helmetId: helmet.id,
          eventType: 'HELMET_REMOVED',
          message: `Helmet removed by ${helmet.assignedWorkerName} in ${helmet.workshopZone}`,
          severity: 'WARNING'
        });
        break;
      }

      case 'FALL_DETECTED': {
        r.motion.accel = { x: 2.1, y: 1.8, z: 2.6, magnitudeG: 3.65 };
        r.motion.gyro = { x: 12.4, y: 18.2, z: 8.9 };
        r.motion.orientation = { pitch: 84.5, roll: 72.1 };
        r.motion.impactDetected = true;
        r.motion.postImpactInactivity = true;
        r.motion.motionState = 'FALL DETECTED';
        r.overallSafetyState = 'CRITICAL';

        generatedAlert = {
          id: `ALT-${this.alertCounter++}`,
          timestamp,
          helmetId: helmet.id,
          workerName: helmet.assignedWorkerName,
          trade: helmet.trade,
          workshopZone: helmet.workshopZone,
          severity: 'CRITICAL',
          category: 'FALL_IMPACT',
          title: 'CRITICAL: Worker Fall Detected',
          message: `Sudden impact followed by severe tilt angle and complete inactivity detected in ${helmet.workshopZone}.`,
          sensorSource: 'Motion Tracking & Impact Detection',
          value: 'Impact: High | Inactivity: Confirmed',
          lifecycleStatus: 'ACTIVE',
          timeline: [
            { status: 'ACTIVE', timestamp, note: 'High deceleration impact registered' }
          ],
          responseDurationSeconds: null,
          supervisorAction: null
        };

        generatedNearMissOrIncident = {
          id: `INC-2026-${String(this.incidentCounter++).padStart(3, '0')}`,
          type: 'INCIDENT',
          timestamp,
          helmetId: helmet.id,
          workerName: helmet.assignedWorkerName,
          trade: helmet.trade,
          workshopZone: helmet.workshopZone,
          eventType: 'FALL_DETECTED',
          severity: 'CRITICAL',
          sensorSource: 'Motion Tracking System',
          description: `Worker ${helmet.assignedWorkerName} suffered a sudden impact with immobility in ${helmet.workshopZone}.`,
          supervisorAction: 'Immediate dispatch of workshop first-responder required.',
          status: 'OPEN',
          resolution: 'Under active emergency response',
          responseTimeSeconds: null,
          durationMinutes: 0
        };

        this.addTimelineEvent({
          helmetId: helmet.id,
          eventType: 'FALL_DETECTED',
          message: `CRITICAL: Fall and worker immobility detected for ${helmet.assignedWorkerName} in ${helmet.workshopZone}`,
          severity: 'CRITICAL'
        });
        break;
      }

      case 'OFFLINE_SYNC': {
        const target = this.state.helmets.find(h => h.id === 'AS-008') || helmet;
        const targetR = this.state.readings[target.id];
        
        target.connectionStatus = 'SYNCING';
        targetR.sdCard.syncStatus = 'SYNCING';

        this.addTimelineEvent({
          helmetId: target.id,
          eventType: 'DEVICE_SYNCING',
          message: `Device ${target.id} reconnected. Offline buffered records syncing to console.`,
          severity: 'INFO'
        });

        setTimeout(() => {
          target.connectionStatus = 'ONLINE';
          targetR.sdCard.syncStatus = 'ONLINE';
          targetR.sdCard.offlineRecordsQueued = 0;
          targetR.overallSafetyState = 'SAFE';
          targetR.location.gpsFix = 'FIXED';
          target.lastSeen = new Date().toISOString();

          this.addTimelineEvent({
            helmetId: target.id,
            eventType: 'SYNC_COMPLETE',
            message: `Device ${target.id} synchronization complete (all offline records synced).`,
            severity: 'INFO'
          });

          this.broadcastAll();
        }, 2500);
        break;
      }

      case 'RESET_ALL_SAFE': {
        this.state.helmets.forEach(h => {
          if (h.id !== 'AS-008') h.connectionStatus = 'ONLINE';
          const hr = this.state.readings[h.id];
          if (hr) {
            hr.uvExposure.uvState = 'NORMAL';
            hr.uvExposure.uvLevel = 1.0;
            hr.uvExposure.uvRawMv = 120;
            hr.gasLevels.mq2.state = 'NORMAL';
            hr.gasLevels.mq5.state = 'NORMAL';
            hr.gasLevels.mq7.state = 'NORMAL';
            hr.gasLevels.mq135.state = 'NORMAL';
            hr.motion.motionState = 'NORMAL';
            hr.motion.impactDetected = false;
            hr.motion.postImpactInactivity = false;
            hr.helmetWearing.helmetWorn = true;
            hr.overallSafetyState = h.connectionStatus === 'OFFLINE' ? 'OFFLINE' : 'SAFE';
          }
        });

        this.state.alerts.forEach(a => {
          if (a.lifecycleStatus === 'ACTIVE' || a.lifecycleStatus === 'INVESTIGATING') {
            a.lifecycleStatus = 'RESOLVED';
            a.timeline.push({
              status: 'RESOLVED',
              timestamp: new Date().toISOString(),
              note: 'Supervisor manually cleared and verified normal conditions'
            });
          }
        });

        this.addTimelineEvent({
          helmetId: 'ALL',
          eventType: 'SUPERVISOR_RESET',
          message: 'Supervisor verified normal workshop safety conditions.',
          severity: 'INFO'
        });
        break;
      }
    }

    if (generatedAlert) {
      this.state.alerts.unshift(generatedAlert);
      if (this.state.activeSession) this.state.activeSession.totalWarnings += (generatedAlert.severity === 'WARNING' ? 1 : 0);
      if (this.state.activeSession && generatedAlert.severity === 'CRITICAL') this.state.activeSession.totalCritical += 1;
    }

    if (generatedNearMissOrIncident) {
      this.state.incidents.unshift(generatedNearMissOrIncident);
      if (this.state.activeSession && generatedNearMissOrIncident.type === 'NEAR_MISS') this.state.activeSession.totalNearMisses += 1;
    }

    this.broadcastAll();
    return { alert: generatedAlert, incident: generatedNearMissOrIncident };
  }

  addTimelineEvent({ helmetId, eventType, message, severity }) {
    const event = {
      id: `TL-${this.timelineCounter++}`,
      timestamp: new Date().toISOString(),
      helmetId,
      eventType,
      message,
      severity
    };
    this.state.timeline.unshift(event);
    if (this.state.timeline.length > 50) this.state.timeline.pop();
    if (this.io) this.io.emit('timeline:new', event);
  }

  broadcastAll() {
    if (!this.io) return;
    this.io.emit('state:full', {
      helmets: this.state.helmets,
      readings: this.state.readings,
      alerts: this.state.alerts,
      incidents: this.state.incidents,
      timeline: this.state.timeline,
      activeSession: this.state.activeSession
    });
  }
}
