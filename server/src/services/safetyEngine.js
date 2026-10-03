/**
 * ArcShield Operational Safety Engine
 * 
 * Derives clear workplace safety interpretations from edge sensing data:
 * - Thermal exposure assessment
 * - UV & welding arc flash exposure
 * - Gas & combustion byproduct exposure
 * - Motion, abnormal tilt, impact & fall detection
 * - Helmet wearing compliance verification
 */

export function evaluateSafetyState(reading, helmet) {
  const warnings = [];
  const criticals = [];

  // 1. Helmet Wearing Rule
  if (reading.helmetWearing && !reading.helmetWearing.helmetWorn) {
    warnings.push({
      category: 'PPE_COMPLIANCE',
      severity: 'WARNING',
      title: 'Helmet Removed in Active Work Zone',
      message: `Safety helmet was removed while assigned to active work area (${reading.location?.workshopZone || 'workshop zone'}).`,
      sensorSource: 'Optical Wearing Sensor',
      value: 'HELMET REMOVED'
    });
  }

  // 2. Motion & Fall Rule
  const motion = reading.motion;
  if (motion) {
    if (motion.motionState === 'FALL DETECTED' || (motion.impactDetected && motion.postImpactInactivity)) {
      criticals.push({
        category: 'FALL_IMPACT',
        severity: 'CRITICAL',
        title: 'Worker Fall / High Impact Detected',
        message: `High impact force (${motion.accel?.magnitudeG || 3.2}g) followed by sudden orientation change and worker immobility detected.`,
        sensorSource: 'Motion & Inertial Tracking',
        value: `Impact: ${motion.accel?.magnitudeG || 3.2}g | Inactivity: Confirmed`
      });
    } else if (motion.motionState === 'POSSIBLE FALL' || motion.impactDetected) {
      warnings.push({
        category: 'FALL_IMPACT',
        severity: 'WARNING',
        title: 'Abnormal Movement / Impact Detected',
        message: 'Sudden deceleration impact registered above standard operational movement thresholds.',
        sensorSource: 'Motion & Inertial Tracking',
        value: `Impact: ${motion.accel?.magnitudeG || 2.4}g`
      });
    }
  }

  // 3. Thermal Exposure
  const temp = reading.temperature;
  if (temp) {
    const thermoVal = temp.thermocoupleMax6675 || 0;
    const ambVal = temp.ambientDht22 || 0;
    if (thermoVal >= 60.0 || ambVal >= 48.0) {
      criticals.push({
        category: 'THERMAL_EXPOSURE',
        severity: 'CRITICAL',
        title: 'Dangerous Heat Exposure',
        message: `Hazardous thermal condition detected: ${thermoVal}°C near welding arc/heat zone.`,
        sensorSource: 'Thermal Exposure Monitor',
        value: `${thermoVal}°C (Ambient: ${ambVal}°C)`
      });
    } else if (thermoVal >= 44.0 || ambVal >= 38.0 || temp.thermalExposureState === 'ELEVATED') {
      warnings.push({
        category: 'THERMAL_EXPOSURE',
        severity: 'WARNING',
        title: 'Elevated Thermal Exposure',
        message: `High temperature recorded (${thermoVal}°C). Worker cooldown or heat shield adjustment required.`,
        sensorSource: 'Thermal Exposure Monitor',
        value: `${thermoVal}°C (Ambient: ${ambVal}°C)`
      });
    }
  }

  // 4. UV / Arc Exposure
  const uv = reading.uvExposure;
  if (uv) {
    if (uv.uvState === 'HIGH' || uv.uvLevel >= 8.0) {
      criticals.push({
        category: 'UV_ARC_EXPOSURE',
        severity: 'CRITICAL',
        title: 'Intense Arc Flash / High UV Exposure',
        message: 'Direct unshielded ultraviolet radiation detected exceeding workplace safe exposure limits.',
        sensorSource: 'UV / Arc Radiation Monitor',
        value: `Exposure Level: High (${uv.uvLevel})`
      });
    } else if (uv.uvState === 'ELEVATED' || uv.uvLevel >= 3.5) {
      warnings.push({
        category: 'UV_ARC_EXPOSURE',
        severity: 'WARNING',
        title: 'Elevated Arc / UV Exposure',
        message: 'Increased ultraviolet radiation detected in welding proximity.',
        sensorSource: 'UV / Arc Radiation Monitor',
        value: `Exposure Level: Elevated (${uv.uvLevel})`
      });
    }
  }

  // 5. Gas / Air Quality Exposure
  const gas = reading.gasLevels;
  if (gas) {
    if (gas.mq7?.state === 'HIGH') {
      criticals.push({
        category: 'GAS_EXPOSURE',
        severity: 'CRITICAL',
        title: 'High Carbon Monoxide (CO) Exposure',
        message: 'Combustion byproduct level elevated to hazardous status in the work area.',
        sensorSource: 'Gas Exposure Monitor',
        value: 'State: HIGH'
      });
    } else if (gas.mq7?.state === 'ELEVATED') {
      warnings.push({
        category: 'GAS_EXPOSURE',
        severity: 'WARNING',
        title: 'Elevated Combustion Gas Level',
        message: 'Elevated gas concentration detected. Check extraction ventilation.',
        sensorSource: 'Gas Exposure Monitor',
        value: 'State: ELEVATED'
      });
    }

    if (gas.mq2?.state === 'HIGH' || gas.mq5?.state === 'HIGH' || gas.mq135?.state === 'HIGH') {
      warnings.push({
        category: 'GAS_EXPOSURE',
        severity: 'WARNING',
        title: 'Smoke / Air Quality Warning',
        message: 'Reduced air quality or smoke byproduct buildup registered.',
        sensorSource: 'Air Quality & Fume Monitor',
        value: 'Air Quality: POOR'
      });
    }
  }

  // Overall Safety State
  let overallSafetyState = 'SAFE';
  if (helmet?.connectionStatus === 'OFFLINE' || reading.sdCard?.syncStatus === 'OFFLINE') {
    overallSafetyState = 'OFFLINE';
  } else if (criticals.length > 0) {
    overallSafetyState = 'CRITICAL';
  } else if (warnings.length > 0) {
    overallSafetyState = 'WARNING';
  }

  return {
    overallSafetyState,
    criticals,
    warnings,
    hasActiveAlerts: criticals.length > 0 || warnings.length > 0
  };
}
