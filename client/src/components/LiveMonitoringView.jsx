import React, { useState } from 'react';
import {
  Search,
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
  ShieldCheck
} from 'lucide-react';
import { useArcShield } from '../context/ArcShieldContext';

export default function LiveMonitoringView() {
  const {
    helmets,
    readings,
    selectedZoneFilter,
    selectedTradeFilter,
    setSelectedTradeFilter,
    setSelectedHelmetId
  } = useArcShield();

  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="industrial-card overflow-hidden">
      {/* Table Action Bar */}
      <div className="p-3.5 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0f294a]" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Live Worker Safety & Environmental Conditions
          </h2>
          <span className="text-xs font-medium text-slate-500 font-mono">
            ({filteredHelmets.length} active units)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Trade Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-xs">
            <span className="text-slate-500 font-medium">Trade:</span>
            <button
              onClick={() => setSelectedTradeFilter('ALL')}
              className={`px-2 py-0.5 rounded font-semibold ${
                selectedTradeFilter === 'ALL' ? 'bg-[#0f294a] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedTradeFilter('Welding')}
              className={`px-2 py-0.5 rounded font-semibold ${
                selectedTradeFilter === 'Welding' ? 'bg-[#0f294a] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Welding
            </button>
            <button
              onClick={() => setSelectedTradeFilter('Electrical')}
              className={`px-2 py-0.5 rounded font-semibold ${
                selectedTradeFilter === 'Electrical' ? 'bg-[#0f294a] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
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
              placeholder="Search Worker, Helmet, Zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1 text-xs text-slate-800 focus:outline-none focus:border-slate-400 w-52 lg:w-64"
            />
          </div>
        </div>
      </div>

      {/* Operational Telemetry Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="industrial-table-header">
              <th className="py-2.5 px-3.5">Worker / Helmet</th>
              <th className="py-2.5 px-3">Trade & Zone</th>
              <th className="py-2.5 px-3">Safety Status</th>
              <th className="py-2.5 px-3">Temperature</th>
              <th className="py-2.5 px-3">Humidity</th>
              <th className="py-2.5 px-3">UV / Arc Exposure</th>
              <th className="py-2.5 px-3">Gas Exposure</th>
              <th className="py-2.5 px-3">Motion Status</th>
              <th className="py-2.5 px-3">Helmet Status</th>
              <th className="py-2.5 px-3">Connection</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredHelmets.map((helmet) => {
              const r = readings[helmet.id] || {};
              const safetyState = r.overallSafetyState || (helmet.connectionStatus === 'OFFLINE' ? 'OFFLINE' : 'SAFE');
              const isWorn = r.helmetWearing?.helmetWorn;
              const isOffline = helmet.connectionStatus === 'OFFLINE';

              // Gas summary
              const gasExposureState = r.gasLevels?.mq7?.state === 'HIGH' || r.gasLevels?.mq2?.state === 'HIGH'
                ? 'HIGH'
                : r.gasLevels?.mq7?.state === 'ELEVATED' || r.gasLevels?.mq135?.state === 'ELEVATED'
                ? 'ELEVATED'
                : 'NORMAL';

              return (
                <tr
                  key={helmet.id}
                  onClick={() => setSelectedHelmetId(helmet.id)}
                  className="industrial-table-row cursor-pointer"
                >
                  {/* 1. Worker / Helmet */}
                  <td className="py-2.5 px-3.5">
                    <div className="font-bold text-slate-900 text-[13px]">
                      {helmet.assignedWorkerName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {helmet.id}
                    </div>
                  </td>

                  {/* 2. Trade & Zone */}
                  <td className="py-2.5 px-3">
                    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                      helmet.trade === 'Welding'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      {helmet.trade}
                    </span>
                    <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[130px] font-medium">{helmet.workshopZone}</span>
                    </div>
                  </td>

                  {/* 3. Safety Status */}
                  <td className="py-2.5 px-3">
                    {safetyState === 'SAFE' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold badge-safe">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>SAFE</span>
                      </span>
                    )}
                    {safetyState === 'WARNING' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold badge-warning">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>WARNING</span>
                      </span>
                    )}
                    {safetyState === 'CRITICAL' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold badge-critical pulse-critical">
                        <AlertOctagon className="w-3 h-3 text-red-600" />
                        <span>CRITICAL</span>
                      </span>
                    )}
                    {safetyState === 'OFFLINE' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold badge-offline">
                        <WifiOff className="w-3 h-3 text-slate-500" />
                        <span>OFFLINE</span>
                      </span>
                    )}
                  </td>

                  {/* 4. Temperature */}
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {isOffline ? (
                      <span className="text-slate-400">--</span>
                    ) : (
                      <div>
                        <span className={`font-semibold ${
                          (r.temperature?.thermocoupleMax6675 || 0) >= 44 ? 'text-amber-700 font-bold' : 'text-slate-800'
                        }`}>
                          {r.temperature?.thermocoupleMax6675?.toFixed(1) || '34.0'}°C
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Ambient: {r.temperature?.ambientDht22?.toFixed(1) || '30.0'}°C
                        </div>
                      </div>
                    )}
                  </td>

                  {/* 5. Humidity */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                    {isOffline ? '--' : `${r.humidity?.dht22?.toFixed(1) || '60'}%`}
                  </td>

                  {/* 6. UV / Arc Exposure */}
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {isOffline ? (
                      <span className="text-slate-400">--</span>
                    ) : (
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                        r.uvExposure?.uvState === 'HIGH'
                          ? 'bg-red-50 text-red-700 border-red-200 font-bold'
                          : r.uvExposure?.uvState === 'ELEVATED'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {r.uvExposure?.uvState || 'NORMAL'}
                      </span>
                    )}
                  </td>

                  {/* 7. Gas Exposure */}
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {isOffline ? (
                      <span className="text-slate-400">--</span>
                    ) : (
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                        gasExposureState === 'HIGH'
                          ? 'bg-red-50 text-red-700 border-red-200 font-bold'
                          : gasExposureState === 'ELEVATED'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {gasExposureState}
                      </span>
                    )}
                  </td>

                  {/* 8. Motion Status */}
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {isOffline ? (
                      <span className="text-slate-400">--</span>
                    ) : (
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        r.motion?.motionState === 'FALL DETECTED'
                          ? 'bg-red-50 text-red-700 border border-red-200 pulse-critical'
                          : r.motion?.motionState === 'IMPACT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'text-slate-700 font-medium'
                      }`}>
                        {r.motion?.motionState || 'NORMAL'}
                      </span>
                    )}
                  </td>

                  {/* 9. Helmet Status */}
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {isOffline ? (
                      <span className="text-slate-400">--</span>
                    ) : (
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                        isWorn
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                      }`}>
                        {isWorn ? 'WORN' : 'REMOVED'}
                      </span>
                    )}
                  </td>

                  {/* 10. Connection */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        helmet.connectionStatus === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}></span>
                      <span>{helmet.connectionStatus}</span>
                    </div>
                  </td>

                  {/* 11. Action */}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHelmetId(helmet.id);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
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
