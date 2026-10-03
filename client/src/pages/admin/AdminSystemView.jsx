import React from 'react';
import { Cpu, CheckCircle2, Radio, Server, Database, ShieldCheck, Activity } from 'lucide-react';

export default function AdminSystemView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-700" />
          System Health & Edge Gateway Status
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Operational telemetry pipeline status, edge gateway link, server latency, and database integrity.
        </p>
      </div>

      {/* Grid of System Component Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">MERN Central Server</h3>
              <p className="text-[11px] text-slate-500">Node.js + Express Pipeline</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Uptime:</span>
              <span className="font-semibold text-slate-800">99.98%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">API Response Time:</span>
              <span className="font-semibold text-slate-800">14 ms</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Database Engine</h3>
              <p className="text-[11px] text-slate-500">MongoDB Session Store</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Connection:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Audit Records:</span>
              <span className="font-semibold text-slate-800">1,420 entries</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Data Integrity:</span>
              <span className="font-semibold text-emerald-700">Verified</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Telemetry Gateway</h3>
              <p className="text-[11px] text-slate-500">Real-time Stream Engine</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Socket Stream:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active (2s interval)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Active Connected Gear:</span>
              <span className="font-semibold text-slate-800">ARC-001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Packet Loss:</span>
              <span className="font-semibold text-slate-800">0.00%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
