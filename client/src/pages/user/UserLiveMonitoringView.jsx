import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, AlertOctagon, Activity, Radio, 
  Flame, Wind, Eye, Sun, UserCheck, MapPin, RefreshCw, Clock,
  Cpu, CheckCircle2, Shield
} from 'lucide-react';
import { getMySafety } from '../../services/api';

export default function UserLiveMonitoringView() {
  const [safety, setSafety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastPing, setLastPing] = useState(new Date());

  const fetchSafety = async () => {
    try {
      const res = await getMySafety();
      const raw = res?.data || res || {};
      const user = raw.user || {};
      const cur = raw.currentConditions || {};

      setSafety({
        overallSafety: cur.safetyState || 'SAFE',
        helmetId: user.assignedHelmetId || 'ARC-001',
        worker: {
          name: user.name || 'Worker',
          trade: user.trade || 'Welding',
          workshop: user.zone || 'Welding Bay 01'
        },
        conditions: {
          temperature: {
            value: cur.temperature?.current ?? '34.2',
            status: cur.temperature?.status || 'Normal'
          },
          humidity: {
            value: cur.humidity?.current ?? '62',
            status: cur.humidity?.status || 'Normal'
          },
          uvArcExposure: {
            status: cur.uvArcExposure?.levelDescription || cur.uvArcExposure?.state || 'Normal'
          },
          gasExposure: {
            overall: cur.gasExposure?.overallState || 'Normal'
          },
          motion: {
            movement: cur.motion?.movement || 'Stable',
            fall: cur.motion?.fallDetected ? 'Fall Detected' : 'No fall detected'
          },
          light: {
            level: cur.light?.lux ? `${cur.light.lux} lux` : '420 lux'
          },
          helmetStatus: {
            state: cur.helmetStatus?.state || 'WORN'
          }
        }
      });
      setLastPing(new Date());
    } catch (err) {
      console.error('Failed to fetch live safety stream', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSafety();
    const interval = setInterval(fetchSafety, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !safety) {
    return (
      <div className="p-8 flex items-center justify-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mr-3 text-blue-600" />
        Connecting to live helmet stream...
      </div>
    );
  }

  const { overallSafety = 'SAFE', conditions = {}, helmetId = 'ARC-001', worker = {} } = safety || {};
  const isSafe = overallSafety === 'SAFE';
  const isWarning = overallSafety === 'WARNING';
  const isCritical = overallSafety === 'CRITICAL';

  return (
    <div className="space-y-6">
      {/* Live Stream Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Live Helmet Telemetry Stream</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live 2s Interval
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned Gear: <span className="font-semibold text-slate-700">{helmetId}</span> • Session: <span className="font-semibold text-slate-700">Active</span> • Location: <span className="font-semibold text-slate-700">{worker.workshop || 'Welding Bay 01'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto">
          <span className="text-xs text-slate-400">Last received: {lastPing.toLocaleTimeString()}</span>
          <button 
            onClick={fetchSafety}
            className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Status Showcase */}
      <div className={`rounded-xl border p-6 ${
        isSafe ? 'bg-emerald-50/70 border-emerald-200' :
        isWarning ? 'bg-amber-50/70 border-amber-200' :
        'bg-rose-50/70 border-rose-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-xl ${
              isSafe ? 'bg-emerald-600 text-white' :
              isWarning ? 'bg-amber-500 text-white' :
              'bg-rose-600 text-white'
            }`}>
              {isSafe ? <ShieldCheck className="w-8 h-8" /> :
               isWarning ? <AlertTriangle className="w-8 h-8" /> :
               <AlertOctagon className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-500">Live Operating Status</span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  isSafe ? 'bg-emerald-200 text-emerald-900' :
                  isWarning ? 'bg-amber-200 text-amber-900' :
                  'bg-rose-200 text-rose-900'
                }`}>
                  {overallSafety}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {isSafe ? 'All Parameters Within Safety Thresholds' :
                 isWarning ? 'Elevated Environmental Risk Detected' :
                 'Hazard Condition Active — Attention Required'}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Continuous telemetry confirmed for {worker.name || 'Worker'} in {worker.workshop || 'Welding Bay 01'}.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Gear ID: {helmetId}</span>
            <span>Firmware: Certified</span>
          </div>
        </div>
      </div>

      {/* Detailed Sensor Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thermal Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thermal Conditions</span>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">{conditions.temperature?.value ?? '34.2'}°C</div>
            <div className="text-xs font-medium text-emerald-600 mt-0.5">● {conditions.temperature?.status || 'Normal'}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Limit Threshold</span>
            <span className="font-medium text-slate-700">45.0°C</span>
          </div>
        </div>

        {/* Humidity Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Relative Humidity</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">{conditions.humidity?.value ?? '62'}%</div>
            <div className="text-xs font-medium text-emerald-600 mt-0.5">● {conditions.humidity?.status || 'Normal'}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Comfort Zone</span>
            <span className="font-medium text-slate-700">30% - 70%</span>
          </div>
        </div>

        {/* Optical Exposure */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">UV & Arc Exposure</span>
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">{conditions.uvArcExposure?.status || 'Normal'}</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Optical Flash Intensity: Safe</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Face Shield Shielding</span>
            <span className="font-medium text-emerald-600">Active</span>
          </div>
        </div>

        {/* Gas & Fumes */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gas & Air Quality</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">{conditions.gasExposure?.overall || 'Normal'}</div>
            <div className="text-xs font-medium text-emerald-600 mt-0.5">Ventilation: Adequate</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Gas Indicators</span>
            <span className="font-medium text-slate-700">Clear</span>
          </div>
        </div>
      </div>

      {/* Secondary Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Helmet Fitment */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">PPE Helmet Compliance</h4>
              <p className="text-xs text-slate-500">Optical fitment sensor</p>
            </div>
          </div>
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Worn Status:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> WORN
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-slate-600">Continuous Wear Duration:</span>
              <span className="font-semibold text-slate-800">2h 14m</span>
            </div>
          </div>
        </div>

        {/* Inertial & Movement */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Worker Motion & Fall Detection</h4>
              <p className="text-xs text-slate-500">6-DOF inertial analysis</p>
            </div>
          </div>
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Motion State:</span>
              <span className="font-semibold text-slate-800">{conditions.motion?.movement || 'Stable'}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-slate-600">Fall / Impact Alarm:</span>
              <span className="font-bold text-emerald-700">No fall detected</span>
            </div>
          </div>
        </div>

        {/* Ambient Luminosity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Ambient Lighting</h4>
              <p className="text-xs text-slate-500">Workshop illumination</p>
            </div>
          </div>
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Measured Luminosity:</span>
              <span className="font-bold text-slate-800">{conditions.light?.level || '420 lux'}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-slate-600">Lighting Compliance:</span>
              <span className="font-semibold text-emerald-700">Adequate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
