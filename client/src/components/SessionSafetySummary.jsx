import React from 'react';
import { CalendarCheck2, Users, HardHat, AlertTriangle, AlertOctagon, CheckCircle2, Clock, Shield, Award, FileText } from 'lucide-react';
import { useArcShield } from '../context/ArcShieldContext';

export default function SessionSafetySummary() {
  const { activeSession, helmets, workers, alerts, incidents, setShowReportModal } = useArcShield();

  const onlineHelmets = helmets.filter(h => h.connectionStatus === 'ONLINE').length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;
  const nearMissCount = incidents.filter(i => i.type === 'NEAR_MISS').length;
  const incidentCount = incidents.filter(i => i.type === 'INCIDENT').length;

  return (
    <div className="space-y-4">
      {/* Session Top Card */}
      <div className="industrial-card p-5 bg-industrial-900 border-industrial-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-600/40">
                ACTIVE TRAINING SHIFT
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {activeSession?.id || 'SESS-2026-OCT-03'}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              {activeSession?.title || 'Practical Welding & Electrical Safety Practical Batch B1/A2'}
            </h2>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
              <span>Supervisor: <strong className="text-slate-200">{activeSession?.instructor}</strong></span>
              <span className="text-slate-600">•</span>
              <span>Workshop: <strong className="text-slate-200">{activeSession?.workshop}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 font-mono text-emerald-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Elapsed: 2h 32m</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 rounded bg-industrial-800 hover:bg-industrial-700 border border-industrial-700 text-xs text-slate-200 font-bold flex items-center gap-1.5 transition"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Export Safety Audit Report</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-4 pt-4 border-t border-industrial-800">
          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Trainees Active</div>
            <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">{workers.length}</div>
            <div className="text-[10px] text-slate-400 font-mono">Enrolled B1/A2</div>
          </div>

          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Helmets Online</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{onlineHelmets} / {helmets.length}</div>
            <div className="text-[10px] text-slate-400 font-mono">1 Standby</div>
          </div>

          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Compliance Avg</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{activeSession?.overallCompliancePercent || 95.8}%</div>
            <div className="text-[10px] text-slate-400 font-mono">TCRT5000 IR</div>
          </div>

          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Warnings Logged</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{warningCount}</div>
            <div className="text-[10px] text-slate-400 font-mono">Thermal/Gas/PPE</div>
          </div>

          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Critical Events</div>
            <div className="text-xl font-bold font-mono text-red-400 mt-0.5">{criticalCount}</div>
            <div className="text-[10px] text-slate-400 font-mono">Immediate alert</div>
          </div>

          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Near Misses</div>
            <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">{nearMissCount}</div>
            <div className="text-[10px] text-slate-400 font-mono">Preventive log</div>
          </div>

          <div className="bg-industrial-950 p-2.5 rounded border border-industrial-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg Response</div>
            <div className="text-xl font-bold font-mono text-blue-400 mt-0.5">18s</div>
            <div className="text-[10px] text-slate-400 font-mono">Supervisor action</div>
          </div>
        </div>
      </div>

      {/* Trainee Roster & Live Compliance Table */}
      <div className="industrial-card overflow-hidden">
        <div className="p-3 bg-industrial-900 border-b border-industrial-800">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Active Batch Trainee Roster & PPE Verification Status
          </h3>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="industrial-table-header">
              <th className="py-2.5 px-3.5">Worker ID / Name</th>
              <th className="py-2.5 px-3">Trade & Batch</th>
              <th className="py-2.5 px-3">Assigned Helmet</th>
              <th className="py-2.5 px-3">Current Location</th>
              <th className="py-2.5 px-3">Trade Certification</th>
              <th className="py-2.5 px-3 font-right">Shift Compliance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-industrial-800/60">
            {workers.map((w) => {
              const matchedHelmet = helmets.find(h => h.assignedWorkerId === w.id);
              const compliance = matchedHelmet?.metrics?.compliancePercent || 95.0;

              return (
                <tr key={w.id} className="industrial-table-row">
                  <td className="py-2.5 px-3.5">
                    <div className="font-semibold text-slate-200">{w.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{w.id}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                      w.trade === 'Welding' ? 'bg-amber-950 text-amber-300 border-amber-600/30' : 'bg-blue-950 text-blue-300 border-blue-600/30'
                    }`}>
                      {w.trade}
                    </span>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{w.batch}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-200">
                    {matchedHelmet?.id || 'UNASSIGNED'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {matchedHelmet?.workshopZone || 'Main Workshop'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                    {w.certLevel}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold">
                    <span className={compliance >= 90 ? 'text-emerald-400' : 'text-amber-400'}>
                      {compliance}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
