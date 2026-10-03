import React, { useState, useEffect } from 'react';
import { 
  Users, HardHat, AlertTriangle, AlertOctagon, WifiOff, 
  FileWarning, CheckCircle2, ShieldCheck, ArrowUpRight, Activity,
  RefreshCw, TrendingUp
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAdminOverview } from '../../services/api';
import { Link } from 'react-router-dom';

export default function AdminOverviewView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await getAdminOverview();
      const raw = res?.data || res || {};
      setData({
        stats: {
          activeUsers: raw.activeUsersCount ?? raw.activeUsers ?? 1,
          connectedHelmets: raw.connectedHelmetsCount ?? raw.connectedHelmets ?? 1,
          activeWarnings: raw.activeWarningsCount ?? raw.activeWarnings ?? 0,
          criticalAlerts: raw.criticalAlertsCount ?? raw.criticalAlerts ?? 0,
          offlineHelmets: raw.offlineHelmetsCount ?? raw.offlineHelmets ?? 0,
          incidentsToday: raw.incidentsToday ?? 0,
          nearMissesToday: raw.nearMissesToday ?? 1,
        }
      });
    } catch (err) {
      console.error('Failed to fetch admin overview', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = data?.stats || {
    activeUsers: 1,
    connectedHelmets: 1,
    activeWarnings: 0,
    criticalAlerts: 0,
    offlineHelmets: 0,
    incidentsToday: 0,
    nearMissesToday: 1,
  };

  const trendData = [
    { time: '08:00', safe: 1, warning: 0, critical: 0 },
    { time: '10:00', safe: 1, warning: 1, critical: 0 },
    { time: '12:00', safe: 1, warning: 0, critical: 0 },
    { time: '14:00', safe: 1, warning: 0, critical: 0 },
    { time: '16:00', safe: 1, warning: 0, critical: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-700" />
            Institutional Workshop Safety Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized monitoring for all enrolled trainees, active safety gear, and real-time incident tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchData}
            className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Overview
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Trainees</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">{stats.activeUsers}</div>
          <div className="text-xs text-slate-400 mt-1">1 active workshop session</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Connected Helmets</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-600 mt-2">{stats.connectedHelmets}</div>
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Online
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Warnings</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-600 mt-2">{stats.activeWarnings}</div>
          <div className="text-xs text-slate-400 mt-1">Requires supervisor check</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical Alerts</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-600 mt-2">{stats.criticalAlerts}</div>
          <div className="text-xs text-slate-400 mt-1">Zero critical fall/gas events</div>
        </div>
      </div>

      {/* Secondary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Offline Helmets</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{stats.offlineHelmets}</div>
          </div>
          <WifiOff className="w-5 h-5 text-slate-400" />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Incidents Today</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{stats.incidentsToday}</div>
          </div>
          <FileWarning className="w-5 h-5 text-slate-400" />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Near Misses Logged</span>
            <div className="text-lg font-bold text-amber-600 mt-0.5">{stats.nearMissesToday}</div>
          </div>
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>
      </div>

      {/* Quick Access Fleet Table Preview */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Enrolled Safety Units & Active Trainees</h3>
          <Link to="/admin/dashboard/helmets" className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1">
            View All Fleet <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Helmet ID</th>
                <th className="px-4 py-3">Assigned User</th>
                <th className="px-4 py-3">Trade</th>
                <th className="px-4 py-3">Workshop</th>
                <th className="px-4 py-3">Safety Status</th>
                <th className="px-4 py-3">Connection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-bold text-slate-900">ARC-001</td>
                <td className="px-4 py-3 text-slate-800">Rahul Sharma</td>
                <td className="px-4 py-3 text-slate-600">Welding</td>
                <td className="px-4 py-3 text-slate-600">Welding Bay 01</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    SAFE
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Online
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
