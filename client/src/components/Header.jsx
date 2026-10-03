import React, { useState, useEffect } from 'react';
import { Shield, Radio, Clock, FileText, UserCheck, ChevronDown } from 'lucide-react';
import { useArcShield } from '../context/ArcShieldContext';

export default function Header() {
  const {
    activeSession,
    socketConnected,
    selectedZoneFilter,
    setSelectedZoneFilter,
    setShowReportModal,
    alerts,
    activeScenarioName
  } = useArcShield();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.lifecycleStatus === 'ACTIVE').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING' && a.lifecycleStatus === 'ACTIVE').length;

  const zones = ['ALL', 'Welding Bay 1', 'Welding Bay 2', 'Welding Bay 3', 'Welding Bay 4', 'Electrical Lab A', 'Electrical Lab B', 'Transformer Yard B', 'Storage & Staging'];

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 sticky top-0 z-30 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left: Brand & Workshop Context */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#0f294a] flex items-center justify-center text-white font-bold shadow-xs">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg text-[#0f294a]">ARCSHIELD</span>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Supervisor Console
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Connected Workplace Safety Management • Electrical & Welding Training
              </p>
            </div>
          </div>

          <div className="hidden md:block h-6 w-px bg-slate-200" />

          {/* Active Training Session Indicator */}
          <div className="hidden xl:flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-700">
                Shift: <span className="text-[#0f294a] font-bold">{activeSession?.title || 'Practical Training Batch'}</span>
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Elapsed: 2h 32m</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-emerald-700 font-mono font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Compliance: {activeSession?.overallCompliancePercent || 95.8}%
            </span>
          </div>
        </div>

        {/* Right: Controls, Zone Filter, Report, Time & Supervisor */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Scenario Tag */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
            <span className="text-slate-500">Mode:</span>
            <span className="font-semibold text-[#0f294a]">{activeScenarioName}</span>
          </div>

          {/* Zone Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md text-xs shadow-2xs">
            <span className="text-slate-500 font-medium">Zone:</span>
            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {zones.map(z => (
                <option key={z} value={z} className="bg-white text-slate-800">
                  {z === 'ALL' ? 'All Workshop Zones' : z}
                </option>
              ))}
            </select>
          </div>

          {/* Safety Audit Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold transition shadow-2xs"
            title="Generate Safety Audit Report"
          >
            <FileText className="w-3.5 h-3.5 text-[#0f294a]" />
            <span className="hidden sm:inline">Safety Report</span>
          </button>

          {/* Connection Status */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${
            socketConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <Radio className={`w-3 h-3 ${socketConnected ? 'text-emerald-600' : 'text-red-600'}`} />
            <span>{socketConnected ? 'LIVE FEED' : 'OFFLINE'}</span>
          </div>

          {/* Date / Time */}
          <div className="hidden md:flex flex-col text-right font-mono text-[11px] leading-tight text-slate-500 pl-2 border-l border-slate-200">
            <span className="text-slate-800 font-semibold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <span className="text-[10px] text-slate-400">{currentTime.toISOString().slice(0, 10)}</span>
          </div>

          {/* Supervisor Badge */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-md">
            <div className="w-6 h-6 rounded bg-[#0f294a] flex items-center justify-center text-[11px] font-bold text-white">
              OS
            </div>
            <div className="hidden sm:block text-left text-[11px] leading-tight">
              <div className="font-bold text-slate-800">O. Sharma</div>
              <div className="text-[10px] text-slate-500">Sr. Safety Officer</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
