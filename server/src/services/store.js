/**
 * ArcShield Data Store & State Manager
 * 
 * Hardware-Constrained Data Model for Smart Connected Safety Gear:
 * - ESP32-S3 DevKit N16R8
 * - MAX6675 + K-Type Thermocouple (Thermocouple Exposure Temp)
 * - DHT22 (Ambient Temp + Humidity)
 * - GUVA-S12SD (UV / Arc Exposure Index & State)
 * - BH1750 (Ambient & Workshop Lighting Lux)
 * - MQ-2 (Smoke / Combustible gas relative level)
 * - MQ-5 (LPG / Natural-gas relative level)
 * - MQ-7 (CO-related relative level)
 * - MQ-135 (General Air Quality / gas relative level)
 * - MPU6050 (6-DOF Accelerometer & Gyroscope -> Fall / Impact / Orientation / Inactivity)
 * - TCRT5000 (2-Channel IR Reflective -> Helmet Worn / Removed Detection)
 * - NEO-6M (GPS Latitude, Longitude, Speed, Workshop Zone)
 * - MicroSD Card (Local storage & offline sync queue)
 * - Local Annunciator (1602 LCD, 7-Color LED, Active Buzzer, Vibration Motor)
 */

export const INITIAL_WORKERS = [
  { id: 'W-101', name: 'Rajesh Sharma', trade: 'Welding', batch: 'W-2026-B1', status: 'ACTIVE', certLevel: 'Level 2 Shielded Metal Arc' },
  { id: 'W-102', name: 'Amit Kumar Verma', trade: 'Welding', batch: 'W-2026-B1', status: 'ACTIVE', certLevel: 'Level 3 GTAW / TIG' },
  { id: 'W-103', name: 'Pooja Sundaram', trade: 'Electrical', batch: 'E-2026-A2', status: 'ACTIVE', certLevel: 'Industrial High Voltage Safety' },
  { id: 'W-104', name: 'Vikas Patel', trade: 'Welding', batch: 'W-2026-B1', status: 'ACTIVE', certLevel: 'Level 1 Oxy-Fuel / MIG' },
  { id: 'W-105', name: 'Sunil Rao', trade: 'Electrical', batch: 'E-2026-A2', status: 'ACTIVE', certLevel: 'Substation Panel Wiring' },
  { id: 'W-106', name: 'Deepak Joshi', trade: 'Welding', batch: 'W-2026-B2', status: 'ACTIVE', certLevel: 'Level 2 Structural Welding' },
  { id: 'W-107', name: 'Ananya Deshmukh', trade: 'Electrical', batch: 'E-2026-A1', status: 'ACTIVE', certLevel: 'Transformer Maintenance' },
  { id: 'W-108', name: 'Manish Rawat', trade: 'Welding', batch: 'W-2026-B2', status: 'STANDBY', certLevel: 'Level 1 Apprentice' },
];

