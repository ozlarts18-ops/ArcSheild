import React from 'react';
import { Cpu, CheckCircle2, AlertTriangle, WifiOff, HardHat, RefreshCw, Layers, Database, Radio } from 'lucide-react';
import { useArcShield } from '../context/ArcShieldContext';

export default function DeviceHealthView() {
  const { helmets, readings, setSelectedHelmetId } = useArcShield();

  return (
    <div className="space-y-4">
      <div className="industrial-card p-4 bg-industrial-900 border-industrial-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <span>Connected Helmet Hardware Health & Diagnostic Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time I2C, SPI, UART, and GPIO subsystem telemetry for all deployed ESP32-S3 units
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {helmets.map((h) => {
          const r = readings[h.id] || {};
          const isOffline = h.connectionStatus === 'OFFLINE';

          return (
            <div
              key={h.id}
              onClick={() => setSelectedHelmetId(h.id)}
              className="industrial-card industrial-card-hover p-3.5 space-y-2.5 cursor-pointer border border-industrial-800"
            >
              {/* Top info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-industrial-800 flex items-center justify-center text-slate-200">
                    <HardHat className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-mono font-bold text-slate-100 text-xs">{h.id}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[100px]">{h.assignedWorkerName}</div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  h.connectionStatus === 'ONLINE'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-600/30'
                    : h.connectionStatus === 'SYNCING'
                    ? 'bg-blue-950 text-blue-300 border-blue-600/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {h.connectionStatus}
                </span>
              </div>

              {/* Hardware Subsystems */}
              <div className="space-y-1 text-[11px] font-mono pt-1 border-t border-industrial-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">MCU:</span>
                  <span className="text-slate-200">ESP32-S3 (240MHz)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Firmware:</span>
                  <span className="text-slate-300">{h.firmwareVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">I2C Bus (BH1750/MPU/LCD):</span>
                  <span className={isOffline ? 'text-slate-400' : 'text-emerald-400'}>
                    {isOffline ? 'OFFLINE' : 'OK (100kHz)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SPI Bus (MAX6675/SD):</span>
                  <span className={isOffline ? 'text-slate-400' : 'text-emerald-400'}>
                    {isOffline ? 'OFFLINE' : 'OK (SPI Mode 0)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">UART (NEO-6M GPS):</span>
                  <span className={r.location?.gpsFix === 'FIXED' ? 'text-emerald-400' : 'text-slate-400'}>
                    {r.location?.gpsFix === 'FIXED' ? 'FIXED (9600 Bd)' : 'NO_LOCK'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MicroSD 16GB Reader:</span>
                  <span className={isOffline ? 'text-slate-400' : 'text-emerald-400'}>
                    {r.sdCard?.syncStatus === 'ONLINE' ? 'SYNCED' : `${r.sdCard?.offlineRecordsQueued || 0} QUEUED`}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-industrial-800 flex justify-between">
                <span>Zone: {h.workshopZone}</span>
                <span>Seen: {new Date(h.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
