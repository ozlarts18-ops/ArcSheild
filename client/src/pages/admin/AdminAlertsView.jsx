import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, AlertOctagon, CheckCircle2, Filter, 
  ShieldAlert, Check, Clock, User, HardHat, RefreshCw
} from 'lucide-react';
import { getAdminAlerts, updateAlertLifecycle } from '../../services/api';

export default function AdminAlertsView() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadAlerts = async () => {
    try {
      const data = await getAdminAlerts();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Failed to load admin alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (alertId, nextStatus) => {
    try {
      await updateAlertLifecycle(alertId, nextStatus, 'Supervisor acknowledged via Directorate console');
      loadAlerts();
    } catch (err) {
      console.error('Failed to update alert lifecycle', err);
    }
  };

  const filtered = alerts.filter(a => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-700" />
            Centralized Alert Dispatcher & Lifecycle Manager
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time supervisor dispatching interface for triaging, acknowledging, and resolving workshop warnings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Severities</option>
            <option value="WARNING">Warnings</option>
            <option value="CRITICAL">Critical Alerts</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Severity & Type</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Affected Worker</th>
                <th className="px-4 py-3">Helmet & Bay</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">Loading alerts queue...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">No active alerts matching criteria.</td>
                </tr>
              ) : (
                filtered.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {a.severity}
                        </span>
                        <span className="font-semibold text-slate-800">{a.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 max-w-xs truncate">{a.message}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{a.userName || 'Rahul Sharma'}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-mono">{a.helmetId || 'ARC-001'}</td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        a.status === 'ACKNOWLEDGED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {a.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleAction(a.id, 'ACKNOWLEDGED')}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md mr-1.5 transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}
                      {a.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleAction(a.id, 'RESOLVED')}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