export const INITIAL_HELMETS = [
  {
    id: 'AS-001',
    serialNumber: 'ARC-ESP32S3-2026-001',
    firmwareVersion: 'v1.4.2-prod',
    assignedWorkerId: 'W-101',
    assignedWorkerName: 'Rajesh Sharma',
    trade: 'Welding',
    workshopZone: 'Welding Bay 1',
    connectionStatus: 'ONLINE', // ONLINE, OFFLINE, SYNCING, DEGRADED
    lastSeen: new Date().toISOString(),
    hardware: {
      mcu: 'ESP32-S3 N16R8',
      tcrt5000: 'OK',
      mpu6050: 'OK',
      max6675: 'OK',
      dht22: 'OK',
      guvaS12sd: 'OK',
      bh1750: 'OK',
      mqSensors: 'OK',
      neo6mGps: 'OK',
      microSd: 'LOGGING_ACTIVE',
      lcd1602: 'OK',
      annunciator: 'READY'
    },
    metrics: {
      sessionTimeWornSeconds: 7420,
      sessionTimeRemovedSeconds: 180,
      removalCount: 1,
      compliancePercent: 97.6
    }
  },
  {
    id: 'AS-002',
    serialNumber: 'ARC-ESP32S3-2026-002',
    firmwareVersion: 'v1.4.2-prod',
    assignedWorkerId: 'W-102',
    assignedWorkerName: 'Amit Kumar Verma',
    trade: 'Welding',
    workshopZone: 'Welding Bay 2',
    connectionStatus: 'ONLINE',
    lastSeen: new Date().toISOString(),
    hardware: {
      mcu: 'ESP32-S3 N16R8',
      tcrt5000: 'OK',
      mpu6050: 'OK',
      max6675: 'OK',
      dht22: 'OK',
      guvaS12sd: 'OK',
      bh1750: 'OK',
      mqSensors: 'OK',
      neo6mGps: 'OK',
      microSd: 'LOGGING_ACTIVE',
      lcd1602: 'OK',
      annunciator: 'READY'
    },
    metrics: {
      sessionTimeWornSeconds: 6980,
      sessionTimeRemovedSeconds: 420,
      removalCount: 2,
      compliancePercent: 94.3
    }
  },
  {
    id: 'AS-003',
    serialNumber: 'ARC-ESP32S3-2026-003',
    firmwareVersion: 'v1.4.2-prod',
    assignedWorkerId: 'W-103',
    assignedWorkerName: 'Pooja Sundaram',
    trade: 'Electrical',
    workshopZone: 'Electrical Lab A',
    connectionStatus: 'ONLINE',
    lastSeen: new Date().toISOString(),
    hardware: {
      mcu: 'ESP32-S3 N16R8',
      tcrt5000: 'OK',
      mpu6050: 'OK',
      max6675: 'OK',
      dht22: 'OK',
      guvaS12sd: 'OK',
      bh1750: 'OK',
      mqSensors: 'OK',
      neo6mGps: 'OK',
      microSd: 'LOGGING_ACTIVE',
      lcd1602: 'OK',
      annunciator: 'READY'
    },
    metrics: {
      sessionTimeWornSeconds: 7500,
      sessionTimeRemovedSeconds: 60,
      removalCount: 1,
      compliancePercent: 99.2
    }
  },
  {
    id: 'AS-004',
    serialNumber: 'ARC-ESP32S3-2026-004',
    firmwareVersion: 'v1.4.2-prod',
    assignedWorkerId: 'W-104',
    assignedWorkerName: 'Vikas Patel',
    trade: 'Welding',
    workshopZone: 'Welding Bay 3',
    connectionStatus: 'ONLINE',
    lastSeen: new Date().toISOString(),
    hardware: {
      mcu: 'ESP32-S3 N16R8',
      tcrt5000: 'OK',
      mpu6050: 'OK',
      max6675: 'OK',
      dht22: 'OK',
      guvaS12sd: 'OK',
      bh1750: 'OK',
      mqSensors: 'OK',
      neo6mGps: 'OK',
      microSd: 'LOGGING_ACTIVE',
      lcd1602: 'OK',
      annunciator: 'READY'
    },
    metrics: {
      sessionTimeWornSeconds: 6100,
      sessionTimeRemovedSeconds: 890,
      removalCount: 3,
      compliancePercent: 87.2
    }
  },
  {
    id: 'AS-005',
    serialNumber: 'ARC-ESP32S3-2026-005',
    firmwareVersion: 'v1.4.2-prod',
    assignedWorkerId: 'W-105',
    assignedWorkerName: 'Sunil Rao',
    trade: 'Electrical',
    workshopZone: 'Transformer Yard B',
    connectionStatus: 'ONLINE',
    lastSeen: new Date().toISOString(),
    hardware: {
      mcu: 'ESP32-S3 N16R8',
      tcrt5000: 'OK',
      mpu6050: 'OK',
      max6675: 'OK',
      dht22: 'OK',
      guvaS12sd: 'OK',
      bh1750: 'OK',
      mqSensors: 'OK',
      neo6mGps: 'OK',
      microSd: 'LOGGING_ACTIVE',
      lcd1602: 'OK',
      annunciator: 'READY'
    },
    metrics: {
      sessionTimeWornSeconds: 7200,
      sessionTimeRemovedSeconds: 120,
      removalCount: 1,
      compliancePercent: 98.4
    }
  },
  {
    id: 'AS-006',
    serialNumber: 'ARC-ESP32S3-2026-006',
    firmwareVersion: 'v1.4.2-prod',
    assignedWorkerId: 'W-106',
    assignedWorkerName: 'Deepak Joshi',
    trade: 'Welding',
    workshopZone: 'Welding Bay 4',
    connectionStatus: 'ONLINE',
    lastSeen: new Date().toISOString(),
    hardware: {
      mcu: 'ESP32-S3 N16R8',
      tcrt5000: 'OK',
      mpu6050: 'OK',
      max6675: 'OK',
      dht22: 'OK',
      guvaS12sd: 'OK',
      bh1750: 'OK',
      mqSensors: 'OK',
      neo6mGps: 'OK',
      microSd: 'LOGGING_ACTIVE',
      lcd1602: 'OK',
      annunciator: 'READY'
    },
    metrics: {
      sessionTimeWornSeconds: 7050,
      sessionTimeRemovedSeconds: 310,
      removalCount: 2,
      compliancePercent: 95.8
    }
  },
  {
    id: 'AS-007',
    serialNumber: 'ARC-ESP32S3-2026-007',
    firmwareVersion: 'v1.4.2-prod',
    assignedWorkerId: 'W-107',
    assignedWorkerName: 'Ananya Deshmukh',
    trade: 'Electrical',
    workshopZone: 'Electrical Lab B',
    connectionStatus: 'ONLINE',
    lastSeen: new Date().toISOString(),
    hardware: {
      mcu: 'ESP32-S3 N16R8',
      tcrt5000: 'OK',
      mpu6050: 'OK',
      max6675: 'OK',
      dht22: 'OK',
      guvaS12sd: 'OK',
      bh1750: 'OK',
      mqSensors: 'OK',
      neo6mGps: 'OK',
      microSd: 'LOGGING_ACTIVE',
      lcd1602: 'OK',
      annunciator: 'READY'
    },
    metrics: {
      sessionTimeWornSeconds: 7300,
      sessionTimeRemovedSeconds: 150,
      removalCount: 1,
      compliancePercent: 98.0
    }
  },
  {
    id: 'AS-008',
    serialNumber: 'ARC-ESP32S3-2026-008',
    firmwareVersion: 'v1.4.1-maint',
    assignedWorkerId: 'W-108',
    assignedWorkerName: 'Manish Rawat',
    trade: 'Welding',
    workshopZone: 'Storage & Staging',
    connectionStatus: 'OFFLINE', // Demonstrates offline status
    lastSeen: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    hardware: {
      mcu: 'ESP32-S3 N16R8',
      tcrt5000: 'OK',
      mpu6050: 'OK',
      max6675: 'OK',
      dht22: 'OK',
      guvaS12sd: 'OK',
      bh1750: 'OK',
      mqSensors: 'OK',
      neo6mGps: 'NO_SIGNAL',
      microSd: 'IDLE',
      lcd1602: 'OK',
      annunciator: 'READY'
    },
    metrics: {
      sessionTimeWornSeconds: 1200,
      sessionTimeRemovedSeconds: 6200,
      removalCount: 1,
      compliancePercent: 16.2
    }
  }
];

