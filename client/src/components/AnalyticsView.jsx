import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Calendar,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useArcShield } from '../context/ArcShieldContext';

export default function AnalyticsView() {
  const { alerts, incidents, activeSession } = useArcShield();
  const [timeRange, setTimeRange] = useState('SHIFT');

  // Chart Data Collections
  const alertTrendData = [
    { time: '08:00', warnings: 0, critical: 0, safe: 8 },
    { time: '09:00', warnings: 1, critical: 0, safe: 7 },
    { time: '10:00', warnings: 2, critical: 0, safe: 6 },
    { time: '11:00', warnings: 1, critical: 1, safe: 6 },
    { time: '12:00', warnings: 0, critical: 0, safe: 8 },
    { time: '13:00', warnings: 2, critical: 0, safe: 6 },
    { time: '14:00', warnings: 3, critical: 1, safe: 5 },
    { time: '15:00', warnings: 1, critical: 0, safe: 7 },
  ];

  const incidentVsNearMissData = [
    { period: 'Monday', incidents: 0, nearMisses: 3 },
    { period: 'Tuesday', incidents: 1, nearMisses: 4 },
    { period: 'Wednesday', incidents: 0, nearMisses: 2 },
    { period: 'Thursday', incidents: 0, nearMisses: 5 },
    { period: 'Friday (Today)', incidents: 1, nearMisses: 4 },
  ];

  const categoryDistribution = [
    { name: 'Helmet Wearing (PPE)', value: 5, color: '#0f294a' },
    { name: 'Thermal Exposure', value: 4, color: '#d97706' },
    { name: 'UV / Arc Flash', value: 3, color: '#eab308' },
    { name: 'Gas / Fumes', value: 2, color: '#dc2626' },
    { name: 'Movement / Fall', value: 1, color: '#7c3aed' },
  ];

  const complianceTrend = [
    { time: '08:00', compliance: 100, target: 95 },
    { time: '09:00', compliance: 98, target: 95 },
    { time: '10:00', compliance: 94, target: 95 },
    { time: '11:00', compliance: 92, target: 95 },
    { time: '12:00', compliance: 99, target: 95 },
    { time: '13:00', compliance: 95, target: 95 },
    { time: '14:00', compliance: 96, target: 95 },
    { time: '15:00', compliance: 97, target: 95 },
  ];

  const responseTimeTrend = [
    { day: 'Mon', avgSeconds: 24 },
    { day: 'Tue', avgSeconds: 19 },
    { day: 'Wed', avgSeconds: 15 },
    { day: 'Thu', avgSeconds: 21 },
    { day: 'Fri', avgSeconds: 18 },
  ];

  const exposureAverages = [
    { time: '08:00', temp: 28, uvIndex: 1.0 },
    { time: '09:00', temp: 31, uvIndex: 1.8 },
    { time: '10:00', temp: 35, uvIndex: 3.2 },
    { time: '11:00', temp: 38, uvIndex: 4.5 },
    { time: '12:00', temp: 32, uvIndex: 1.5 },
    { time: '13:00', temp: 36, uvIndex: 3.8 },
    { time: '14:00', temp: 41, uvIndex: 6.2 },
    { time: '15:00', temp: 34, uvIndex: 2.1 },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="industrial-card p-4 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0f294a]" />
            <span>Safety Analytics & Workplace Exposure Intelligence</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational safety trends, response metrics, and compliance audits
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-md text-xs">
          <span className="text-slate-500 font-medium px-2">Period:</span>
          <button
            onClick={() => setTimeRange('SHIFT')}
            className={`px-2.5 py-1 rounded font-semibold transition ${
              timeRange === 'SHIFT' ? 'bg-[#0f294a] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today's Shift
          </button>
          <button
            onClick={() => setTimeRange('WEEK')}
            className={`px-2.5 py-1 rounded font-semibold transition ${
              timeRange === 'WEEK' ? 'bg-[#0f294a] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Trend
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="industrial-card p-3.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Shift Records</div>
          <div className="text-2xl font-bold font-mono text-[#0f294a] mt-1">{alerts.length + incidents.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">{incidents.length} Records Logged in Register</div>
        </div>

        <div className="industrial-card p-3.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Shift Compliance Avg</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {activeSession?.overallCompliancePercent || 95.8}%
          </div>
          <div className="text-xs text-emerald-700 mt-0.5 font-medium">+1.4% Above Benchmark</div>
        </div>

        <div className="industrial-card p-3.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Avg Response Time</div>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1">18s</div>
          <div className="text-xs text-slate-500 mt-0.5">Alert to Supervisor Action</div>
        </div>

        <div className="industrial-card p-3.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Near-Miss Ratio</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">4 : 1</div>
          <div className="text-xs text-slate-500 mt-0.5">Near-Misses to Incidents</div>
        </div>
      </div>

      {/* Row 1: Safety State Trend & Alert Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Safety State Trend (2 Cols) */}
        <div className="lg:col-span-2 industrial-card p-4">
          <div className="border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Hourly Workplace Safety State Trend
              </h3>
              <p className="text-xs text-slate-500">Distribution of safe, warning, and critical worker states</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Shift</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={alertTrendData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="safe" stackId="1" stroke="#16a34a" fill="#dcfce7" name="Safe Workers" />
                <Area type="monotone" dataKey="warnings" stackId="1" stroke="#d97706" fill="#fef3c7" name="Active Warnings" />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="#dc2626" fill="#fee2e2" name="Critical Events" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Category Breakdown (Donut) */}
        <div className="industrial-card p-4 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-2 mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Alerts by Category
            </h3>
            <p className="text-xs text-slate-500">Hazard classification breakdown</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {categoryDistribution.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-700 font-medium">{c.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Compliance Trend & Incident Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Compliance Trend */}
        <div className="industrial-card p-4">
          <div className="border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Helmet Wearing Compliance Trend
              </h3>
              <p className="text-xs text-slate-500">Continuous optical wear rate vs target benchmark</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              95.8% Avg
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complianceTrend} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[80, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="compliance" stroke="#0f294a" name="Actual Compliance (%)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="4 4" name="Target (95%)" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Incidents vs Near-Misses */}
        <div className="industrial-card p-4">
          <div className="border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Incidents vs Near-Misses (Weekly Trend)
              </h3>
              <p className="text-xs text-slate-500">Proactive safety indicators over time</p>
            </div>
            <span className="text-xs font-mono text-slate-500">Weekly</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentVsNearMissData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="nearMisses" fill="#0f294a" name="Near Misses" radius={[3, 3, 0, 0]} barSize={20} />
                <Bar dataKey="incidents" fill="#dc2626" name="Incidents" radius={[3, 3, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Response Time & Environmental Exposure Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Supervisor Response Time */}
        <div className="industrial-card p-4">
          <div className="border-b border-slate-100 pb-2 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Supervisor Response Performance (Seconds)
            </h3>
            <p className="text-xs text-slate-500">Daily average duration from hazard alert to supervisor acknowledgment</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseTimeTrend} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                />
                <Bar dataKey="avgSeconds" fill="#2563eb" name="Avg Response (Sec)" radius={[3, 3, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Environmental Exposure Trend */}
        <div className="industrial-card p-4">
          <div className="border-b border-slate-100 pb-2 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Workshop Temperature & Arc Radiation Trend
            </h3>
            <p className="text-xs text-slate-500">Hourly average temperature and UV arc intensity index</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={exposureAverages} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="temp" stroke="#d97706" name="Exposure Temp (°C)" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="uvIndex" stroke="#eab308" name="Arc Radiation Index" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
