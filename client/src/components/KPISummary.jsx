import React from 'react';
import { HardHat, AlertTriangle, AlertOctagon, CheckCircle2, WifiOff, Clock } from 'lucide-react';
import { useArcShield } from '../context/ArcShieldContext';

export default function KPISummary() {
  const { helmets, alerts, activeSession } = useArcShield();

  const totalHelmets = helmets.length;
  const activeHelmets = helmets.filter(h => h.connectionStatus === 'ONLINE').length;
  const offlineHelmets = helmets.filter(h => h.connectionStatus === 'OFFLINE').length;
  
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && a.lifecycleStatus === 'ACTIVE').length;
  const warningAlerts = alerts.filter(a => a.severity === 'WARNING' && a.lifecycleStatus === 'ACTIVE').length;

  const compliancePercent = activeSession?.overallCompliancePercent || 95.8;

  const resolvedAlerts = alerts.filter(a => a.responseDurationSeconds);
  const avgResponse = resolvedAlerts.length > 0
    ? Math.round(resolvedAlerts.reduce((sum, a) => sum + a.responseDurationSeconds, 0) / resolvedAlerts.length)
    : 18;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {/* 1. Active Helmets */}
      <div className="industrial-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Active Helmets</span>
          <HardHat className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-[#0f294a]">{activeHelmets}</span>
          <span className="text-xs text-slate-500 font-mono">/ {totalHelmets} total</span>
        </div>
        <div className="mt-1 text-[11px] text-emerald-700 font-mono font-semibold flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{Math.round((activeHelmets / totalHelmets) * 100)}% Online</span>
        </div>
      </div>

      {/* 2. Critical Alerts */}
      <div className={`industrial-card p-3.5 flex flex-col justify-between ${
        criticalAlerts > 0 ? 'border-red-300 bg-red-50/50' : ''
      }`}>
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Critical Alerts</span>
          <AlertOctagon className={`w-4 h-4 ${criticalAlerts > 0 ? 'text-red-600' : 'text-slate-400'}`} />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold font-mono ${criticalAlerts > 0 ? 'text-red-600' : 'text-[#0f294a]'}`}>
            {criticalAlerts}
          </span>
          <span className="text-xs text-slate-500 font-mono">active</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-600 font-mono">
          {criticalAlerts > 0 ? (
            <span className="text-red-700 font-bold">Requires Action</span>
          ) : (
            'Zero Critical Hazards'
          )}
        </div>
      </div>

      {/* 3. Active Warnings */}
      <div className={`industrial-card p-3.5 flex flex-col justify-between ${
        warningAlerts > 0 ? 'border-amber-300 bg-amber-50/40' : ''
      }`}>
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Active Warnings</span>
          <AlertTriangle className={`w-4 h-4 ${warningAlerts > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold font-mono ${warningAlerts > 0 ? 'text-amber-700' : 'text-[#0f294a]'}`}>
            {warningAlerts}
          </span>
          <span className="text-xs text-slate-500 font-mono">active</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-600 font-mono">
          {warningAlerts > 0 ? (
            <span className="text-amber-800 font-semibold">Elevated Exposure</span>
          ) : (
            'Normal Baseline'
          )}
        </div>
      </div>

      {/* 4. Helmet Compliance */}
      <div className="industrial-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Helmet Compliance</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-emerald-700">{compliancePercent}%</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500 font-mono">
          Shift Wearing Rate
        </div>
      </div>

      {/* 5. Offline Devices */}
      <div className="industrial-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Offline Devices</span>
          <WifiOff className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-slate-700">{offlineHelmets}</span>
          <span className="text-xs text-slate-500 font-mono">units</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500 font-mono">
          Local Storage Queue
        </div>
      </div>

      {/* 6. Response Time */}
      <div className="industrial-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Avg Response Time</span>
          <Clock className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-blue-700">{avgResponse}</span>
          <span className="text-xs text-slate-500 font-mono">seconds</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500 font-mono">
          Alert to Action
        </div>
      </div>
    </div>
  );
}
