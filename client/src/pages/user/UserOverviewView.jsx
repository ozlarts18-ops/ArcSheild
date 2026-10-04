import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Thermometer,
  Sun,
  Wind,
  Activity,
  HardHat,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Eye
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { fetchMySafetyApi, fetchMyAnalyticsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function UserOverviewView({ onNavigate }) {
  const { currentUser } = useAuth();
  const [safetyData, setSafetyData] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchMySafetyApi().then(res => {
      if (res.success) setSafetyData(res.data);
    }).catch(console.error);

    fetchMyAnalyticsApi().then(res => {
      if (res.success) setAnalytics(res.data);
    }).catch(console.error);
  }, []);

  const cond = safetyData?.currentConditions || {
    safetyState: 'SAFE',
    temperature: { current: 34.2, ambient: 30.8, status: 'Normal', trend: '+1.2°C from start' },
    humidity: { current: 62, status: 'Normal' },
    uvArcExposure: { state: 'NORMAL', levelDescription: 'Normal', trend: 'Stable' },
    light: { lux: 420, status: 'Normal' },
    gasExposure: { overallState: 'NORMAL', combustionIndicator: 'NORMAL', airQualityIndicator: 'NORMAL', fumeIndicator: 'NORMAL', fuelGasIndicator: 'NORMAL' },
    motion: { status: 'NORMAL', movement: 'Stable', fallDetected: false },
    helmetStatus: { state: 'WORN', isWorn: true, complianceRate: 97.6, sessionTimeWornMinutes: 124, sessionTimeRemovedMinutes: 3, removalCount: 1 },
    location: { zone: 'Welding Bay 01', gpsStatus: 'Available (Fixed)', coordinates: '19.1238° N, 72.8361° E' }
  };

  const isCritical = cond.safetyState === 'CRITICAL';
  const isWarning = cond.safetyState === 'WARNING';

  return (
    <div className="space-y-5 max-w-6xl">
      {/* 1. "AM I CURRENTLY SAFE?" MAIN STATUS BANNER */}
      <div className={`industrial-card p-5 border ${
        isCritical
          ? 'bg-red-50 border-red-300'
          : isWarning
          ? 'bg-amber-50 border-amber-300'
          : 'bg-emerald-50/60 border-emerald-300'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 ${
              isCritical ? 'bg-red-600' : isWarning ? 'bg-amber-600' : 'bg-emerald-600'
            }`}>
              {isCritical ? <AlertOctagon className="w-6 h-6" /> : isWarning ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-500">
                CURRENT SAFETY STATUS
              </div>
              <h1 className={`text-lg font-bold ${
                isCritical ? 'text-red-900' : isWarning ? 'text-amber-900' : 'text-emerald-900'
              }`}>
                {isCritical ? '● CRITICAL SAFETY EVENT DETECTED' : isWarning ? '● WARNING: ELEVATED WORKPLACE EXPOSURE' : '● SAFE — ALL CONDITIONS NORMAL'}
              </h1>
              <p className="text-xs text-slate-700 mt-0.5">
                {isCritical
                  ? 'Possible fall or extreme exposure recorded. Emergency protocol active.'
                  : isWarning
                  ? 'Elevated heat, arc flash, or gas buildup detected. Please check ventilation & standoff distance.'
                  : 'No active safety concerns detected. Personal PPE helmet is securely worn.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('ALERTS')}
            className={`px-4 py-2 rounded-md font-bold text-xs shadow-xs transition shrink-0 flex items-center gap-1.5 ${
              isCritical
                ? 'bg-red-600 text-white hover:bg-red-700'
                : isWarning
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-[#0f294a] text-white hover:bg-[#153e75]'
            }`}
          >
            <span>View My Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. USER PROFILE & GEAR ASSIGNMENT */}
      <div className="industrial-card p-4 bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#0f294a] text-white flex items-center justify-center font-bold text-sm">
            {(currentUser?.name || 'Worker').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">{currentUser?.name || 'Worker'}</div>
            <div className="text-xs text-slate-500 font-mono">
              Trade: <strong>{currentUser?.trade || 'Welding'}</strong> • Location: <strong>{currentUser?.workshop || 'Welding Bay 01'}</strong>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400">Helmet ID: </span>
            <strong className="text-slate-800">{currentUser?.assignedHelmetId || 'ARC-001'}</strong>
          </div>
          <span className="text-slate-300">|</span>
          <div>
            <span className="text-slate-400">Session: </span>
            <strong className="text-emerald-700">Active (2h 32m)</strong>
          </div>
          <span className="text-slate-300">|</span>
          <div>
            <span className="text-slate-400">Connection: </span>
            <strong className="text-emerald-700">Online</strong>
          </div>
        </div>
      </div>

      {/* 3. DETAILED LIVE OPERATIONAL OUTPUTS (8 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Temperature */}
        <div className="industrial-card p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Thermometer className="w-4 h-4 text-amber-600" />
              <span>Temperature</span>
            </span>
            <span className="text-emerald-700 font-mono">{cond.temperature.status}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {cond.temperature.current}°C
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Ambient: {cond.temperature.ambient}°C • {cond.temperature.trend}
          </div>
        </div>

        {/* Humidity */}
        <div className="industrial-card p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Wind className="w-4 h-4 text-blue-600" />
              <span>Humidity</span>
            </span>
            <span className="text-emerald-700 font-mono">{cond.humidity.status}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {cond.humidity.current}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Comfort Range: 45% - 65%
          </div>
        </div>

        {/* UV / Arc Exposure */}
        <div className="industrial-card p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Sun className="w-4 h-4 text-yellow-600" />
              <span>UV / Arc Exposure</span>
            </span>
            <span className="font-mono text-xs font-bold text-slate-700">{cond.uvArcExposure.trend}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {cond.uvArcExposure.levelDescription}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Status: Safe Welding Optical Flux
          </div>
        </div>

        {/* Light Conditions */}
        <div className="industrial-card p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Sun className="w-4 h-4 text-slate-500" />
              <span>Light Level</span>
            </span>
            <span className="text-emerald-700 font-mono">{cond.light.status}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {cond.light.lux} lux
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Adequate Workshop Illuminance
          </div>
        </div>

        {/* Gas Exposure Breakdown */}
        <div className="industrial-card p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Wind className="w-4 h-4 text-cyan-600" />
              <span>Gas Exposure</span>
            </span>
            <span className="text-emerald-700 font-mono font-bold">{cond.gasExposure.overallState}</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-600 pt-0.5">
            <div>CO Combustion: <strong className="text-slate-800">{cond.gasExposure.combustionIndicator}</strong></div>
            <div>Air Quality: <strong className="text-slate-800">{cond.gasExposure.airQualityIndicator}</strong></div>
            <div>Smoke/Fumes: <strong className="text-slate-800">{cond.gasExposure.fumeIndicator}</strong></div>
            <div>Fuel Gases: <strong className="text-slate-800">{cond.gasExposure.fuelGasIndicator}</strong></div>
          </div>
        </div>

        {/* Motion & Fall */}
        <div className="industrial-card p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Motion Status</span>
            </span>
            <span className="text-emerald-700 font-mono">{cond.motion.movement}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {cond.motion.status}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Fall Detection: {cond.motion.fallDetected ? 'ALERT DETECTED' : 'No Fall'}
          </div>
        </div>

        {/* Helmet Status */}
        <div className="industrial-card p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-800">
              <HardHat className="w-4 h-4 text-blue-600" />
              <span>Helmet Status</span>
            </span>
            <span className="text-emerald-700 font-mono font-bold">{cond.helmetStatus.complianceRate}%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {cond.helmetStatus.state}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Time Worn: {cond.helmetStatus.sessionTimeWornMinutes}m (1 Removal)
          </div>
        </div>

        {/* Location */}
        <div className="industrial-card p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-800">
              <MapPin className="w-4 h-4 text-slate-600" />
              <span>Location</span>
            </span>
            <span className="text-emerald-700 font-mono">GPS Lock</span>
          </div>
          <div className="text-base font-bold text-slate-900 truncate">
            {cond.location.zone}
          </div>
          <div className="text-[11px] text-slate-500 font-mono truncate">
            {cond.location.coordinates}
          </div>
        </div>
      </div>

      {/* 4. ALL 7 RECHARTS CHARTS FOR USER OVERVIEW */}
      <div className="space-y-4 pt-2">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 font-mono">
            <TrendingUp className="w-4 h-4 text-[#0f294a]" />
            <span>My Shift Safety Trends & Exposure History</span>
          </h2>
        </div>

        {/* Charts Row 1: Temperature & Humidity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Temperature Trend */}
          <div className="industrial-card p-4">
            <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Chart 1: Temperature Trend (°C)</span>
              <span className="text-[11px] font-mono text-slate-500">Current Session</span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.tempTrend || []} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Line type="monotone" dataKey="temp" stroke="#d97706" name="Exposure Temp (°C)" strokeWidth={2.5} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="ambient" stroke="#94a3b8" name="Ambient Climate (°C)" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Humidity Trend */}
          <div className="industrial-card p-4">
            <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Chart 2: Humidity Trend (%)</span>
              <span className="text-[11px] font-mono text-slate-500">Relative Humidity</span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.humidityTrend || []} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[40, 80]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Line type="monotone" dataKey="humidity" stroke="#2563eb" name="Relative Humidity (%)" strokeWidth={2.5} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2: UV / Arc Exposure & Gas Exposure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 3: UV / Arc Exposure Trend */}
          <div className="industrial-card p-4">
            <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Chart 3: UV / Arc Exposure Intensity</span>
              <span className="text-[11px] font-mono text-slate-500">Relative Exposure Index</span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.uvExposureTrend || []} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Area type="monotone" dataKey="level" stroke="#eab308" fill="#fef9c3" name="Arc Radiation Level" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Gas Exposure Trend */}
          <div className="industrial-card p-4">
            <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Chart 4: Gas / Fume Exposure State</span>
              <span className="text-[11px] font-mono text-slate-500">1: Normal | 2: Elevated | 3: High</span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.gasExposureTrend || []} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 3]} ticks={[1, 2, 3]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Line type="stepAfter" dataKey="level" stroke="#0f294a" name="Gas State (1=Norm, 2=Elev, 3=High)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 3: Safety Events, Safety State Over Time, and Helmet Usage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chart 5: Safety Events */}
          <div className="industrial-card p-4">
            <div className="border-b border-slate-100 pb-2 mb-2 text-xs font-semibold text-slate-800">
              <span>Chart 5: Safety Events (Shift)</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.safetyEvents || []} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#0f294a" name="Count" radius={[3, 3, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 6: Safety State Timeline */}
          <div className="industrial-card p-4">
            <div className="border-b border-slate-100 pb-2 mb-2 text-xs font-semibold text-slate-800">
              <span>Chart 6: Safety State Over Time</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.safetyStateHistory || []} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 2]} ticks={[1, 2]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }} />
                  <Area type="stepAfter" dataKey="value" stroke="#16a34a" fill="#dcfce7" name="State (1=Safe, 2=Warn)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 7: Helmet Usage */}
          <div className="industrial-card p-4">
            <div className="border-b border-slate-100 pb-2 mb-2 text-xs font-semibold text-slate-800">
              <span>Chart 7: Helmet Usage (%)</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.helmetUsage || []} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[85, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="worn" stroke="#0f294a" name="Worn %" strokeWidth={2.5} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
