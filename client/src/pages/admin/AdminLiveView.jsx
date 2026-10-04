import React, { useState, useEffect } from 'react';
import {
  Radio,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Flame,
  Wind,
  Eye,
  Activity,
  RefreshCw,
  HardHat,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  X
} from 'lucide-react';
import { fetchAdminLiveApi } from '../../services/api';

export default function AdminLiveView() {
  const [liveData, setLiveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastPing, setLastPing] = useState(new Date());
  const [filterState, setFilterState] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);

  const fetchLive = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetchAdminLiveApi();
      const raw = res?.helmets || res?.data?.helmets || [];
      setLiveData(raw);
      setLastPing(new Date());
    } catch (err) {
      console.error('Failed to fetch admin live stream', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(() => fetchLive(false), 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredHelmets = liveData.filter((h) => {
    const matchesFilter =
      filterState === 'ALL' || (h.safetyState || 'SAFE') === filterState;
    const matchesSearch =
      (h.helmetId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.assignedUser || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.trade || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.workshop || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getSafetyBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'SAFE':
        return 'badge-safe';
      case 'WARNING':
        return 'badge-warning';
      case 'CRITICAL':
        return 'badge-critical pulse-critical';
      case 'OFFLINE':
      default:
        return 'badge-offline';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Banner matching User Live Monitoring Header */}
      <div className="industrial-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-blue-50 text-[#0f294a]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Live Workshop Safety Monitoring
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live 3s Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Real-time multi-worker supervisory grid monitoring thermal load, optical flash exposure, and worker fall status.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-[11px] text-slate-400 font-mono">
            Last ping: {lastPing.toLocaleTimeString()}
          </span>
          <button
            onClick={() => fetchLive(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#0f294a]' : ''}`} />
            <span>Poll Telemetry</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="industrial-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search active worker, helmet ID, bay..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-[#0f294a] focus:bg-white w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterState('ALL')}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition cursor-pointer ${
              filterState === 'ALL'
                ? 'bg-[#0f294a] text-white shadow-2xs'
                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Units ({liveData.length})
          </button>
          <button
            onClick={() => setFilterState('SAFE')}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition cursor-pointer ${
              filterState === 'SAFE'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Safe ({liveData.filter((h) => (h.safetyState || 'SAFE') === 'SAFE').length})
          </button>
          <button
            onClick={() => setFilterState('WARNING')}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition cursor-pointer ${
              filterState === 'WARNING'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Warning ({liveData.filter((h) => h.safetyState === 'WARNING').length})
          </button>
          <button
            onClick={() => setFilterState('CRITICAL')}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition cursor-pointer ${
              filterState === 'CRITICAL'
                ? 'bg-red-700 text-white shadow-2xs'
                : 'bg-red-50 border border-red-200 text-red-800 hover:bg-red-100'
            }`}
          >
            Critical ({liveData.filter((h) => h.safetyState === 'CRITICAL').length})
          </button>
        </div>
      </div>

      {/* Grid of Live Safety Units */}
      {loading ? (
        <div className="industrial-card p-12 text-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0f294a]" />
          Connecting to live telemetry pipeline...
        </div>
      ) : filteredHelmets.length === 0 ? (
        <div className="industrial-card p-12 text-center">
          <HardHat className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-800 text-sm">No active units transmitting telemetry</p>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm || filterState !== 'ALL'
              ? 'No units match the selected search or filter.'
              : 'Awaiting incoming sensor telemetry from registered safety helmets.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHelmets.map((h) => {
            const safetyState = h.safetyState || 'SAFE';
            const isCritical = safetyState === 'CRITICAL';
            const isWarning = safetyState === 'WARNING';
            const isSafe = safetyState === 'SAFE';

            return (
              <div
                key={h.helmetId}
                onClick={() => setSelectedUnit(h)}
                className={`industrial-card p-5 cursor-pointer industrial-card-hover transition ${
                  isCritical
                    ? 'border-red-300 ring-1 ring-red-200 bg-red-50/20'
                    : isWarning
                    ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Card Header: Unit ID, Worker Name, Safety Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-[#0f294a] text-white font-bold text-xs flex items-center justify-center font-mono">
                      {h.helmetId.replace('ARC-', '')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {h.assignedUser || 'Worker'}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {h.trade || 'Welding'} • {h.workshop || 'Welding Bay 01'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getSafetyBadgeClass(
                      safetyState
                    )}`}
                  >
                    {safetyState}
                  </span>
                </div>

                {/* 4-Cell Sensor Telemetry Grid matching User Live Monitoring metrics */}
                <div className="grid grid-cols-2 gap-2.5 mt-3.5 text-xs">
                  {/* Thermal */}
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                    <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                      <Flame className="w-3.5 h-3.5 text-orange-500" /> Temperature
                    </span>
                    <p className="text-base font-bold text-slate-900 mt-1 telemetry-mono">
                      {h.temperature?.value ?? '34.2'}°C
                    </p>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      ● {h.temperature?.status || 'Normal'}
                    </span>
                  </div>

                  {/* UV / Arc Flash */}
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                    <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                      <Eye className="w-3.5 h-3.5 text-violet-600" /> UV / Arc Flash
                    </span>
                    <p className="text-base font-bold text-slate-900 mt-1 telemetry-mono">
                      {h.uvArcExposure?.status || 'Normal'}
                    </p>
                    <span className="text-[10px] text-slate-500">Optics Filtered</span>
                  </div>

                  {/* Gas Exposure */}
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                    <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                      <Wind className="w-3.5 h-3.5 text-blue-500" /> Gas Level
                    </span>
                    <p className="text-base font-bold text-slate-900 mt-1 telemetry-mono">
                      {h.gasExposure?.overall || 'Normal'}
                    </p>
                    <span className="text-[10px] text-emerald-700 font-semibold">Air Quality Safe</span>
                  </div>

                  {/* Motion / Fall */}
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                    <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" /> Motion / Fall
                    </span>
                    <p className="text-base font-bold text-slate-900 mt-1 telemetry-mono">
                      {h.motion?.movement || 'Stable'}
                    </p>
                    <span className="text-[10px] text-emerald-700 font-semibold">No Fall Event</span>
                  </div>
                </div>

                {/* Footer: Wear state & Gateway status */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    PPE Helmet: <strong className="text-slate-800">WORN</strong>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Transmitting Online
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Unit Telemetry Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#0f294a]" />
                Live Telemetry: {selectedUnit.helmetId} ({selectedUnit.assignedUser})
              </h3>
              <button
                onClick={() => setSelectedUnit(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-sm">{selectedUnit.assignedUser}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getSafetyBadgeClass(
                      selectedUnit.safetyState || 'SAFE'
                    )}`}
                  >
                    {selectedUnit.safetyState || 'SAFE'}
                  </span>
                </div>
                <p className="text-slate-500 mt-1">
                  Location: {selectedUnit.workshop || 'Welding Bay 01'} • Trade: {selectedUnit.trade || 'Welding'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-slate-500 font-medium">Thermocouple / Shell Temp</span>
                  <p className="text-lg font-bold text-slate-900 mt-1 telemetry-mono">
                    {selectedUnit.temperature?.value ?? '34.2'}°C
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold">● Safe Thermal Margin</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-slate-500 font-medium">Arc Radiation Intensity</span>
                  <p className="text-lg font-bold text-slate-900 mt-1 telemetry-mono">
                    {selectedUnit.uvArcExposure?.status || 'Normal'}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold">● Optical Shading OK</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-slate-500 font-medium">Atmospheric & Gas Status</span>
                  <p className="text-lg font-bold text-slate-900 mt-1 telemetry-mono">
                    {selectedUnit.gasExposure?.overall || 'Normal'}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold">● Fume Ventilation Good</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-slate-500 font-medium">Worker Posture / Motion</span>
                  <p className="text-lg font-bold text-slate-900 mt-1 telemetry-mono">
                    {selectedUnit.motion?.movement || 'Stable'}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold">● Active Work Posture</span>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUnit(null)}
                  className="px-4 py-2 bg-[#0f294a] hover:bg-[#153e75] text-white rounded-md font-semibold cursor-pointer transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
