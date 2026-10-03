import React from 'react';
import {
  X,
  HardHat,
  Thermometer,
  Sun,
  Wind,
  Activity,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  WifiOff,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { useArcShield } from '../context/ArcShieldContext';

export default function WorkerDetailModal() {
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
  const safetyState = r.overallSafetyState || (isOffline ? 'OFFLINE' : 'SAFE');

  // Gas state
  const gasExposureState = r.gasLevels?.mq7?.state === 'HIGH' || r.gasLevels?.mq2?.state === 'HIGH'
    ? 'HIGH'
    : r.gasLevels?.mq7?.state === 'ELEVATED' || r.gasLevels?.mq135?.state === 'ELEVATED'
    ? 'ELEVATED'
    : 'NORMAL';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-300 rounded-lg max-w-4xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#0f294a] flex items-center justify-center text-white font-bold">
              <HardHat className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900">{helmet?.assignedWorkerName}</h2>
                <span className="text-xs font-mono font-bold text-slate-600 px-2 py-0.5 rounded bg-white border border-slate-200">
                  {helmet?.id}
                </span>
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
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold badge-offline">
                    OFFLINE
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-3 mt-0.5">
                <span>Trade: <strong>{helmet?.trade}</strong></span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 font-mono text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {helmet?.workshopZone}
                </span>
                <span className="text-slate-300">•</span>
                <span>Connection: <strong className={isOffline ? 'text-slate-500' : 'text-emerald-700'}>{helmet?.connectionStatus}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedHelmetId(null)}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operational Safety Conditions Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 6 Condition Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 1. Thermal Exposure */}
            <div className="industrial-card p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-slate-800">
                  <Thermometer className="w-4 h-4 text-amber-600" />
                  <span>Thermal Exposure</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Heat Standoff</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-2xl font-mono font-bold text-slate-900">
                    {r.temperature?.thermocoupleMax6675?.toFixed(1) || '--'} °C
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Exposure Temperature
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-semibold text-slate-700">
                    {r.temperature?.ambientDht22?.toFixed(1) || '--'} °C
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Ambient Climate
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-500">Relative Humidity:</span>
                <span className="text-slate-800 font-bold">{r.humidity?.dht22?.toFixed(1) || '--'} %</span>
              </div>
            </div>

            {/* 2. UV / Arc Exposure */}
            <div className="industrial-card p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-slate-800">
                  <Sun className="w-4 h-4 text-yellow-600" />
                  <span>UV / Arc Exposure</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Radiation</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className={`text-xl font-mono font-bold ${
                    r.uvExposure?.uvState === 'HIGH' ? 'text-red-600' : r.uvExposure?.uvState === 'ELEVATED' ? 'text-amber-600' : 'text-slate-900'
                  }`}>
                    {r.uvExposure?.uvState || 'NORMAL'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Arc Flash Exposure State
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-slate-800">
                    Level {r.uvExposure?.uvLevel || '0.0'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Relative Intensity
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-500">Workshop Lighting:</span>
                <span className="text-slate-800 font-bold">{r.lightLux?.lux?.toLocaleString() || '--'} Lux</span>
              </div>
            </div>

            {/* 3. Gas / Air Quality */}
            <div className="industrial-card p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-slate-800">
                  <Wind className="w-4 h-4 text-blue-600" />
                  <span>Gas & Fume Exposure</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Air Quality</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500">Combustion (CO)</div>
                  <div className={`font-bold ${r.gasLevels?.mq7?.state === 'HIGH' ? 'text-red-600' : r.gasLevels?.mq7?.state === 'ELEVATED' ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {r.gasLevels?.mq7?.state || 'NORMAL'}
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500">Air Quality</div>
                  <div className={`font-bold ${r.gasLevels?.mq135?.state === 'HIGH' ? 'text-red-600' : r.gasLevels?.mq135?.state === 'ELEVATED' ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {r.gasLevels?.mq135?.state || 'NORMAL'}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-500">Overall Fume Status:</span>
                <span className="text-slate-800 font-bold">{gasExposureState}</span>
              </div>
            </div>

            {/* 4. Motion / Fall Detection */}
            <div className="industrial-card p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-slate-800">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Movement & Fall Status</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Kinematics</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className={`text-base font-mono font-bold ${
                    r.motion?.motionState === 'FALL DETECTED'
                      ? 'text-red-600 pulse-critical'
                      : r.motion?.motionState === 'IMPACT'
                      ? 'text-amber-600'
                      : 'text-slate-900'
                  }`}>
                    {r.motion?.motionState || 'NORMAL'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Motion Vector: {r.motion?.accel?.magnitudeG?.toFixed(2) || '1.00'}g
                  </div>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <div className="text-slate-800 font-semibold">
                    Tilt Pitch: {r.motion?.orientation?.pitch?.toFixed(1) || '0.0'}°
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    Orientation: Normal
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-500">Post-Impact Immobility:</span>
                <span className={`font-bold ${r.motion?.postImpactInactivity ? 'text-red-600' : 'text-slate-700'}`}>
                  {r.motion?.postImpactInactivity ? 'IMMOBILE' : 'ACTIVE'}
                </span>
              </div>
            </div>

            {/* 5. Helmet Wearing Compliance */}
            <div className="industrial-card p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>PPE Wearing Compliance</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Shift Audit</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className={`text-base font-mono font-bold ${
                    r.helmetWearing?.helmetWorn ? 'text-emerald-700' : 'text-amber-700 font-bold'
                  }`}>
                    {r.helmetWearing?.helmetState || 'HELMET WORN'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Removal Events: {helmet?.metrics?.removalCount || 0}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-mono font-bold text-emerald-700">
                    {helmet?.metrics?.compliancePercent || 95}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Shift Wearing Rate
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-500">Time Worn / Removed:</span>
                <span className="text-slate-800 font-semibold">
                  {Math.round((helmet?.metrics?.sessionTimeWornSeconds || 7000) / 60)}m / {Math.round((helmet?.metrics?.sessionTimeRemovedSeconds || 120) / 60)}m
                </span>
              </div>
            </div>

            {/* 6. Location & Zone */}
            <div className="industrial-card p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-slate-800">
                  <MapPin className="w-4 h-4 text-slate-700" />
                  <span>Workshop Location</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Location Lock</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Zone:</span>
                  <span className="text-slate-900 font-bold">{helmet?.workshopZone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location Coordinates:</span>
                  <span className="text-slate-700 font-semibold">19.1238° N, 72.8361° E</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GPS Signal Status:</span>
                  <span className="text-emerald-700 font-semibold">FIXED (Active)</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>Last Seen:</span>
                <span className="text-slate-800 font-semibold">{new Date(helmet?.lastSeen).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Chronological Event Timeline for this Worker */}
          <div className="industrial-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Session Event Timeline — {helmet?.assignedWorkerName}</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                {helmetTimeline.length} events logged
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {helmetTimeline.length === 0 ? (
                <div className="text-center text-slate-400 py-3">No specific timeline events for this worker yet.</div>
              ) : (
                helmetTimeline.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5 text-xs font-mono bg-slate-50 p-2.5 rounded-md border border-slate-100">
                    <span className="text-slate-500 text-[11px] shrink-0 font-semibold">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                      item.severity === 'CRITICAL'
                        ? 'badge-critical'
                        : item.severity === 'WARNING'
                        ? 'badge-warning'
                        : 'badge-safe'
                    }`}>
                      {item.eventType}
                    </span>
                    <span className="text-slate-700 flex-1">{item.message}</span>
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