export const INITIAL_READINGS = {
  'AS-001': {
    helmetId: 'AS-001',
    timestamp: new Date().toISOString(),
    temperature: {
      thermocoupleMax6675: 34.2,
      ambientDht22: 30.8,
      unit: '°C',
      thermalExposureState: 'NORMAL' // NORMAL, ELEVATED, HIGH, CRITICAL
    },
    humidity: {
      dht22: 61.5,
      unit: '%'
    },
    uvExposure: {
      sensor: 'GUVA-S12SD',
      uvRawMv: 145,
      uvLevel: 1.2,
      uvState: 'NORMAL' // NORMAL, ELEVATED, HIGH
    },
    lightLux: {
      sensor: 'BH1750',
      lux: 1240,
      lightState: 'NORMAL' // DIM, NORMAL, HIGH_INTENSITY
    },
    gasLevels: {
      mq2: { label: 'Smoke / Combustible', state: 'NORMAL', relativeIndex: 'Low' },
      mq5: { label: 'LPG / Natural Gas', state: 'NORMAL', relativeIndex: 'Low' },
      mq7: { label: 'CO Indicator', state: 'NORMAL', relativeIndex: 'Low' },
      mq135: { label: 'General Air Quality', state: 'NORMAL', relativeIndex: 'Low' }
    },
    motion: {
      sensor: 'MPU6050',
      accel: { x: 0.08, y: 0.12, z: 0.98, magnitudeG: 0.99 },
      gyro: { x: 1.2, y: 0.8, z: 0.4 },
      orientation: { pitch: 4.2, roll: -1.8 },
      impactDetected: false,
      postImpactInactivity: false,
      motionState: 'NORMAL' // NORMAL, UNUSUAL MOTION, IMPACT, POSSIBLE FALL, FALL DETECTED
    },
    helmetWearing: {
      sensor: 'TCRT5000',
      helmetWorn: true,
      helmetState: 'HELMET WORN' // HELMET WORN, HELMET REMOVED, UNKNOWN
    },
    location: {
      sensor: 'NEO-6M GPS',
      latitude: 19.123845,
      longitude: 72.836124,
      altitudeMeters: 28.4,
      speedKmph: 0.0,
      gpsFix: 'FIXED',
      workshopZone: 'Welding Bay 1'
    },
    sdCard: {
      present: true,
      loggingActive: true,
      offlineRecordsQueued: 0,
      syncStatus: 'ONLINE'
    },
    overallSafetyState: 'SAFE' // SAFE, WARNING, CRITICAL, OFFLINE
  },
  'AS-002': {
    helmetId: 'AS-002',
    timestamp: new Date().toISOString(),
    temperature: {
      thermocoupleMax6675: 41.6,
      ambientDht22: 32.4,
      unit: '°C',
      thermalExposureState: 'ELEVATED'
    },
    humidity: {
      dht22: 58.2,
      unit: '%'
    },
    uvExposure: {
      sensor: 'GUVA-S12SD',
      uvRawMv: 380,
      uvLevel: 4.2,
      uvState: 'NORMAL'
    },
    lightLux: {
      sensor: 'BH1750',
      lux: 2150,
      lightState: 'NORMAL'
    },
    gasLevels: {
      mq2: { label: 'Smoke / Combustible', state: 'NORMAL', relativeIndex: 'Low' },
      mq5: { label: 'LPG / Natural Gas', state: 'NORMAL', relativeIndex: 'Low' },
      mq7: { label: 'CO Indicator', state: 'NORMAL', relativeIndex: 'Low' },
      mq135: { label: 'General Air Quality', state: 'NORMAL', relativeIndex: 'Low' }
    },
    motion: {
      sensor: 'MPU6050',
      accel: { x: 0.15, y: -0.22, z: 0.95, magnitudeG: 0.98 },
      gyro: { x: 3.4, y: -2.1, z: 1.1 },
      orientation: { pitch: 8.5, roll: -3.2 },
      impactDetected: false,
      postImpactInactivity: false,
      motionState: 'NORMAL'
    },
    helmetWearing: {
      sensor: 'TCRT5000',
      helmetWorn: true,
      helmetState: 'HELMET WORN'
    },
    location: {
      sensor: 'NEO-6M GPS',
      latitude: 19.123912,
      longitude: 72.836208,
      altitudeMeters: 28.5,
      speedKmph: 0.0,
      gpsFix: 'FIXED',
      workshopZone: 'Welding Bay 2'
    },
    sdCard: {
      present: true,
      loggingActive: true,
      offlineRecordsQueued: 0,
      syncStatus: 'ONLINE'
    },
    overallSafetyState: 'SAFE'
  },
  'AS-003': {
    helmetId: 'AS-003',
    timestamp: new Date().toISOString(),
    temperature: {
      thermocoupleMax6675: 29.5,
      ambientDht22: 28.1,
      unit: '°C',
      thermalExposureState: 'NORMAL'
    },
    humidity: {
      dht22: 54.0,
      unit: '%'
    },
    uvExposure: {
      sensor: 'GUVA-S12SD',
      uvRawMv: 60,
      uvLevel: 0.4,
      uvState: 'NORMAL'
    },
    lightLux: {
      sensor: 'BH1750',
      lux: 890,
      lightState: 'NORMAL'
    },
    gasLevels: {
      mq2: { label: 'Smoke / Combustible', state: 'NORMAL', relativeIndex: 'Low' },
      mq5: { label: 'LPG / Natural Gas', state: 'NORMAL', relativeIndex: 'Low' },
      mq7: { label: 'CO Indicator', state: 'NORMAL', relativeIndex: 'Low' },
      mq135: { label: 'General Air Quality', state: 'NORMAL', relativeIndex: 'Low' }
    },
    motion: {
      sensor: 'MPU6050',
      accel: { x: 0.02, y: 0.04, z: 0.99, magnitudeG: 0.99 },
      gyro: { x: 0.4, y: 0.2, z: 0.1 },
      orientation: { pitch: 1.2, roll: 0.5 },
      impactDetected: false,
      postImpactInactivity: false,
      motionState: 'NORMAL'
    },
    helmetWearing: {
      sensor: 'TCRT5000',
      helmetWorn: true,
      helmetState: 'HELMET WORN'
    },
    location: {
      sensor: 'NEO-6M GPS',
      latitude: 19.124105,
      longitude: 72.835980,
      altitudeMeters: 29.1,
      speedKmph: 0.0,
      gpsFix: 'FIXED',
      workshopZone: 'Electrical Lab A'
    },
    sdCard: {
      present: true,
      loggingActive: true,
      offlineRecordsQueued: 0,
      syncStatus: 'ONLINE'
    },
    overallSafetyState: 'SAFE'
  },
  'AS-004': {
    helmetId: 'AS-004',
    timestamp: new Date().toISOString(),
    temperature: {
      thermocoupleMax6675: 33.1,
      ambientDht22: 30.2,
      unit: '°C',
      thermalExposureState: 'NORMAL'
    },
    humidity: {
      dht22: 60.5,
      unit: '%'
    },
    uvExposure: {
      sensor: 'GUVA-S12SD',
      uvRawMv: 110,
      uvLevel: 0.8,
      uvState: 'NORMAL'
    },
    lightLux: {
      sensor: 'BH1750',
      lux: 1050,
      lightState: 'NORMAL'
    },
    gasLevels: {
      mq2: { label: 'Smoke / Combustible', state: 'NORMAL', relativeIndex: 'Low' },
      mq5: { label: 'LPG / Natural Gas', state: 'NORMAL', relativeIndex: 'Low' },
      mq7: { label: 'CO Indicator', state: 'NORMAL', relativeIndex: 'Low' },
      mq135: { label: 'General Air Quality', state: 'NORMAL', relativeIndex: 'Low' }
    },
    motion: {
      sensor: 'MPU6050',
      accel: { x: 0.05, y: -0.08, z: 0.99, magnitudeG: 1.0 },
      gyro: { x: 1.1, y: 0.4, z: -0.3 },
      orientation: { pitch: 2.1, roll: -1.0 },
      impactDetected: false,
      postImpactInactivity: false,
      motionState: 'NORMAL'
    },
    helmetWearing: {
      sensor: 'TCRT5000',
      helmetWorn: true,
      helmetState: 'HELMET WORN'
    },
    location: {
      sensor: 'NEO-6M GPS',
      latitude: 19.123988,
      longitude: 72.836310,
      altitudeMeters: 28.6,
      speedKmph: 0.0,
      gpsFix: 'FIXED',
      workshopZone: 'Welding Bay 3'
    },
    sdCard: {
      present: true,
      loggingActive: true,
      offlineRecordsQueued: 0,
      syncStatus: 'ONLINE'
    },
    overallSafetyState: 'SAFE'
  },
  'AS-005': {
    helmetId: 'AS-005',
    timestamp: new Date().toISOString(),
    temperature: {
      thermocoupleMax6675: 31.0,
      ambientDht22: 29.5,
      unit: '°C',
      thermalExposureState: 'NORMAL'
    },
    humidity: {
      dht22: 56.4,
      unit: '%'
    },
    uvExposure: {
      sensor: 'GUVA-S12SD',
      uvRawMv: 80,
      uvLevel: 0.6,
      uvState: 'NORMAL'
    },
    lightLux: {
      sensor: 'BH1750',
      lux: 1400,
      lightState: 'NORMAL'
    },
    gasLevels: {
      mq2: { label: 'Smoke / Combustible', state: 'NORMAL', relativeIndex: 'Low' },
      mq5: { label: 'LPG / Natural Gas', state: 'NORMAL', relativeIndex: 'Low' },
      mq7: { label: 'CO Indicator', state: 'NORMAL', relativeIndex: 'Low' },
      mq135: { label: 'General Air Quality', state: 'NORMAL', relativeIndex: 'Low' }
    },
    motion: {
      sensor: 'MPU6050',
      accel: { x: 0.04, y: 0.03, z: 0.99, magnitudeG: 0.99 },
      gyro: { x: 0.5, y: -0.2, z: 0.1 },
      orientation: { pitch: 1.8, roll: 0.2 },
      impactDetected: false,
      postImpactInactivity: false,
      motionState: 'NORMAL'
    },
    helmetWearing: {
      sensor: 'TCRT5000',
      helmetWorn: true,
      helmetState: 'HELMET WORN'
    },
    location: {
      sensor: 'NEO-6M GPS',
      latitude: 19.124230,
      longitude: 72.836410,
      altitudeMeters: 29.0,
      speedKmph: 0.0,
      gpsFix: 'FIXED',
      workshopZone: 'Transformer Yard B'
    },
    sdCard: {
      present: true,
      loggingActive: true,
      offlineRecordsQueued: 0,
      syncStatus: 'ONLINE'
    },
    overallSafetyState: 'SAFE'
  },
  'AS-006': {
    helmetId: 'AS-006',
    timestamp: new Date().toISOString(),
    temperature: {
      thermocoupleMax6675: 35.8,
      ambientDht22: 31.4,
      unit: '°C',
      thermalExposureState: 'NORMAL'
    },
    humidity: {
      dht22: 63.2,
      unit: '%'
    },
    uvExposure: {
      sensor: 'GUVA-S12SD',
      uvRawMv: 160,
      uvLevel: 1.4,
      uvState: 'NORMAL'
    },
    lightLux: {
      sensor: 'BH1750',
      lux: 1320,
      lightState: 'NORMAL'
    },
    gasLevels: {
      mq2: { label: 'Smoke / Combustible', state: 'NORMAL', relativeIndex: 'Low' },
      mq5: { label: 'LPG / Natural Gas', state: 'NORMAL', relativeIndex: 'Low' },
      mq7: { label: 'CO Indicator', state: 'NORMAL', relativeIndex: 'Low' },
      mq135: { label: 'General Air Quality', state: 'NORMAL', relativeIndex: 'Low' }
    },
    motion: {
      sensor: 'MPU6050',
      accel: { x: 0.10, y: -0.05, z: 0.98, magnitudeG: 0.99 },
      gyro: { x: 1.8, y: -0.9, z: 0.5 },
      orientation: { pitch: 3.4, roll: -1.2 },
      impactDetected: false,
      postImpactInactivity: false,
      motionState: 'NORMAL'
    },
    helmetWearing: {
      sensor: 'TCRT5000',
      helmetWorn: true,
      helmetState: 'HELMET WORN'
    },
    location: {
      sensor: 'NEO-6M GPS',
      latitude: 19.124040,
      longitude: 72.836480,
      altitudeMeters: 28.7,
      speedKmph: 0.0,
      gpsFix: 'FIXED',
      workshopZone: 'Welding Bay 4'
    },
    sdCard: {
      present: true,
      loggingActive: true,
      offlineRecordsQueued: 0,
      syncStatus: 'ONLINE'
    },
    overallSafetyState: 'SAFE'
  },
  'AS-007': {
    helmetId: 'AS-007',
    timestamp: new Date().toISOString(),
    temperature: {
      thermocoupleMax6675: 30.1,
      ambientDht22: 28.9,
      unit: '°C',
      thermalExposureState: 'NORMAL'
    },
    humidity: {
      dht22: 55.0,
      unit: '%'
    },
    uvExposure: {
      sensor: 'GUVA-S12SD',
      uvRawMv: 75,
      uvLevel: 0.5,
      uvState: 'NORMAL'
    },
    lightLux: {
      sensor: 'BH1750',
      lux: 950,
      lightState: 'NORMAL'
    },
    gasLevels: {
      mq2: { label: 'Smoke / Combustible', state: 'NORMAL', relativeIndex: 'Low' },
      mq5: { label: 'LPG / Natural Gas', state: 'NORMAL', relativeIndex: 'Low' },
      mq7: { label: 'CO Indicator', state: 'NORMAL', relativeIndex: 'Low' },
      mq135: { label: 'General Air Quality', state: 'NORMAL', relativeIndex: 'Low' }
    },
    motion: {
      sensor: 'MPU6050',
      accel: { x: 0.03, y: 0.06, z: 0.99, magnitudeG: 0.99 },
      gyro: { x: 0.8, y: 0.3, z: -0.2 },
      orientation: { pitch: 1.5, roll: 0.8 },
      impactDetected: false,
      postImpactInactivity: false,
      motionState: 'NORMAL'
    },
    helmetWearing: {
      sensor: 'TCRT5000',
      helmetWorn: true,
      helmetState: 'HELMET WORN'
    },
    location: {
      sensor: 'NEO-6M GPS',
      latitude: 19.124180,
      longitude: 72.836050,
      altitudeMeters: 29.2,
      speedKmph: 0.0,
      gpsFix: 'FIXED',
      workshopZone: 'Electrical Lab B'
    },
    sdCard: {
      present: true,
      loggingActive: true,
      offlineRecordsQueued: 0,
      syncStatus: 'ONLINE'
    },
    overallSafetyState: 'SAFE'
  },
  'AS-008': {
    helmetId: 'AS-008',
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    temperature: {
      thermocoupleMax6675: 27.5,
      ambientDht22: 27.0,
      unit: '°C',
      thermalExposureState: 'NORMAL'
    },
    humidity: {
      dht22: 52.0,
      unit: '%'
    },
    uvExposure: {
      sensor: 'GUVA-S12SD',
      uvRawMv: 0,
      uvLevel: 0.0,
      uvState: 'NORMAL'
    },
    lightLux: {
      sensor: 'BH1750',
      lux: 320,
      lightState: 'DIM'
    },
    gasLevels: {
      mq2: { label: 'Smoke / Combustible', state: 'NORMAL', relativeIndex: 'Low' },
      mq5: { label: 'LPG / Natural Gas', state: 'NORMAL', relativeIndex: 'Low' },
      mq7: { label: 'CO Indicator', state: 'NORMAL', relativeIndex: 'Low' },
      mq135: { label: 'General Air Quality', state: 'NORMAL', relativeIndex: 'Low' }
    },
    motion: {
      sensor: 'MPU6050',
      accel: { x: 0.0, y: 0.0, z: 0.0, magnitudeG: 0.0 },
      gyro: { x: 0.0, y: 0.0, z: 0.0 },
      orientation: { pitch: 0.0, roll: 0.0 },
      impactDetected: false,
      postImpactInactivity: true,
      motionState: 'NORMAL'
    },
    helmetWearing: {
      sensor: 'TCRT5000',
      helmetWorn: false,
      helmetState: 'HELMET REMOVED'
    },
    location: {
      sensor: 'NEO-6M GPS',
      latitude: 19.123500,
      longitude: 72.835500,
      altitudeMeters: 28.0,
      speedKmph: 0.0,
      gpsFix: 'NO_SIGNAL',
      workshopZone: 'Storage & Staging'
    },
    sdCard: {
      present: true,
      loggingActive: false,
      offlineRecordsQueued: 14,
      syncStatus: 'OFFLINE'
    },
    overallSafetyState: 'OFFLINE'
  }
};

