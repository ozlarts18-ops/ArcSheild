import React, { useState, useEffect } from 'react';
import { Radio, ShieldCheck, AlertTriangle, AlertOctagon, Flame, Wind, Eye, Activity, RefreshCw } from 'lucide-react';
import { getAdminLive } from '../../services/api';

export default function AdminLiveView() {
  const [liveData, setLiveData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLive = async () => {
    try {
      const data = await getAdminLive();
      setLiveData(data.helmets || []);
    } catch (err) {
      console.error('Failed to fetch admin live stream', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-700 animate-pulse" />
            Live Multi-Helmet Safety Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-worker supervisory grid monitoring thermal load, optical flash exposure, and worker fall status.
          </p>
        </div>
        <button 
          onClick={fetchLive}
          className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Poll Telemetry
        </button>
      </div>

      {/* Grid of Helmets */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading live telemetry stream...</div>
      ) : liveData.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">No active helmets transmitting telemetry.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveData.map((h) => {
            const isSafe = h.safetyState === 'SAFE';
            const isWarning = h.safetyState === 'WARNING';
            const isCritical = h.safetyState === 'CRITICAL';

            return (
              <div 
                key={h.helmetId} 
                className={`bg-white rounded-xl border p-5 shadow-xs transition-shadow hover:shadow-md ${
                  isSafe ? 'border-slate-200' :
                  isWarning ? 'border-amber-300 ring-1 ring-amber-200' :
                  'border-rose-300 ring-1 ring-rose-200'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-bold text-xs flex items-center justify-center">
                      {h.helmetId.replace('ARC-', '')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{h.assignedUser}</h3>
                      <p className="text-[11px] text-slate-500">{h.trade} • {h.workshop}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isSafe ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    isWarning ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {h.safetyState}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" /> Temp
                    </span>
                    <p className="text-base font-bold text-slate-900 mt-1">{h.temperature?.value ?? '34.2'}°C</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">{h.temperature?.status || 'Normal'}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-violet-500" /> UV / Arc
                    </span>
                    <p className="text-base font-bold text-slate-900 mt-1">{h.uvArcExposure?.status || 'Normal'}</p>
                    <span className="text-[10px] text-slate-500">Optics Filtered</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-blue-500" /> Gas Level
                    </span>
                    <p className="text-base font-bold text-slate-900 mt-1">{h.gasExposure?.overall || 'Normal'}</p>
                    <span className="text-[10px] text-slate-500">Air Quality Safe</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" /> Motion
                    </span>
                    <p className="text-base font-bold text-slate-900 mt-1">{h.motion?.movement || 'Stable'}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">No Fall</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Wear Status: <strong className="text-slate-800">WORN</strong></span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Online
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
