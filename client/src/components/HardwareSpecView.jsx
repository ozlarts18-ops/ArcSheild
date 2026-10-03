import React from 'react';
import { Layers, ShieldCheck, AlertTriangle, CheckCircle2, Cpu, Zap, HardHat, FileText } from 'lucide-react';

export default function HardwareSpecView() {
  const hardwareList = [
    {
      category: 'Main Controller',
      item: 'ESP32-S3 DevKit N16R8',
      bus: 'System-on-Chip (Dual Xtensa LX7 @ 240MHz, 16MB Flash, 8MB PSRAM)',
      role: 'Sensor acquisition, edge threshold evaluation, WiFi/WebSocket telemetry, MicroSD logging',
      representation: 'Raw hardware telemetry & edge derived safety states'
    },
    {
      category: 'Thermal Exposure',
      item: 'MAX6675 + K-Type Thermocouple',
      bus: 'SPI (SCK, CS, SO)',
      role: 'Measures welding arc standoff & extreme ambient heat exposure (0°C - 1024°C range)',
      representation: 'Displayed as "Thermal Exposure" (°C). Never claimed as internal body temp.'
    },
    {
      category: 'Ambient Climate',
      item: 'DHT22 (AM2302)',
      bus: 'Digital Single-Wire GPIO',
      role: 'Measures workshop ambient temperature and relative humidity',
      representation: 'Ambient Temperature (°C) and Relative Humidity (%)'
    },
    {
      category: 'UV / Arc Flash',
      item: 'GUVA-S12SD UV Sensor',
      bus: 'Analog ADC (0 - 3.3V)',
      role: 'Detects UV photodiode flux from welding arc radiation',
      representation: 'Described as "UV / Arc Exposure" (NORMAL / ELEVATED / HIGH). No lab claims.'
    },
    {
      category: 'Ambient Lighting',
      item: 'BH1750 Ambient Light Sensor',
      bus: 'I2C (Address 0x23)',
      role: 'Measures workshop illuminance in lux (1 - 65535 lx)',
      representation: 'Workshop Lighting Lux. Kept distinct from UV radiation.'
    },
    {
      category: 'Gas / Smoke Array',
      item: 'MQ-2, MQ-5, MQ-7, MQ-135',
      bus: 'Analog ADC & Digital Threshold',
      role: 'MQ-2 (Combustible/Smoke), MQ-5 (LPG), MQ-7 (CO byproduct), MQ-135 (Air Quality)',
      representation: 'Relative Indicators (NORMAL / ELEVATED / HIGH). No fabricated uncalibrated PPM values.'
    },
    {
      category: 'Motion & Fall Detection',
      item: 'MPU6050 (6-Axis IMU)',
      bus: 'I2C (Address 0x68)',
      role: 'Measures 3-axis acceleration and gyroscope rate of turn',
      representation: 'Derived events: NORMAL, UNUSUAL MOTION, IMPACT, POSSIBLE FALL, FALL DETECTED.'
    },
    {
      category: 'Helmet Wearing Detection',
      item: 'TCRT5000 2-Channel IR Reflective',
      bus: 'Digital GPIO / Optical Reflection',
      role: 'Detects optical reflection when helmet is clasped/worn vs taken off',
      representation: 'HELMET WORN / HELMET REMOVED state + shift compliance % metrics.'
    },
    {
      category: 'Location / GPS',
      item: 'NEO-6M GPS Module',
      bus: 'UART (TX/RX @ 9600 Baud)',
      role: 'Provides Latitude, Longitude, Speed, Altitude, and GPS fix state',
      representation: 'Mapped directly to Workshop Zones (e.g. Welding Bay 2, Electrical Lab A).'
    },
    {
      category: 'Offline Logging',
      item: 'Mini MicroSD SPI Card Reader (16GB)',
      bus: 'SPI (MOSI, MISO, SCK, CS)',
      role: 'Locally buffers telemetry if WiFi disconnects; syncs upon reconnection',
      representation: 'Status states: ONLINE, OFFLINE, SYNCING, LAST SEEN.'
    },
    {
      category: 'Local Warning Interface',
      item: '1602 I2C LCD, 7-Color LED, Buzzer, Vibration Motor',
      bus: 'I2C & Digital PWM',
      role: 'Direct visual, audio, and haptic feedback on helmet for the wearer',
      representation: 'Wearer immediately warned locally before supervisor intervention.'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="industrial-card p-4 bg-industrial-900 border-industrial-800">
        <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <span>ArcShield Hardware Architecture & Data Integrity Policy</span>
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Strict adherence to actual physical sensors installed on the ESP32-S3 smart helmet.
        </p>
      </div>

      {/* Sensor Mapping Table */}
      <div className="industrial-card overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="industrial-table-header">
              <th className="py-2.5 px-3.5">Subsystem</th>
              <th className="py-2.5 px-3">Hardware Component</th>
              <th className="py-2.5 px-3">Electrical Bus / Interface</th>
              <th className="py-2.5 px-3">Physical Role</th>
              <th className="py-2.5 px-3">Dashboard Data Model</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-industrial-800/60">
            {hardwareList.map((h, idx) => (
              <tr key={idx} className="industrial-table-row">
                <td className="py-2.5 px-3.5 font-semibold text-slate-200">{h.category}</td>
                <td className="py-2.5 px-3 font-mono font-bold text-slate-100">{h.item}</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{h.bus}</td>
                <td className="py-2.5 px-3 text-slate-300">{h.role}</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-400/90">{h.representation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Explicit No-Fake Claims Box */}
      <div className="industrial-card p-4 bg-industrial-950 border border-industrial-800 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Hardware Data Fidelity & No-Fabrication Guarantee</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 font-mono text-[11px]">
          <div className="p-2.5 bg-industrial-900 rounded border border-industrial-800">
            <strong className="text-slate-100">NO Fake Biometrics:</strong> The current hardware prototype does not include ECG, SpO2, heart rate, or blood pressure sensors. We do not fabricate body vitals.
          </div>
          <div className="p-2.5 bg-industrial-900 rounded border border-industrial-800">
            <strong className="text-slate-100">NO Fake Gas PPM:</strong> Without certified laboratory calibration curves, MQ sensors are rendered as relative status (NORMAL / ELEVATED / HIGH).
          </div>
          <div className="p-2.5 bg-industrial-900 rounded border border-industrial-800">
            <strong className="text-slate-100">Derived Fall Detection:</strong> MPU6050 fall detection is computed via impact vector (g) + orientation pitch tilt + post-impact inactivity, not direct sensor guesses.
          </div>
          <div className="p-2.5 bg-industrial-900 rounded border border-industrial-800">
            <strong className="text-slate-100">Direct PPE Compliance:</strong> TCRT5000 dual-channel optical IR reflection verifies helmet wearing continuously for training center compliance auditing.
          </div>
        </div>
      </div>
    </div>
  );
}
