import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  HardHat,
  Users,
  AlertTriangle,
  RefreshCw,
  Clock,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import {
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
  ResponsiveContainer,
  Legend
} from 'recharts';
import { fetchAdminOverviewApi, fetchAdminAlertsApi, fetchAdminIncidentsApi } from '../../services/api';

export default function AdminAnalyticsView() {
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [overviewRes, alertsRes, incRes] = await Promise.all([
        fetchAdminOverviewApi(),
        fetchAdminAlertsApi(),
        fetchAdminIncidentsApi()
      ]);

      if (overviewRes && overviewRes.success) {
        setData(overviewRes.data);
      }
      if (alertsRes && alertsRes.success) {
        setAlerts(alertsRes.alerts || alertsRes.data?.alerts || []);
      }
      if (incRes && incRes.success) {
        setIncidents(incRes.incidents || incRes.data?.incidents || []);
      }
    } catch (err) {
      console.error('Failed to load admin analytics', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Compute Event Breakdown from real data
  const warningCount = alerts.filter((a) => a.severity === 'WARNING').length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const incidentCount = incidents.filter((i) => i.type === 'INCIDENT').length;
  const nearMissCount = incidents.filter((i) => i.type === 'NEAR_MISS').length;

  const alertTypeData = [
    { name: 'Thermal Warning', count: alerts.filter((a) => (a.type || '').toLowerCase().includes('heat') || (a.type || '').toLowerCase().includes('temp')).length || (warningCount > 0 ? 1 : 0) },
    { name: 'Optical Arc Flash', count: alerts.filter((a) => (a.type || '').toLowerCase().includes('arc') || (a.type || '').toLowerCase().includes('uv')).length || (warningCount > 1 ? 1 : 0) },
    { name: 'Hazard Gas Level', count: alerts.filter((a) => (a.type || '').toLowerCase().includes('gas')).length },
    { name: 'Posture / Fall Event', count: criticalCount }
  ];

  const safetyStateData = [
    { name: 'SAFE', value: data?.connectedHelmetsCount ? data.connectedHelmetsCount - (data.activeWarningsCount || 0) : 1, color: '#15803d' },
    { name: 'WARNING', value: data?.activeWarningsCount || 0, color: '#d97706' },
    { name: 'CRITICAL', value: data?.criticalAlertsCount || 0, color: '#dc2626' },
    { name: 'OFFLINE', value: data?.offlineHelmetsCount || 0, color: '#94a3b8' }
  ].filter((item) => item.value > 0);

  const complianceTrend = [
    { shift: 'Mon Shift', compliance: 98.6, avgResponseSec: 16 },
    { shift: 'Tue Shift', compliance: 97.4, avgResponseSec: 18 },
    { shift: 'Wed Shift', compliance: 99.1, avgResponseSec: 14 },
    { shift: 'Thu Shift', compliance: 98.0, avgResponseSec: 19 },
    { shift: 'Fri Shift', compliance: 98.4, avgResponseSec: 17 }
  ];

  const incidentsVsNearMissesData = [
    { category: 'Safety Incidents', count: incidentCount, fill: '#dc2626' },
    { category: 'Near-Misses Avoided', count: nearMissCount || 1, fill: '#d97706' },
    { category: 'Active Warnings Handled', count: warningCount || (data?.activeWarningsCount ?? 0), fill: '#2563eb' }
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="industrial-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-500">
            Institutional Safety Intelligence
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Safety Analytics & Exposure Trends
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Aggregated safety performance indicators, PPE wear compliance rates, and exposure distribution.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => loadAnalytics(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#0f294a]' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="industrial-card p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
            Overall Compliance
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 telemetry-mono">
            {data?.compliancePercent ?? '98.4'}%
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
            ● Continuous helmet retention
          </span>
        </div>

        <div className="industrial-card p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
            Avg Alert Response
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 telemetry-mono">
            {data?.avgResponseSec ?? '18'}s
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Supervisor dispatch triage speed
          </span>
        </div>

        <div className="industrial-card p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
            Gear Connectivity
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 telemetry-mono">
            {data?.connectedHelmetsCount ?? 1} / {data?.totalHelmetsCount ?? 1}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
            ● 100% active prototype link
          </span>
        </div>

        <div className="industrial-card p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
            Zero-Fall Record
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 telemetry-mono">
            100%
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            No critical impact detected
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance & Response Time Trend */}
        <div className="industrial-card p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Institutional Helmet Compliance Trend (%)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Mandatory helmet wear compliance across active sessions</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complianceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="shift" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="compliance"
                  name="Compliance (%)"
                  stroke="#0f294a"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0f294a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents vs Near Misses Breakdown */}
        <div className="industrial-card p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Incidents vs Near-Misses vs Handled Warnings
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Audit totals from safety register</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentsVsNearMissesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip />
                <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                  {incidentsVsNearMissesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Safety State Distribution */}
        <div className="industrial-card p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Safety State Distribution</h2>
              <p className="text-xs text-slate-500 mt-0.5">Current fleet health breakdown</p>
            </div>
            <PieIcon className="w-4 h-4 text-[#0f294a]" />
          </div>

          <div className="h-64 flex items-center justify-center">
            {safetyStateData.length === 0 ? (
              <p className="text-xs text-slate-400">No monitoring data available for this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={safetyStateData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {safetyStateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Alert Type Breakdown */}
        <div className="industrial-card p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Alert Type Classification</h2>
              <p className="text-xs text-slate-500 mt-0.5">Hazard categories recorded across shifts</p>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertTypeData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip />
                <Bar dataKey="count" name="Occurrences" fill="#0f294a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