export const INITIAL_ALERTS = [
  {
    id: 'ALT-1092',
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    helmetId: 'AS-004',
    workerName: 'Vikas Patel',
    trade: 'Welding',
    workshopZone: 'Welding Bay 3',
    severity: 'WARNING', // WARNING, CRITICAL, INFO
    category: 'PPE_COMPLIANCE',
    title: 'Helmet Removed During Active Session',
    message: 'TCRT5000 IR sensor detected helmet removal while assigned to active welding zone.',
    sensorSource: 'TCRT5000 (2-Channel IR)',
    value: 'HELMET REMOVED',
    lifecycleStatus: 'RESOLVED', // ACTIVE, ACKNOWLEDGED, INVESTIGATING, RESOLVED
    timeline: [
      { status: 'ACTIVE', timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(), note: 'Triggered by TCRT5000 IR removal flag' },
      { status: 'ACKNOWLEDGED', timestamp: new Date(Date.now() - 17.5 * 60 * 1000).toISOString(), note: 'Acknowledged by Supervisor O. Sharma' },
      { status: 'INVESTIGATING', timestamp: new Date(Date.now() - 16 * 60 * 1000).toISOString(), note: 'Radio contact confirmed worker replaced helmet visor' },
      { status: 'RESOLVED', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), note: 'TCRT5000 confirmed helmet re-worn' }
    ],
    responseDurationSeconds: 180,
    supervisorAction: 'Radio warning issued; helmet re-worn'
  },
  {
    id: 'ALT-1091',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    helmetId: 'AS-002',
    workerName: 'Amit Kumar Verma',
    trade: 'Welding',
    workshopZone: 'Welding Bay 2',
    severity: 'WARNING',
    category: 'THERMAL_EXPOSURE',
    title: 'High Thermal Exposure Detected',
    message: 'MAX6675 K-Type thermocouple recorded sustained temperature above 48.0°C.',
    sensorSource: 'MAX6675 + K-Type Thermocouple',
    value: '49.4 °C (Ambient DHT22: 34.1 °C)',
    lifecycleStatus: 'RESOLVED',
    timeline: [
      { status: 'ACTIVE', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), note: 'Thermocouple exceeded warning threshold' },
      { status: 'ACKNOWLEDGED', timestamp: new Date(Date.now() - 44.8 * 60 * 1000).toISOString(), note: 'Acknowledged by Supervisor' },
      { status: 'RESOLVED', timestamp: new Date(Date.now() - 41 * 60 * 1000).toISOString(), note: 'Worker stepped back into cooling zone; ventilation adjusted' }
    ],
    responseDurationSeconds: 240,
    supervisorAction: 'Mandated 5-minute cooldown break and checked exhaust hood'
  }
];

