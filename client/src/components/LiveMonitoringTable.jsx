import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Thermometer,
  Sun,
  Wind,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  WifiOff,
  MapPin,
  Clock,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useArcShield } from '../context/ArcShieldContext';

export default function LiveMonitoringTable() {
  const {
    helmets,
    readings,
    selectedZoneFilter,
    selectedTradeFilter,
    setSelectedTradeFilter,
    setSelectedHelmetId
  } = useArcShield();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter Helmets
  const filteredHelmets = helmets.filter((helmet) => {
    const r = readings[helmet.id] || {};
    const matchesSearch =
      helmet.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      helmet.assignedWorkerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      helmet.workshopZone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      helmet.trade.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesZone = selectedZoneFilter === 'ALL' || helmet.workshopZone === selectedZoneFilter;
    const matchesTrade = selectedTradeFilter === 'ALL' || helmet.trade === selectedTradeFilter;

    return matchesSearch && matchesZone && matchesTrade;
  });

  // Sort Helmets
  filteredHelmets.sort((a, b) => {
    const readingA = readings[a.id] || {};
    const readingB = readings[b.id] || {};

    // Sort priority: CRITICAL > WARNING > SAFE > OFFLINE
    const priority = { CRITICAL: 4, WARNING: 3, SAFE: 2, OFFLINE: 1 };
    const scoreA = priority[readingA.overallSafetyState] || 1;
    const scoreB = priority[readingB.overallSafetyState] || 1;

    if (sortField === 'safety') {
      return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    }
    return sortDirection === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
  });

  return (
    <div className="industrial-card overflow-hidden">
      {/* Table Action Bar */}
      <div className="p-3 bg-industrial-900 border-b border-industrial-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span>Live Workshop Safety Telemetry</span>
            <span className="text-xs font-normal text-slate-400 font-mono">
              ({filteredHelmets.length} of {helmets.length} helmets)
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Trade Filter */}
          <div className="flex items-center gap-1 bg-industrial-950 border border-industrial-800 px-2.5 py-1 rounded text-xs">
            <span className="text-slate-400">Trade:</span>
            <button
              onClick={() => setSelectedTradeFilter('ALL')}
              className={`px-1.5 py-0.5 rounded font-medium ${
                selectedTradeFilter === 'ALL' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedTradeFilter('Welding')}
              className={`px-1.5 py-0.5 rounded font-medium ${
                selectedTradeFilter === 'Welding' ? 'bg-amber-900/50 text-amber-300 border border-amber-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Welding
            </button>
            <button
              onClick={() => setSelectedTradeFilter('Electrical')}
              className={`px-1.5 py-0.5 rounded font-medium ${
                selectedTradeFilter === 'Electrical' ? 'bg-blue-900/50 text-blue-300 border border-blue-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Electrical
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Helmet, Trainee, Zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-industrial-950 border border-industrial-800 rounded pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-slate-600 w-48 lg:w-60"
            />
          </div>
        </div>
      </div>

      {/* High-Density Industrial Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="industrial-table-header">
              <th className="py-2.5 px-3.5 font-medium">Helmet / Worker</th>
              <th className="py-2.5 px-3 font-medium">Trade & Zone</th>
              <th className="py-2.5 px-3 font-medium">Safety Status</th>
              <th className="py-2.5 px-3 font-medium">MAX6675 Temp</th>
              <th className="py-2.5 px-3 font-medium">UV / Arc Exposure</th>
              <th className="py-2.5 px-3 font-medium">Gas Array (Rel)</th>
              <th className="py-2.5 px-3 font-medium">MPU6050 Motion</th>
              <th className="py-2.5 px-3 font-medium">TCRT5000 Wear</th>
              <th className="py-2.5 px-3 font-medium">GPS / Sync</th>
              <th className="py-2.5 px-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-industrial-800/60 text-xs">
            {filteredHelmets.map((helmet) => {
              const r = readings[helmet.id] || {};
              const safetyState = r.overallSafetyState || (helmet.connectionStatus === 'OFFLINE' ? 'OFFLINE' : 'SAFE');
              const isWorn = r.helmetWearing?.helmetWorn;
              const isOffline = helmet.connectionStatus === 'OFFLINE';

              return (
                <tr
                  key={helmet.id}
                  onClick={() => setSelectedHelmetId(helmet.id)}
                  className="industrial-table-row cursor-pointer"
                >
                  {/* 1. Helmet ID & Worker */}
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center gap-2">
                      <div className="font-mono font-bold text-slate-100 text-[13px]">
                        {helmet.id}
                      </div>
                      <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-400">
                        {helmet.firmwareVersion}
                      </span>
                    </div>
                    <div className="text-slate-300 font-medium text-[11px] truncate max-w-[140px]">
                      {helmet.assignedWorkerName}
                    </div>
                  </td>

                  {/* 2. Trade & Workshop Zone */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                        helmet.trade === 'Welding'
                          ? 'bg-amber-950/40 text-amber-300 border-amber-600/30'
                          : 'bg-blue-950/40 text-blue-300 border-blue-600/30'
                      }`}>
                        {helmet.trade}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[130px]">{helmet.workshopZone}</span>
                    </div>
                  </td>

                  {/* 3. Overall Safety State */}
                  <td className="py-2.5 px-3">
                    {safetyState === 'SAFE' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold badge-safe">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>SAFE</span>
                      </span>
                    )}
                    {safetyState === 'WARNING' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold badge-warning">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>WARNING</span>
                      </span>
                    )}
                    {safetyState === 'CRITICAL' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold badge-critical pulse-critical">
                        <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                        <span>CRITICAL</span>
                      </span>
                    )}
                    {safetyState === 'OFFLINE' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium badge-offline">
                        <WifiOff className="w-3 h-3 text-slate-400" />
                        <span>OFFLINE</span>
                      </span>
                    )}
                  </td>

                  {/* 4. Temperature (MAX6675 K-Type & DHT22) */}
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {isOffline ? (
                      <span className="text-slate-400">-- °C</span>
                    ) : (
                      <div>
                        <span className={`font-semibold ${
                          (r.temperature?.thermocoupleMax6675 || 0) >= 45 ? 'text-amber-400' : 'text-slate-200'
                        }`}>
                          {r.temperature?.thermocoupleMax6675?.toFixed(1) || '--'}°C
                        </span>
                        <div className="text-[10px] text-slate-400">
                          DHT22: {r.temperature?.ambientDht22?.toFixed(1) || '--'}°C
                        </div>
                      </div>
                    )}
                  </td>

                  {/* 5. UV / Arc Exposure (GUVA-S12SD) */}
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {isOffline ? (
                      <span className="text-slate-400">--</span>
                    ) : (
                      <div>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                          r.uvExposure?.uvState === 'HIGH'
                            ? 'bg-red-950/60 text-red-300 border-red-500/40 font-bold'
                            : r.uvExposure?.uvState === 'ELEVATED'
                            ? 'bg-amber-950/50 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {r.uvExposure?.uvState || 'NORMAL'} (Lvl {r.uvExposure?.uvLevel || '0.0'})
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {r.uvExposure?.uvRawMv || 0} mV raw
                        </div>
                      </div>
                    )}
                  </td>

                  {/* 6. Gas Array (MQ-2, 5, 7, 135 Relative) */}
                  <td className="py-2.5 px-3 font-mono text-[10px]">
                    {isOffline ? (
                      <span className="text-slate-400">--</span>
                    ) : (
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                        <span className={r.gasLevels?.mq7?.state === 'HIGH' ? 'text-red-400 font-bold' : r.gasLevels?.mq7?.state === 'ELEVATED' ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                          CO(7): {r.gasLevels?.mq7?.state || 'OK'}
                        </span>
                        <span className={r.gasLevels?.mq135?.state === 'ELEVATED' ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                          AQ(135): {r.gasLevels?.mq135?.state || 'OK'}
                        </span>
                        <span className="text-slate-400">
                          SMK(2): {r.gasLevels?.mq2?.state || 'OK'}
                        </span>
                        <span className="text-slate-400">
                          LPG(5): {r.gasLevels?.mq5?.state || 'OK'}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* 7. Motion / Fall (MPU6050) */}
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {isOffline ? (
                      <span className="text-slate-400">--</span>
                    ) : (
                      <div>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          r.motion?.motionState === 'FALL DETECTED'
                            ? 'bg-red-950 text-red-400 border border-red-500/50 pulse-critical'
                            : r.motion?.motionState === 'IMPACT'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                            : 'text-slate-300'
                        }`}>
                          {r.motion?.motionState || 'NORMAL'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {r.motion?.accel?.magnitudeG?.toFixed(2) || '1.00'}g vector
                        </div>
                      </div>
                    )}
                  </td>

                  {/* 8. Helmet Wearing (TCRT5000 IR Reflective) */}
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {isOffline ? (
                      <span className="text-slate-400">--</span>
                    ) : (
                      <div>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                          isWorn
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-950/60 text-amber-400 border-amber-500/40 font-bold'
                        }`}>
                          {isWorn ? 'HELMET WORN' : 'REMOVED'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Compliance: {helmet.metrics?.compliancePercent || 95}%
                        </div>
                      </div>
                    )}
                  </td>

                  {/* 9. GPS & Sync */}
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        r.location?.gpsFix === 'FIXED' ? 'bg-emerald-400' : 'bg-slate-400'
                      }`}></span>
                      <span className="text-slate-300">GPS: {r.location?.gpsFix || 'NO_FIX'}</span>
                    </div>
                    <div className="text-slate-400 mt-0.5">
                      SD: {r.sdCard?.syncStatus || 'ONLINE'}
                    </div>
                  </td>

                  {/* 10. Action Button */}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHelmetId(helmet.id);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-industrial-800 hover:bg-industrial-700 border border-industrial-700 text-slate-200 text-xs font-medium transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Inspect</span>
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
