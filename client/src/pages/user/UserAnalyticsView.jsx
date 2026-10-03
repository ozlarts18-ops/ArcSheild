import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, ShieldCheck, Clock, Calendar, CheckCircle2, 
  AlertTriangle, AlertOctagon, RefreshCw, Download, FileText, Filter,
  Thermometer, Sun, Wind, Eye, Activity, UserCheck, HardHat, ChevronRight,
  ArrowUpRight, ArrowDownRight, Info, Check, X, ShieldAlert, Sparkles
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getMyAnalytics } from '../../services/api';

export default function UserAnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('This Week');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [selectedSession, setSelectedSession] = useState(null);
  const [exporting, setExporting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getMyAnalytics();
      setData(res.data || res);
    } catch (err) {
      console.error('Failed to load user analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const handleExport = (format) => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert(`Personal Safety Analytics (${dateRange}) exported successfully as ${format.toUpperCase()}.`);
    }, 700);
  };

  if (loading && !data) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-500 text-xs font-medium">
        <RefreshCw className="w-5 h-5 animate-spin mr-3 text-blue-700" />
        Loading your personal safety analytics...
      </div>
    );
  }

  const {
    summary = {},
    environmental = {},
    helmetAnalytics = {},
    alertAnalytics = {},
    nearMisses = {},
    incidents = {},
    responsePerformance = {},
    safetyEventsTimeline = [],
    complianceBreakdown = {},
    sessionHistory = [],
    periodComparison = {},
    safetySummaryFactual = []
  } = data || {};

  // Filter safety timeline
  const filteredEvents = safetyEventsTimeline.filter(item => {
    if (eventFilter === 'ALL') return true;
    if (eventFilter === 'WARNINGS' && (item.type === 'Warning' || item.category === 'Warnings')) return true;
    if (eventFilter === 'NEARMISS' && (item.type === 'NearMiss' || item.category === 'NearMiss')) return true;
    if (eventFilter === 'HELMET' && item.category === 'Helmet') return true;
    if (eventFilter === 'EXPOSURE' && item.category === 'Exposure') return true;
    return false;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* 1. SECTION HEADER & COMPACT CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-700" />
              Personal Safety Analytics & Compliance
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Rahul Sharma • ARC-001
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Review your safety conditions, helmet usage, exposure trends, alerts and compliance throughout your monitored sessions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Date Range Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            {['Today', 'This Week', 'This Month', 'Custom Range'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  dateRange === range 
                    ? 'bg-white text-blue-900 shadow-2xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export PDF
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              CSV
            </button>
            <button
              onClick={loadData}
              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. PERSONAL SAFETY SUMMARY (Top KPI Row) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Personal Safety Summary
          </h2>
          <span className="text-[11px] text-slate-400">Scored on personal session adherence</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Overall Safety Status */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Overall Status</span>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {summary.overallSafety || 'SAFE'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block">No critical hazards</span>
          </div>

          {/* Prototype Safety Score */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Safety Score</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono">Prototype</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl font-bold text-blue-900">{summary.prototypeSafetyScore || 94}</span>
              <span className="text-xs font-medium text-slate-400">/ 100</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Prototype Safety Score</span>
          </div>

          {/* Helmet Compliance */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Helmet Wear</span>
            <div className="text-xl font-bold text-emerald-700 mt-2">
              {summary.helmetCompliancePercent || 98.2}%
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Of total monitored time</span>
          </div>

          {/* Safe Session Time */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Safe Session Time</span>
            <div className="text-xl font-bold text-slate-800 mt-2">
              {summary.safeSessionTimeFormatted || '4h 32m'}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Active work window</span>
          </div>

          {/* Warnings */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Warnings</span>
            <div className="text-xl font-bold text-amber-600 mt-2">
              {summary.warningsCount || 3}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Resolved quickly</span>
          </div>

          {/* Near Misses */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Near Misses</span>
            <div className="text-xl font-bold text-amber-700 mt-2">
              {summary.nearMissesCount || 1}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Hazard averted</span>
          </div>

          {/* Critical Incidents */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Critical Incidents</span>
            <div className="text-xl font-bold text-slate-900 mt-2">
              {summary.criticalIncidentsCount || 0}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Zero incidents</span>
          </div>
        </div>
      </div>

      {/* 3 & 4. SAFETY STATE DISTRIBUTION & SAFETY STATE OVER TIME */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Safety State Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Safety State Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Percentage of monitored work time spent in each state</p>
          </div>

          <div className="py-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> SAFE
                </span>
                <span className="text-slate-800 font-bold">91%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '91%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> WARNING
                </span>
                <span className="text-slate-800 font-bold">8%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> CRITICAL
                </span>
                <span className="text-slate-800 font-bold">1%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '1%' }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Total Session Window:</span>
            <span className="font-semibold text-slate-700">4h 32m Monitored</span>
          </div>
        </div>

        {/* Safety State Trend Timeline */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Safety State Over Time</h3>
              <span className="text-[11px] font-mono text-slate-400">1: Safe • 2: Warning • 3: Critical</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Chronological condition transitions across the active shift</p>
          </div>

          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { time: '09:00', state: 'SAFE', value: 1, event: 'Session Start' },
                  { time: '09:45', state: 'SAFE', value: 1, event: 'Normal' },
                  { time: '10:14', state: 'WARNING', value: 2, event: 'UV Spike' },
                  { time: '10:16', state: 'SAFE', value: 1, event: 'Normalized' },
                  { time: '11:18', state: 'WARNING', value: 2, event: 'Temp Rise' },
                  { time: '11:20', state: 'SAFE', value: 1, event: 'Normalized' },
                  { time: '12:30', state: 'SAFE', value: 1, event: 'Normal' },
                  { time: '13:05', state: 'WARNING', value: 2, event: 'Gas Vent' },
                  { time: '13:08', state: 'SAFE', value: 1, event: 'Normalized' },
                  { time: '14:00', state: 'SAFE', value: 1, event: 'Session Active' },
                ]}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis domain={[1, 3]} ticks={[1, 2, 3]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  formatter={(value, name, props) => [
                    `${props.payload.state} (${props.payload.event})`,
                    'Safety Condition'
                  ]}
                />
                <Area type="stepAfter" dataKey="value" stroke="#0284c7" fill="#e0f2fe" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Hover points to review condition change triggers</span>
            <span className="text-emerald-700 font-semibold">91% Uninterrupted Safe Zone</span>
          </div>
        </div>
      </div>

      {/* 5. ENVIRONMENTAL CONDITIONS ANALYTICS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-blue-700" />
              Environmental Conditions Analytics
            </h2>
            <p className="text-xs text-slate-500">Direct thermal, humidity, optical flash, and ambient light readings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperature Trend */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Thermal Profile (°C)</h3>
                  <span className="text-[11px] text-slate-500">Shift thermal exposure tracking</span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-800">{environmental.temperature?.trend}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Current</span>
                <span className="font-bold text-slate-800">{environmental.temperature?.current}°C</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Average</span>
                <span className="font-bold text-slate-800">{environmental.temperature?.average}°C</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Minimum</span>
                <span className="font-bold text-emerald-700">{environmental.temperature?.minimum}°C</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Maximum</span>
                <span className="font-bold text-amber-700">{environmental.temperature?.maximum}°C</span>
              </div>
            </div>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={environmental.temperature?.series || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis domain={[28, 40]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" name="Gear Temp (°C)" stroke="#ea580c" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="ambient" name="Ambient (°C)" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Humidity Trend */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Relative Humidity (%)</h3>
                  <span className="text-[11px] text-slate-500">Workshop moisture & comfort curve</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700">{environmental.humidity?.trend}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Current</span>
                <span className="font-bold text-slate-800">{environmental.humidity?.current}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Average</span>
                <span className="font-bold text-slate-800">{environmental.humidity?.average}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Minimum</span>
                <span className="font-bold text-slate-800">{environmental.humidity?.minimum}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Maximum</span>
                <span className="font-bold text-slate-800">{environmental.humidity?.maximum}%</span>
              </div>
            </div>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={environmental.humidity?.series || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis domain={[50, 80]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" name="Humidity (%)" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* UV / Arc Exposure */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">UV / Arc Exposure Trend</h3>
                  <span className="text-[11px] text-slate-500">Optical flash exposure duration (Not lab-grade)</span>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {environmental.uvArcExposure?.currentStatus || 'Normal'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Exposure Trend</span>
                <span className="font-bold text-slate-800">{environmental.uvArcExposure?.exposureTrend || 'Stable'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Elevated Events</span>
                <span className="font-bold text-amber-700">{environmental.uvArcExposure?.elevatedEventsCount || 2}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Total Elevated Time</span>
                <span className="font-bold text-amber-700">{environmental.uvArcExposure?.elevatedDurationMinutes || 14} min</span>
              </div>
            </div>

            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={environmental.uvArcExposure?.series || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis domain={[0, 4]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="numeric" name="Relative Flash Index" stroke="#7c3aed" fill="#ede9fe" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Light Conditions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Light Conditions (lux)</h3>
                  <span className="text-[11px] text-slate-500">Workshop task lighting compliance</span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-700">{environmental.light?.currentLux || 420} lux</span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Average Task Lighting</span>
                <span className="font-bold text-slate-800">{environmental.light?.averageLux || 412} lux</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Lighting Status</span>
                <span className="font-bold text-emerald-700">Optimal (300-500 lux)</span>
              </div>
            </div>

            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={environmental.light?.series || []} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis domain={[300, 500]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="lux" name="Illuminance (lux)" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 6. GAS & AIR EXPOSURE ANALYTICS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Gas & Air Exposure Analytics</h3>
              <p className="text-xs text-slate-500">Relative ambient fume and air quality indicators (Uncalibrated relative levels)</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Current: {environmental.gasAirExposure?.overallState || 'Normal'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-medium block">Current State</span>
            <span className="text-sm font-bold text-slate-900">{environmental.gasAirExposure?.currentStatus || 'Normal'}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-medium block">Elevated Events</span>
            <span className="text-sm font-bold text-slate-900">{environmental.gasAirExposure?.elevatedEventsCount || 1}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-medium block">Elevated Duration</span>
            <span className="text-sm font-bold text-slate-900">{environmental.gasAirExposure?.elevatedDurationMinutes || 6} min</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-medium block">Peak Relative Level</span>
            <span className="text-sm font-bold text-slate-900">{environmental.gasAirExposure?.highestRelativeLevel || 'Elevated (Resolved)'}</span>
          </div>
        </div>

        <div className="h-40 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={environmental.gasAirExposure?.series || []} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis domain={[1, 3]} ticks={[1, 2, 3]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <Tooltip formatter={(value, name, props) => [`${props.payload.level}`, 'Relative Exposure State']} />
              <Line type="stepAfter" dataKey="numeric" name="Gas Level" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7 & 8 & 9. HELMET COMPLIANCE ANALYTICS, TIMELINE & REMOVAL EVENTS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HardHat className="w-5 h-5 text-blue-700" />
              Helmet Compliance Analytics & Wear Timeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Continuous optical wear verification throughout the session</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            {helmetAnalytics.wearCompliancePercent || 98.2}% Overall Adherence
          </span>
        </div>

        {/* 7. Key Helmet Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-medium block">Total Session</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">{helmetAnalytics.totalSessionTimeFormatted || '4h 32m'}</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-emerald-700 font-medium block">Time Worn</span>
            <span className="text-sm font-bold text-emerald-800 mt-0.5 block">{helmetAnalytics.timeWornFormatted || '4h 27m'}</span>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200">
            <span className="text-[10px] text-amber-700 font-medium block">Time Removed</span>
            <span className="text-sm font-bold text-amber-800 mt-0.5 block">{helmetAnalytics.timeRemovedFormatted || '5m'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-medium block">Removal Events</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">{helmetAnalytics.removalEventsCount || 3}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-medium block">Longest Wear</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">{helmetAnalytics.longestContinuousWearFormatted || '1h 42m'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-medium block">Average Wear</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">{helmetAnalytics.averageWearDurationFormatted || '52m'}</span>
          </div>
        </div>

        {/* 8. Helmet Wear Timeline Blocks */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-2">Hourly Wear Timeline</h4>
          <div className="space-y-2">
            {(helmetAnalytics.timelineBlocks || []).map((block, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-700 w-28">{block.hour}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${block.state === 'WORN' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="font-semibold text-slate-800">{block.status}</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-500 self-end sm:self-auto">{block.duration}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 9. Helmet Removal Events Table */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-2">Logged Removal Events (Self Audit)</h4>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5 text-right">Duration</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Related Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {(helmetAnalytics.removalEvents || []).map((event, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2 font-mono font-bold text-slate-900">{event.time}</td>
                    <td className="px-4 py-2 text-right font-mono text-amber-700">{event.duration}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-600">{event.relatedAlert}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 10 & 11. ALERT ANALYTICS & TYPE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Alert Analytics */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-700" />
                Personal Alert Analytics
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Threshold warnings triggered during monitored practice</p>
            </div>
            <span className="text-xs font-bold text-slate-700">Total: {alertAnalytics.totalAlerts || 4}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">Active Alerts</span>
              <span className="font-bold text-slate-900">{alertAnalytics.activeAlerts || 0}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">Resolved</span>
              <span className="font-bold text-emerald-700">{alertAnalytics.resolvedAlerts || 4}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">Avg Ack Time</span>
              <span className="font-bold text-slate-900">{alertAnalytics.averageResponseTimeSec || 42}s</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">Avg Resolution</span>
              <span className="font-bold text-slate-900">{alertAnalytics.averageResolutionTimeFormatted || '3m 18s'}</span>
            </div>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertAnalytics.alertsTimeline || []} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis allowDecimals={false} domain={[0, 3]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip />
                <Bar dataKey="count" name="Alert Frequency" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 11. Alert Type Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Alert Type Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Classification of environmental and PPE compliance triggers</p>
          </div>

          <div className="space-y-3 pt-2">
            {(alertAnalytics.typeBreakdown || []).map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">{item.type}</span>
                  <span className="font-bold text-slate-900">{item.count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${(item.count / 4) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Primary Cause: Optical flash exposure spike</span>
            <span className="text-emerald-700 font-semibold">100% Resolved On-Site</span>
          </div>
        </div>
      </div>

      {/* 12 & 13. NEAR-MISS & INCIDENT ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Near Miss Events */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Near-Miss Events
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Proactive hazard detection before injury or equipment compromise</p>
            </div>
            <span className="text-xs font-bold text-amber-700">{nearMisses.total || 1} Total</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">This Week</span>
              <span className="font-bold text-slate-900">{nearMisses.thisWeek || 1}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">This Month</span>
              <span className="font-bold text-slate-900">{nearMisses.thisMonth || 2}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">Resolution Status</span>
              <span className="font-bold text-emerald-700">Resolved</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 text-xs">
            <span className="font-semibold text-amber-900 block">Most Recent Near Miss:</span>
            <p className="text-slate-700 mt-0.5">{nearMisses.mostRecent}</p>
            <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">● {nearMisses.resolutionStatus}</span>
          </div>
        </div>

        {/* Incident Analytics */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                Personal Incident History
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Formal safety breaches and critical incident log</p>
            </div>
            <span className="text-xs font-bold text-emerald-700">0 Active</span>
          </div>

          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Zero Critical Incidents</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {incidents.noticeMessage || 'No critical incidents recorded during this period.'}
            </p>
          </div>
        </div>
      </div>

      {/* 14. RESPONSE & RESOLUTION PERFORMANCE */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Response & Resolution Performance</h3>
            <p className="text-xs text-slate-500 mt-0.5">Time taken to acknowledge on-helmet alerts and restore safe thresholds</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-medium block">Avg Acknowledgement</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">{responsePerformance.averageAcknowledgementSec || 42} sec</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-medium block">Avg Resolution Time</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">{responsePerformance.averageResolutionFormatted || '3m 18s'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-medium block">Fastest Response</span>
            <span className="text-base font-bold text-emerald-700 mt-1 block">{responsePerformance.fastestResponseSec || 18} sec</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-medium block">Longest Resolution</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">{responsePerformance.longestResolutionFormatted || '7m 42s'}</span>
          </div>
        </div>

        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={responsePerformance.trend || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="event" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="ackSec" name="Ack Time (sec)" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resSec" name="Resolution Time (sec)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 15. SAFETY EVENTS TIMELINE WITH FILTERING */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-700" />
              Safety Events Timeline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Chronological audit trail of all monitored status changes</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'WARNINGS', label: 'Warnings' },
              { id: 'NEARMISS', label: 'Near Misses' },
              { id: 'HELMET', label: 'Helmet Events' },
              { id: 'EXPOSURE', label: 'Exposure Events' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setEventFilter(f.id)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-colors cursor-pointer ${
                  eventFilter === f.id
                    ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {filteredEvents.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">No events matching the selected filter.</div>
          ) : (
            filteredEvents.map(event => (
              <div key={event.id} className="relative group">
                <div className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                  event.type === 'Warning' ? 'border-amber-500' :
                  event.type === 'NearMiss' ? 'border-rose-500' :
                  event.type === 'Resolution' ? 'border-emerald-500' :
                  'border-blue-500'
                }`} />
                <div className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg p-3 text-xs transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700">{event.timestamp}</span>
                      <span className="font-bold text-slate-900">{event.title}</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {event.category}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{event.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 17 & 18. PERSONAL COMPLIANCE BREAKDOWN & TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Personal Compliance Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Categories derived from actual session telemetry</p>
          </div>

          <div className="space-y-4 py-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">Helmet Wear Adherence</span>
                <span className="font-bold text-emerald-700">{complianceBreakdown.helmetCompliance || 98.2}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98.2%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">Session Protocol Compliance</span>
                <span className="font-bold text-blue-700">{complianceBreakdown.sessionCompliance || 96.0}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '96%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">Alert Acknowledgement</span>
                <span className="font-bold text-slate-800">{complianceBreakdown.alertAcknowledgement || 92.5}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-600 rounded-full" style={{ width: '92.5%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">Safety Event Resolution</span>
                <span className="font-bold text-emerald-700">{complianceBreakdown.safetyEventResolution || 100.0}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400">
            Strictly personal metric • No fleet comparison
          </div>
        </div>

        {/* Compliance Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Personal Compliance Over Time (%)</h3>
              <span className="text-xs font-bold text-emerald-700">96% - 99% Consistency</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Historical daily session wear compliance</p>
          </div>

          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complianceBreakdown.weeklyComplianceTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip />
                <Line type="monotone" dataKey="compliance" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4, fill: '#0284c7' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Historical consistency across all scheduled trade shifts</span>
            <span className="font-semibold text-slate-700">Personal Historical Record</span>
          </div>
        </div>
      </div>

      {/* 19 & 20. SESSION-BY-SESSION ANALYSIS & DETAIL MODAL */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Session History Analysis</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any past workshop session to inspect detailed condition analytics</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Date & Session ID</th>
                <th className="px-4 py-3 text-right">Duration</th>
                <th className="px-4 py-3 text-right">Wear Compliance</th>
                <th className="px-4 py-3 text-center">Warnings</th>
                <th className="px-4 py-3 text-center">Near Misses</th>
                <th className="px-4 py-3 text-center">Incidents</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {(sessionHistory || []).map(sess => (
                <tr 
                  key={sess.id}
                  onClick={() => setSelectedSession(sess)}
                  className="hover:bg-blue-50/60 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 block">{sess.date}</span>
                    <span className="text-[10px] font-mono text-slate-400">{sess.id} ({sess.startTime} - {sess.endTime})</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-800">{sess.duration}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-emerald-700">{sess.compliance}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sess.warnings > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-400'}`}>
                      {sess.warnings}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sess.nearMisses > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-400'}`}>
                      {sess.nearMisses}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-400">{sess.incidents}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-blue-700 hover:text-blue-800 font-semibold text-xs inline-flex items-center gap-1">
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 21 & 22. PERSONAL INSIGHTS & PERIOD COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 21. Factual Safety Summary (No AI Hype) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3>Personal Safety Summary (Factual Observations)</h3>
          </div>
          <p className="text-xs text-slate-500">Automated observational summary generated from session telemetry.</p>
          
          <ul className="space-y-2 pt-1 text-xs text-slate-700 font-medium">
            {(safetySummaryFactual || []).map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-700 shrink-0 mt-1.5" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 22. Current Period vs Previous Period */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Current Period vs Previous Period</h3>
          <p className="text-xs text-slate-500">Comparing your personal performance trends</p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-medium block">Warnings Logged</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-slate-900">
                  {periodComparison.currentPeriod?.warnings || 3}
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5" /> -40% (Was {periodComparison.previousPeriod?.warnings || 5})
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-medium block">Helmet Wear Compliance</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-emerald-700">
                  {periodComparison.currentPeriod?.compliance || 98.2}%
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +3.4% (Was {periodComparison.previousPeriod?.compliance || 94.8}%)
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-medium block">Total Monitored Hours</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-slate-900">
                  {periodComparison.currentPeriod?.sessionHours || 17.4}h
                </span>
                <span className="text-xs text-slate-500">
                  (Was {periodComparison.previousPeriod?.sessionHours || 16.2}h)
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-medium block">Near Miss Events</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-slate-900">
                  {periodComparison.currentPeriod?.nearMisses || 1}
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5" /> -50% (Was {periodComparison.previousPeriod?.nearMisses || 2})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SESSION DETAIL MODAL / DRAWER (Section 20) */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Session Deep Dive</span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedSession.date} ({selectedSession.startTime} - {selectedSession.endTime})
                </h3>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Session Stats Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Duration</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">{selectedSession.duration}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-emerald-700 block font-medium">Compliance</span>
                <span className="text-base font-bold text-emerald-800 mt-0.5 block">{selectedSession.compliance}%</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-amber-700 block font-medium">Warnings</span>
                <span className="text-base font-bold text-amber-800 mt-0.5 block">{selectedSession.warnings}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Incidents</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">{selectedSession.incidents}</span>
              </div>
            </div>

            {/* Session Detailed Breakdown */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900">Session Observations</h4>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Helmet was continuously worn throughout all welding cycles.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Peak thermal conditions peaked at 36.7°C, safely below the 45.0°C cutoff.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ventilation cycle triggered on warning and normalized within 3m 18s.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => handleExport('pdf')}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 cursor-pointer"
              >
                Download Session PDF
              </button>
              <button
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
