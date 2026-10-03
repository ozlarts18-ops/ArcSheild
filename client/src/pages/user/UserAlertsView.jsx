import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, AlertOctagon, CheckCircle2, Filter, 
  Search, Clock, ShieldAlert, Check, ChevronRight
} from 'lucide-react';
import { getMyAlerts } from '../../services/api';

export default function UserAlertsView() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await getMyAlerts();
        setAlerts(data.alerts || []);
      } catch (err) {
        console.error('Failed to load user alerts', err);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const filteredAlerts = alerts.filter(item => {
    if (filterSeverity !== 'ALL' && item.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-700" />
            My Safety Alerts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Safety notifications, exposure warnings, and compliance alerts triggered on your assigned helmet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={filterSeverity} 
            onChange={e => setFilterSeverity(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Severities</option>
            <option value="WARNING">Warnings</option>
            <option value="CRITICAL">Critical</option>
            <option value="INFO">Informational</option>
          </select>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading your safety alert log...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Alerts Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You have no active safety alerts matching your current filter. Your operating conditions are normal.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAlerts.map(alert => (
              <div key={alert.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-start gap-3.5">
                <div className={`p-2 rounded-lg shrink-0 ${
                  alert.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-600' :
                  alert.severity === 'WARNING' ? 'bg-amber-50 text-amber-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {alert.severity === 'CRITICAL' ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                      alert.severity === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">{alert.type}</span>
                    <span className="text-xs text-slate-400">• {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    alert.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    alert.status === 'ACKNOWLEDGED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