export const INITIAL_INCIDENTS = [
  {
    id: 'INC-2026-003',
    type: 'NEAR_MISS', // INCIDENT vs NEAR_MISS
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    helmetId: 'AS-004',
    workerName: 'Vikas Patel',
    trade: 'Welding',
    workshopZone: 'Welding Bay 3',
    eventType: 'PPE_REMOVAL_UNSAFE_ZONE',
    severity: 'MEDIUM',
    sensorSource: 'TCRT5000',
    description: 'Trainee removed safety helmet during active arc torch setup before arc ignition.',
    supervisorAction: 'Verbal reprimand & safety checklist review with batch trainer.',
    status: 'CLOSED',
    resolution: 'Worker re-equipped helmet; no physical injury occurred.',
    responseTimeSeconds: 30,
    durationMinutes: 3
  },
  {
    id: 'INC-2026-002',
    type: 'NEAR_MISS',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    helmetId: 'AS-002',
    workerName: 'Amit Kumar Verma',
    trade: 'Welding',
    workshopZone: 'Welding Bay 2',
    eventType: 'SUSTAINED_THERMAL_EXPOSURE',
    severity: 'MEDIUM',
    sensorSource: 'MAX6675 Thermocouple',
    description: 'High heat zone proximity without secondary thermal shield in place.',
    supervisorAction: 'Positioned additional heat baffle and instructed on standoff distance.',
    status: 'CLOSED',
    resolution: 'Temperature normalized to 35.8°C; training resumed.',
    responseTimeSeconds: 12,
    durationMinutes: 4
  },
  {
    id: 'INC-2026-001',
    type: 'INCIDENT',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    helmetId: 'AS-004',
    workerName: 'Vikas Patel',
    trade: 'Welding',
    workshopZone: 'Welding Bay 1',
    eventType: 'TRIP_AND_FALL',
    severity: 'HIGH',
    sensorSource: 'MPU6050 Motion Sensor',
    description: 'Impact of 3.4g followed by 90° orientation pitch shift and prolonged inactivity detected.',
    supervisorAction: 'Supervisor and first-aid responder dispatched immediately. Cable trip hazard identified.',
    status: 'CLOSED',
    resolution: 'Worker assessed for contusion; cable rerouted through protective rubber duct.',
    responseTimeSeconds: 15,
    durationMinutes: 12
  }
];

