import React from 'react';
import {
  X,
  HardHat,
  Thermometer,
  Sun,
  Wind,
  Activity,
  Compass,
  MapPin,
  Database,
  Radio,
  Clock,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  WifiOff,
  Bell,
  Cpu,
  Layers
} from 'lucide-react';
import { useArcShield } from '../context/ArcShieldContext';

export default function HelmetDetailModal() {
  const {
    selectedHelmetId,
    setSelectedHelmetId,
    helmets,
    readings,
    timeline,
    alerts
  } = useArcShield();

  if (!selectedHelmetId) return null;

  const helmet = helmets.find(h => h.id === selectedHelmetId);
  const r = readings[selectedHelmetId] || {};
  const isOffline = helmet?.connectionStatus === 'OFFLINE';

  const helmetTimeline = timeline.filter(t => t.helmetId === selectedHelmetId || t.helmetId === 'ALL');
  const helmetAlerts = alerts.filter(a => a.helmetId === selectedHelmetId);

  const safetyState = r.overallSafetyState || (isOffline ? 'OFFLINE' : 'SAFE');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
      <div className="bg-industrial-900 border border-industrial-700 rounded-lg max-w-5xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-4 bg-industrial-950 border-b border-industrial-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-industrial-800 border border-industrial-700 flex items-center justify-center text-slate-200">
              <HardHat className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold font-mono text-slate-100">{helmet?.id}</h2>
                <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-industrial-850 border border-industrial-700">
                  {helmet?.serialNumber}
                </span>
                {/* Safety Status Pill */}
                {safetyState === 'SAFE' && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold badge-safe">
                    SAFE
                  </span>
                )}
                {safetyState === 'WARNING' && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold badge-warning">
                    WARNING
                  </span>
                )}
                {safetyState === 'CRITICAL' && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold badge-critical pulse-critical">
                    CRITICAL HAZARD
                  </span>
                )}
                {safetyState === 'OFFLINE' && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-medium badge-offline">
                    OFFLINE
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 flex items-center gap-3 mt-0.5">
                <span>Assigned: <strong>{helmet?.assignedWorkerName}</strong> ({helmet?.trade})</span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 font-mono text-slate-400">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {helmet?.workshopZone}
                </span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[11px] text-slate-400">Firmware: {helmet?.firmwareVersion}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedHelmetId(null)}
            className="p-1.5 rounded bg-industrial-800 hover:bg-industrial-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Active Sensor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 1. Thermal Exposure */}
            <div className="industrial-card p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span>Thermal Exposure</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">MAX6675 & DHT22</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-xl font-mono font-bold text-slate-100">
                    {r.temperature?.thermocoupleMax6675?.toFixed(1) || '--'} °C
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Thermocouple (K-Type)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-semibold text-slate-300">
                    {r.temperature?.ambientDht22?.toFixed(1) || '--'} °C
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Ambient (DHT22)
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-industrial-800 flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-400">Humidity (DHT22):</span>
                <span className="text-slate-200 font-semibold">{r.humidity?.dht22?.toFixed(1) || '--'} %</span>
              </div>
            </div>

            {/* 2. UV / Arc Exposure */}
            <div className="industrial-card p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-yellow-400" />
                  <span>UV / Arc Exposure</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">GUVA-S12SD</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className={`text-xl font-mono font-bold ${
                    r.uvExposure?.uvState === 'HIGH' ? 'text-red-400' : r.uvExposure?.uvState === 'ELEVATED' ? 'text-amber-400' : 'text-slate-100'
                  }`}>
                    {r.uvExposure?.uvState || 'NORMAL'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Arc Exposure State
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-slate-200">
                    Lvl {r.uvExposure?.uvLevel || '0.0'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {r.uvExposure?.uvRawMv || 0} mV raw
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-industrial-800 flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-400">Light (BH1750 Lux):</span>
                <span className="text-slate-200 font-semibold">{r.lightLux?.lux?.toLocaleString() || '--'} lux</span>
              </div>
            </div>

            {/* 3. Gas / Air Quality Array */}
            <div className="industrial-card p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span>Gas & Air Quality Array</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">Relative Levels</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-industrial-950 p-1.5 rounded border border-industrial-800">
                  <div className="text-[10px] text-slate-400">MQ-7 (CO)</div>
                  <div className={`font-bold ${r.gasLevels?.mq7?.state === 'HIGH' ? 'text-red-400' : r.gasLevels?.mq7?.state === 'ELEVATED' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {r.gasLevels?.mq7?.state || 'NORMAL'}
                  </div>
                </div>
                <div className="bg-industrial-950 p-1.5 rounded border border-industrial-800">
                  <div className="text-[10px] text-slate-400">MQ-135 (Air Q.)</div>
                  <div className={`font-bold ${r.gasLevels?.mq135?.state === 'HIGH' ? 'text-red-400' : r.gasLevels?.mq135?.state === 'ELEVATED' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {r.gasLevels?.mq135?.state || 'NORMAL'}
                  </div>
                </div>
                <div className="bg-industrial-950 p-1.5 rounded border border-industrial-800">
                  <div className="text-[10px] text-slate-400">MQ-2 (Smoke)</div>
                  <div className="text-slate-200 font-semibold">{r.gasLevels?.mq2?.state || 'NORMAL'}</div>
                </div>
                <div className="bg-industrial-950 p-1.5 rounded border border-industrial-800">
                  <div className="text-[10px] text-slate-400">MQ-5 (LPG)</div>
                  <div className="text-slate-200 font-semibold">{r.gasLevels?.mq5?.state || 'NORMAL'}</div>
                </div>
              </div>
            </div>

            {/* 4. Motion / Fall Detection */}
            <div className="industrial-card p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Motion & Fall Detection</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">MPU6050 (6-DOF)</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className={`text-base font-mono font-bold ${
                    r.motion?.motionState === 'FALL DETECTED'
                      ? 'text-red-400 pulse-critical'
                      : r.motion?.motionState === 'IMPACT'
                      ? 'text-amber-400'
                      : 'text-slate-100'
                  }`}>
                    {r.motion?.motionState || 'NORMAL'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Accel Vector: {r.motion?.accel?.magnitudeG?.toFixed(2) || '1.00'}g
                  </div>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <div className="text-slate-200">
                    Pitch: {r.motion?.orientation?.pitch?.toFixed(1) || '0.0'}°
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Roll: {r.motion?.orientation?.roll?.toFixed(1) || '0.0'}°
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-industrial-800 flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-400">Post-Impact Inactivity:</span>
                <span className={`font-semibold ${r.motion?.postImpactInactivity ? 'text-red-400' : 'text-slate-400'}`}>
                  {r.motion?.postImpactInactivity ? 'TRUE (IMMOBILE)' : 'FALSE (ACTIVE)'}
                </span>
              </div>
            </div>

            {/* 5. Helmet-Wearing Optical Sensor */}
            <div className="industrial-card p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>PPE Wearing Optical Sensor</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">TCRT5000 IR Dual</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className={`text-base font-mono font-bold ${
                    r.helmetWearing?.helmetWorn ? 'text-emerald-400' : 'text-amber-400 font-bold'
                  }`}>
                    {r.helmetWearing?.helmetState || 'HELMET WORN'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Removal Events: {helmet?.metrics?.removalCount || 0}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-mono font-bold text-emerald-400">
                    {helmet?.metrics?.compliancePercent || 95}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Session Compliance
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-industrial-800 flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-400">Time Worn / Removed:</span>
                <span className="text-slate-300">
                  {Math.round((helmet?.metrics?.sessionTimeWornSeconds || 7000) / 60)}m / {Math.round((helmet?.metrics?.sessionTimeRemovedSeconds || 120) / 60)}m
                </span>
              </div>
            </div>

            {/* 6. GPS, MicroSD & Local Annunciator */}
            <div className="industrial-card p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <span>GPS & Annunciator</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">NEO-6M / LCD1602</span>
              </div>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">GPS Fix:</span>
                  <span className="text-slate-200 font-semibold">{r.location?.gpsFix || 'NO_FIX'} ({r.location?.latitude?.toFixed(4)}, {r.location?.longitude?.toFixed(4)})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MicroSD Card:</span>
                  <span className="text-emerald-400 font-semibold">{r.sdCard?.syncStatus || 'ONLINE'} ({r.sdCard?.offlineRecordsQueued || 0} queued)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">LCD 1602 / Buzzer:</span>
                  <span className="text-slate-200">Local Alert Ready</span>
                </div>
              </div>
              <div className="pt-2 border-t border-industrial-800 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>MCU Heartbeat:</span>
                <span className="text-slate-300">ESP32-S3 @ 240MHz</span>
              </div>
            </div>
          </div>

          {/* Chronological Event Timeline for this Helmet */}
          <div className="industrial-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Chronological Safety Timeline — {helmet?.id}</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {helmetTimeline.length} events logged
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {helmetTimeline.length === 0 ? (
                <div className="text-center text-slate-500 py-3">No specific timeline events for this unit yet.</div>
              ) : (
                helmetTimeline.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5 text-xs font-mono bg-industrial-950 p-2 rounded border border-industrial-850">
                    <span className="text-slate-400 text-[11px] shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                      item.severity === 'CRITICAL'
                        ? 'bg-red-950 text-red-400 border border-red-600/40'
                        : item.severity === 'WARNING'
                        ? 'bg-amber-950 text-amber-400 border border-amber-600/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {item.eventType}
                    </span>
                    <span className="text-slate-300 flex-1">{item.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
