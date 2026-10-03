import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import KPISummary from './KPISummary';
import { useArcShield } from '../context/ArcShieldContext';

export default function OverviewView() {
  const {
    alerts,
    incidents,
    helmets,
    readings,
    setActiveView,
    setSelectedHelmetId,
    updateAlertLifecycle
  } = useArcShield();

  const activeAlerts = alerts.filter(a => a.lifecycleStatus === 'ACTIVE');
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && a.lifecycleStatus === 'ACTIVE');
  const warningAlerts = alerts.filter(a => a.severity === 'WARNING' && a.lifecycleStatus === 'ACTIVE');

  // Realistic Hourly Alert Trend for Recharts
  const alertTrendData = [
    { time: '08:00', warnings: 0, critical: 0 },
    { time: '09:00', warnings: 1, critical: 0 },
    { time: '10:00', warnings: 2, critical: 0 },
    { time: '11:00', warnings: 1, critical: 1 },
    { time: '12:00', warnings: 0, critical: 0 },
    { time: '13:00', warnings: 1, critical: 0 },
    { time: '14:00', warnings: warningAlerts.length || 2, critical: criticalAlerts.length || 0 },
  ];

  // Incident vs Near-Miss Data by Trade
  const tradeIncidentData = [
    { trade: 'Welding Bay 1', incidents: 0, nearMisses: 2 },
    { trade: 'Welding Bay 2', incidents: 1, nearMisses: 1 },
    { trade: 'Welding Bay 3', incidents: 0, nearMisses: 2 },
    { trade: 'Electrical Lab A', incidents: 0, nearMisses: 1 },
    { trade: 'Transformer Yard', incidents: 0, nearMisses: 0 },
  ];

  return (
    <div className="space-y-4">
      {/* Top KPIs */}
      <KPISummary />

      {/* Critical / Active Safety Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-red-600 text-white flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold font-mono uppercase text-red-700">
                  Critical Safety Event Active
                </div>
                <h3 className="text-sm font-bold text-red-950">
                  {criticalAlerts[0].title} — {criticalAlerts[0].workerName} ({criticalAlerts[0].helmetId})
                </h3>
                <p className="text-xs text-red-800 mt-0.5">
                  Location: <strong>{criticalAlerts[0].workshopZone}</strong> • {criticalAlerts[0].message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => updateAlertLifecycle(criticalAlerts[0].id, 'ACKNOWLEDGED', 'Acknowledged by Supervisor')}
                className="px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Acknowledge Hazard</span>
              </button>
              <button
                onClick={() => setSelectedHelmetId(criticalAlerts[0].helmetId)}
                className="px-3 py-1.5 rounded-md bg-white border border-red-300 text-red-800 text-xs font-semibold hover:bg-red-50 transition"
              >
                Inspect Worker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Alert Frequency Trend (Recharts Line) */}
        <div className="industrial-card p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Shift Alert Frequency Trend
              </h3>
              <p className="text-xs text-slate-500">Hourly volume of active warnings and critical safety triggers</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Today</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={alertTrendData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="warnings" stroke="#d97706" name="Warnings" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="critical" stroke="#dc2626" name="Critical Events" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Incidents vs Near-Misses by Zone (Recharts Bar) */}
        <div className="industrial-card p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Incidents & Near-Misses by Workshop Zone
              </h3>
              <p className="text-xs text-slate-500">Breakdown of recorded safety events during the current session</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Shift Cumulative</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tradeIncidentData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="trade" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="nearMisses" fill="#0f294a" name="Near Misses" radius={[3, 3, 0, 0]} barSize={18} />
                <Bar dataKey="incidents" fill="#dc2626" name="Incidents" radius={[3, 3, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Alerts Table & Live Zone Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Active Alerts Table (2 Cols) */}
        <div className="lg:col-span-2 industrial-card overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Active Unresolved Safety Alerts ({activeAlerts.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveView('ALERTS')}
              className="text-xs text-[#0f294a] font-semibold hover:underline flex items-center gap-1"
            >
              <span>View All Alerts</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {activeAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-700">All Workshop Zones Operating Safely</div>
                <div className="text-[11px] text-slate-400 mt-0.5">No active alerts requiring supervisor attention.</div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="industrial-table-header">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Worker & Zone</th>
                    <th className="py-2.5 px-3">Alert Description</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeAlerts.slice(0, 4).map((alert) => (
                    <tr key={alert.id} className="industrial-table-row">
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{alert.workerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{alert.workshopZone} ({alert.helmetId})</div>
                      </td>
                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="font-semibold text-slate-800">{alert.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{alert.message}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          alert.severity === 'CRITICAL' ? 'badge-critical pulse-critical' : 'badge-warning'
                        }`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => updateAlertLifecycle(alert.id, 'ACKNOWLEDGED', 'Acknowledged from Overview')}
                          className="px-2.5 py-1 rounded bg-[#0f294a] hover:bg-[#153e75] text-white text-[11px] font-semibold transition"
                        >
                          Acknowledge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Live Zone Safety Status */}
        <div className="industrial-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Workshop Zones Status
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Live</span>
          </div>

          <div className="space-y-2 text-xs">
            {['Welding Bay 1', 'Welding Bay 2', 'Welding Bay 3', 'Welding Bay 4', 'Electrical Lab A', 'Electrical Lab B'].map((zone) => {
              const zoneHelmets = helmets.filter(h => h.workshopZone === zone);
              const hasCritical = zoneHelmets.some(h => readings[h.id]?.overallSafetyState === 'CRITICAL');
              const hasWarning = zoneHelmets.some(h => readings[h.id]?.overallSafetyState === 'WARNING');

              let statusText = 'SAFE';
              let badgeStyle = 'badge-safe';

              if (hasCritical) {
                statusText = 'CRITICAL';
                badgeStyle = 'badge-critical';
              } else if (hasWarning) {
                statusText = 'WARNING';
                badgeStyle = 'badge-warning';
              }

              return (
                <div key={zone} className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-800">{zone}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {zoneHelmets.length} Trainees Active
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${badgeStyle}`}>
                    {statusText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
