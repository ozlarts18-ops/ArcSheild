import React, { useState } from 'react';
import {
  Search,
  Users,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  WifiOff,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { useArcShield } from '../context/ArcShieldContext';

export default function WorkerFleetView() {
  const { helmets, readings, setSelectedHelmetId } = useArcShield();

  const [searchTerm, setSearchTerm] = useState('');
  const [tradeFilter, setTradeFilter] = useState('ALL');

  const filtered = helmets.filter(h => {
    const matchesSearch =
      h.assignedWorkerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.workshopZone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrade = tradeFilter === 'ALL' || h.trade === tradeFilter;
    return matchesSearch && matchesTrade;
  });

  return (
    <div className="space-y-4">
      <div className="industrial-card p-4 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0f294a]" />
            <span>Worker Safety Fleet Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of all trainees, assigned connected safety gear, and shift compliance records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Trade Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-xs">
            <span className="text-slate-500 font-medium">Trade:</span>
            <button
              onClick={() => setTradeFilter('ALL')}
              className={`px-2 py-0.5 rounded font-semibold ${
                tradeFilter === 'ALL' ? 'bg-[#0f294a] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({helmets.length})
            </button>
            <button
              onClick={() => setTradeFilter('Welding')}
              className={`px-2 py-0.5 rounded font-semibold ${
                tradeFilter === 'Welding' ? 'bg-[#0f294a] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Welding
            </button>
            <button
              onClick={() => setTradeFilter('Electrical')}
              className={`px-2 py-0.5 rounded font-semibold ${
                tradeFilter === 'Electrical' ? 'bg-[#0f294a] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Electrical
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Worker, Helmet ID, Zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1 text-xs text-slate-800 focus:outline-none focus:border-slate-400 w-52 lg:w-64"
            />
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="industrial-card overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="industrial-table-header">
              <th className="py-2.5 px-3.5">Worker Name</th>
              <th className="py-2.5 px-3">Helmet ID</th>
              <th className="py-2.5 px-3">Trade</th>
              <th className="py-2.5 px-3">Current Location</th>
              <th className="py-2.5 px-3">Safety State</th>
              <th className="py-2.5 px-3">Helmet Status</th>
              <th className="py-2.5 px-3">Shift Compliance</th>
              <th className="py-2.5 px-3">Connection</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((h) => {
              const r = readings[h.id] || {};
              const safetyState = r.overallSafetyState || (h.connectionStatus === 'OFFLINE' ? 'OFFLINE' : 'SAFE');
              const isWorn = r.helmetWearing?.helmetWorn;
              const compliance = h.metrics?.compliancePercent || 95.0;

              return (
                <tr
                  key={h.id}
                  onClick={() => setSelectedHelmetId(h.id)}
                  className="industrial-table-row cursor-pointer"
                >
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-slate-900">{h.assignedWorkerName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">ID: {h.assignedWorkerId}</div>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {h.id}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                      h.trade === 'Welding'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      {h.trade}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-700 font-medium">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{h.workshopZone}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {safetyState === 'SAFE' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold badge-safe">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>SAFE</span>
                      </span>
                    )}
                    {safetyState === 'WARNING' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold badge-warning">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>WARNING</span>
                      </span>
                    )}
                    {safetyState === 'CRITICAL' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold badge-critical pulse-critical">
                        <AlertOctagon className="w-3 h-3 text-red-600" />
                        <span>CRITICAL</span>
                      </span>
                    )}
                    {safetyState === 'OFFLINE' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold badge-offline">
                        <WifiOff className="w-3 h-3 text-slate-500" />
                        <span>OFFLINE</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 font-mono font-semibold">
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] border ${
                      isWorn
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                    }`}>
                      {isWorn ? 'HELMET WORN' : 'REMOVED'}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={compliance >= 90 ? 'text-emerald-700' : 'text-amber-700'}>
                      {compliance}%
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600">
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        h.connectionStatus === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`} />
                      <span>{h.connectionStatus}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHelmetId(h.id);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Profile</span>
                    </button>
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
