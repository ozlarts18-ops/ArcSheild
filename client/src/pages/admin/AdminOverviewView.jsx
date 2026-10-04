import React, { useState, useEffect } from 'react';
import {
  Users,
  HardHat,
  AlertTriangle,
  AlertOctagon,
  WifiOff,
  FileWarning,
  RefreshCw,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
  MapPin,
  X
} from 'lucide-react';
import { fetchAdminOverviewApi, fetchAdminUsersApi } from '../../services/api';
import { Link } from 'react-router-dom';

export default function AdminOverviewView() {
  const [data, setData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
    try {
      const [overviewRes, usersRes] = await Promise.all([
        fetchAdminOverviewApi(),
        fetchAdminUsersApi()
      ]);

      if (overviewRes && overviewRes.success) {
        setData(overviewRes.data);
      } else {
        setError(overviewRes?.message || 'Awaiting monitoring data from workshop units.');
      }

      if (usersRes && usersRes.success) {
        setUsersList(usersRes.users || usersRes.data?.users || []);
      }
    } catch (err) {
      console.error('Failed to load admin overview', err);
      setError('Unable to retrieve workshop safety telemetry.');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = data || {
    activeUsersCount: 0,
    connectedHelmetsCount: 0,
    activeWarningsCount: 0,
    criticalAlertsCount: 0,
    offlineHelmetsCount: 0,
    incidentsToday: 0,
    nearMissesToday: 0
  };

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

  const formatLastActive = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
      if (diffMin <= 1) return '1 min ago';
      if (diffMin < 60) return `${diffMin} min ago`;
      const diffHours = Math.round(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="industrial-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-500">
            Organization Safety Console
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Workshop Safety Overview
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Monitor registered users, safety gear, active safety conditions and safety events across your organization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#0f294a]' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {error && !data && (
        <div className="industrial-card p-4 bg-amber-50/70 border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData(true)}
            className="px-2.5 py-1 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Grid - Clean 7-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Active Users */}
        <div className="industrial-card industrial-card-hover p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Active Users
            </span>
            <div className="p-1.5 rounded-md bg-blue-50 text-[#0f294a]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 telemetry-mono">
            {loading ? '—' : stats.activeUsersCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.activeUsersCount === 1 ? '1 registered user on record' : `${stats.activeUsersCount} registered users on record`}
          </div>
        </div>

        {/* Connected Helmets */}
        <div className="industrial-card industrial-card-hover p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Connected Helmets
            </span>
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 telemetry-mono">
            {loading ? '—' : stats.connectedHelmetsCount}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Transmitting telemetry
          </div>
        </div>

        {/* Active Warnings */}
        <div className="industrial-card industrial-card-hover p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Active Warnings
            </span>
            <div className="p-1.5 rounded-md bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2 telemetry-mono">
            {loading ? '—' : stats.activeWarningsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.activeWarningsCount === 0 ? 'No threshold breaches' : 'Elevated threshold detected'}
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="industrial-card industrial-card-hover p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Critical Alerts
            </span>
            <div className="p-1.5 rounded-md bg-red-50 text-red-700">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2 telemetry-mono">
            {loading ? '—' : stats.criticalAlertsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.criticalAlertsCount === 0 ? 'Zero critical fall/gas events' : 'Immediate intervention required'}
          </div>
        </div>

        {/* Offline Helmets */}
        <div className="industrial-card industrial-card-hover p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Offline Helmets
            </span>
            <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
              <WifiOff className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-700 mt-2 telemetry-mono">
            {loading ? '—' : stats.offlineHelmetsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.offlineHelmetsCount === 0 ? 'All units reporting' : 'Disconnected units'}
          </div>
        </div>

        {/* Incidents Today */}
        <div className="industrial-card industrial-card-hover p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Incidents Today
            </span>
            <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
              <FileWarning className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 telemetry-mono">
            {loading ? '—' : stats.incidentsToday}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.incidentsToday === 0 ? 'Zero safety breaches today' : `${stats.incidentsToday} logged incidents`}
          </div>
        </div>

        {/* Near Misses */}
        <div className="industrial-card industrial-card-hover p-4 sm:col-span-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Near Misses
            </span>
            <div className="p-1.5 rounded-md bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2 telemetry-mono">
            {loading ? '—' : stats.nearMissesToday}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Proactive hazards flagged for safety review & preventive coaching
          </div>
        </div>
      </div>

      {/* ACTIVE USERS & SAFETY GEAR TABLE */}
      <div className="industrial-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0f294a]" />
              Active Users & Safety Gear
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live roster of registered personnel paired with ArcShield units, current safety readings, and workshop locations.
            </p>
          </div>
          <Link
            to="/admin/dashboard/users"
            className="text-xs font-semibold text-[#0f294a] hover:underline self-start sm:self-auto"
          >
            Manage All Users →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="industrial-table-header">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Helmet ID</th>
                <th className="px-4 py-3">Trade</th>
                <th className="px-4 py-3">Workshop / Zone</th>
                <th className="px-4 py-3">Safety Status</th>
                <th className="px-4 py-3">Connection</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading registered personnel and safety units...
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-800 text-sm">No registered users on record</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Awaiting user registration or synchronization with safety database.
                    </p>
                    <Link
                      to="/admin/dashboard/users"
                      className="mt-3 inline-block px-3.5 py-1.5 bg-[#0f294a] text-white text-xs font-semibold rounded-md shadow-2xs hover:bg-[#153e75]"
                    >
                      + Add First User
                    </Link>
                  </td>
                </tr>
              ) : (
                usersList.map((worker) => {
                  const safetyStatus = worker.currentSafety || worker.safetyStatus || 'SAFE';
                  const isOnline = (worker.connection || '').toLowerCase() === 'online';

                  return (
                    <tr key={worker.id || worker.email} className="industrial-table-row">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-[#0f294a] text-white font-bold flex items-center justify-center text-xs">
                            {worker.name
                              ? worker.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()
                              : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{worker.name}</span>
                            <span className="text-[11px] text-slate-500 font-normal">{worker.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 text-[11px]">
                          {worker.assignedHelmet || worker.helmetId || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{worker.trade || 'Industrial Welding'}</td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {worker.workshop || 'Welding Bay 01'}
                        {worker.zone ? ` (${worker.zone})` : ''}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${getSafetyBadgeClass(
                            safetyStatus
                          )}`}
                        >
                          {safetyStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold text-xs ${
                            isOnline ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                        {formatLastActive(worker.lastActive || worker.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedUser(worker)}
                          className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 text-[#0f294a] hover:bg-slate-50 rounded-md transition shadow-2xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User / Safety Unit Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0f294a]" />
                Worker Safety & Gear Details
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                <div className="w-10 h-10 rounded bg-[#0f294a] text-white font-bold flex items-center justify-center text-sm">
                  {selectedUser.name?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">{selectedUser.name}</h4>
                  <p className="text-slate-500">{selectedUser.email}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getSafetyBadgeClass(
                    selectedUser.currentSafety || selectedUser.safetyStatus || 'SAFE'
                  )}`}
                >
                  {selectedUser.currentSafety || selectedUser.safetyStatus || 'SAFE'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Assigned Safety Gear</span>
                  <p className="text-sm font-bold text-[#0f294a] font-mono mt-1">
                    {selectedUser.assignedHelmet || selectedUser.helmetId || 'Unassigned'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Connection State</span>
                  <p className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {selectedUser.connection || 'Online'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Trade Specialization</span>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedUser.trade || 'Industrial Welding'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Assigned Workshop Bay</span>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedUser.workshop || 'Welding Bay 01'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-md">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Operational Safety Status
                </span>
                <p className="text-emerald-900 text-xs mt-1">
                  Worker is operating safely within prescribed environmental and thermal limits. PPE helmet is securely paired.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Close
                </button>
                <Link
                  to="/admin/dashboard/users"
                  className="px-4 py-2 bg-[#0f294a] hover:bg-[#153e75] text-white rounded-md font-semibold cursor-pointer transition text-center"
                >
                  Go to Users Directory
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
