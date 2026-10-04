import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Clock,
  Check,
  ShieldAlert,
  X,
  User,
  HardHat
} from 'lucide-react';
import { fetchAdminAlertsApi, updateAdminAlertLifecycleApi } from '../../services/api';

export default function AdminAlertsView() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected Alert for Details
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const loadAlerts = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
    try {
      const res = await fetchAdminAlertsApi();
      const raw = res?.alerts || res?.data?.alerts || [];
      setAlerts(raw);
    } catch (err) {
      console.error('Failed to load admin alerts', err);
      setError('Unable to fetch alerts from dispatcher queue.');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(() => loadAlerts(false), 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (alertId, nextStatus, notes = '') => {
    setActionLoading(alertId);
    try {
      const res = await updateAdminAlertLifecycleApi(
        alertId,
        nextStatus,
        notes || `Supervisor updated status to ${nextStatus}`
      );
      if (res.success) {
        setActionNotice(`Alert ${alertId} transitioned to ${nextStatus}.`);
        setTimeout(() => setActionNotice(null), 3000);
        await loadAlerts();
      }
    } catch (err) {
      console.error('Failed to update alert lifecycle', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;

    if (search) {
      const term = search.toLowerCase();
      const matchWorker = (a.userName || '').toLowerCase().includes(term);
      const matchHelmet = (a.helmetId || '').toLowerCase().includes(term);
      const matchMsg = (a.message || '').toLowerCase().includes(term);
      const matchType = (a.type || '').toLowerCase().includes(term);
      if (!matchWorker && !matchHelmet && !matchMsg && !matchType) return false;
    }

    return true;
  });

  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'badge-critical pulse-critical';
      case 'WARNING':
        return 'badge-warning';
      default:
        return 'badge-offline';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'RESOLVED':
        return 'badge-safe';
      case 'ACKNOWLEDGED':
        return 'badge-syncing';
      case 'ACTIVE':
      default:
        return 'badge-warning';
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'Recent';
    try {
      const d = new Date(ts);
      return `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${d.toLocaleDateString()}`;
    } catch (e) {
      return ts;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="industrial-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-500">
            Safety Incident Response
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Centralized Alert Dispatcher
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time supervisor dispatching interface for triaging, acknowledging, and resolving workshop warnings.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => loadAlerts(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#0f294a]' : ''}`} />
            <span>Refresh Alerts</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-md text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 shadow-2xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {error && (
        <div className="industrial-card p-4 bg-amber-50/70 border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadAlerts(true)}
            className="px-2.5 py-1 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="industrial-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter alerts by worker, helmet, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-[#0f294a] focus:bg-white w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-slate-50 text-slate-700 focus:outline-hidden focus:border-[#0f294a]"
          >
            <option value="ALL">All Severities</option>
            <option value="WARNING">Warnings Only</option>
            <option value="CRITICAL">Critical Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-slate-50 text-slate-700 focus:outline-hidden focus:border-[#0f294a]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="industrial-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="industrial-table-header">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Helmet</th>
                <th className="px-4 py-3">Alert</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading alerts queue...
                  </td>
                </tr>
              ) : filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="font-bold text-slate-800 text-sm">No active safety alerts</p>
                    <p className="text-xs text-slate-500 mt-1">
                      All monitored safety parameters are within verified operational thresholds.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((a) => {
                  const isResolved = a.status === 'RESOLVED';
                  const isAck = a.status === 'ACKNOWLEDGED';

                  return (
                    <tr key={a.id} className="industrial-table-row">
                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {formatTimestamp(a.timestamp)}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {a.userName || 'Assigned Worker'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">
                        {a.helmetId || 'ARC-001'}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-bold text-slate-800">{a.type}</div>
                        <div className="text-[11px] text-slate-600 truncate">{a.message}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${getSeverityBadge(
                            a.severity
                          )}`}
                        >
                          {a.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${getStatusBadge(
                            a.status
                          )}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedAlert(a)}
                            title="View Alert Details"
                            className="p-1 text-slate-500 hover:text-[#0f294a] hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {a.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleAction(a.id, 'ACKNOWLEDGED')}
                              disabled={actionLoading === a.id}
                              className="px-2 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-semibold cursor-pointer transition"
                            >
                              Acknowledge
                            </button>
                          )}

                          {!isResolved && (
                            <button
                              onClick={() => handleAction(a.id, 'RESOLVED')}
                              disabled={actionLoading === a.id}
                              className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded text-[11px] font-semibold cursor-pointer transition"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                Alert Record: {selectedAlert.id}
              </h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-[10px] uppercase font-bold text-slate-500">Alert Notification</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{selectedAlert.type}</p>
                <p className="text-slate-600 mt-0.5">{selectedAlert.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Affected Worker</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">{selectedAlert.userName || 'Assigned Worker'}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Helmet Hardware</span>
                  <p className="text-sm font-bold text-slate-800 font-mono mt-1">{selectedAlert.helmetId || 'ARC-001'}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Severity</span>
                  <p className="text-sm font-bold text-rose-700 mt-1">{selectedAlert.severity}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Lifecycle State</span>
                  <p className="text-sm font-bold text-emerald-700 mt-1">{selectedAlert.status}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Close
                </button>

                {selectedAlert.status !== 'RESOLVED' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleAction(selectedAlert.id, 'RESOLVED');
                      setSelectedAlert(null);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-semibold cursor-pointer transition"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