export const INITIAL_TIMELINE = [
  { id: 'TL-1', timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), helmetId: 'ALL', eventType: 'SESSION_STARTED', message: 'Morning Practical Shift B1 initiated by Safety Supervisor', severity: 'INFO' },
  { id: 'TL-2', timestamp: new Date(Date.now() - 118 * 60 * 1000).toISOString(), helmetId: 'AS-001', eventType: 'HELMET_WORN', message: 'AS-001 (Rajesh Sharma) TCRT5000 verified helmet worn', severity: 'INFO' },
  { id: 'TL-3', timestamp: new Date(Date.now() - 115 * 60 * 1000).toISOString(), helmetId: 'AS-002', eventType: 'HELMET_WORN', message: 'AS-002 (Amit Kumar) TCRT5000 verified helmet worn', severity: 'INFO' },
  { id: 'TL-4', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), helmetId: 'AS-002', eventType: 'THERMAL_WARNING', message: 'MAX6675 recorded 49.4°C thermal exposure', severity: 'WARNING' },
  { id: 'TL-5', timestamp: new Date(Date.now() - 41 * 60 * 1000).toISOString(), helmetId: 'AS-002', eventType: 'THERMAL_RESOLVED', message: 'Temperature normalized to 34.8°C', severity: 'INFO' },
  { id: 'TL-6', timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(), helmetId: 'AS-004', eventType: 'HELMET_REMOVED', message: 'TCRT5000 detected helmet removal in Welding Bay 3', severity: 'WARNING' },
  { id: 'TL-7', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), helmetId: 'AS-004', eventType: 'HELMET_RESTORED', message: 'Helmet re-worn and secured', severity: 'INFO' }
];

export const ACTIVE_SESSION = {
  id: 'SESS-2026-OCT-03',
  title: 'Practical Welding & High-Voltage Safety Batch B1/A2',
  instructor: 'Sr. Supervisor O. Sharma (ITI Directorate)',
  workshop: 'Main Workshop & Heavy Electrical Annex',
  startTime: new Date(Date.now() - 2 * 60 * 60 * 1000 - 32 * 60 * 1000).toISOString(),
  status: 'IN_PROGRESS',
  targetTrainees: 8,
  activeHelmetsCount: 7,
  offlineHelmetsCount: 1,
  totalWarnings: 2,
  totalCritical: 0,
  totalNearMisses: 2,
  averageResponseTimeSec: 18.5,
  overallCompliancePercent: 95.8
};
