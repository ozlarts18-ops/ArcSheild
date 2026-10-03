import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Check,
  Search,
  MessageSquare,
  ShieldAlert,
  Clock,
  User,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { useArcShield } from '../context/ArcShieldContext';

export default function AlertsConsole() {
  const { alerts, updateAlertLifecycle, setSelectedHelmetId } = useArcShield();

  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [investigatingModalAlert, setInvestigatingModalAlert] = useState(null);
  const [supervisorNote, setSupervisorNote] = useState('');

  // Tab Filtering
  const filteredAlerts = alerts.filter((alert) => {
    const matchesTab = activeTab === 'ALL' || alert.lifecycleStatus === activeTab;
    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
    return matchesTab && matchesSeverity;
  });

  const activeCount = alerts.filter(a => a.lifecycleStatus === 'ACTIVE').length;
  const acknowledgedCount = alerts.filter(a => a.lifecycleStatus === 'ACKNOWLEDGED').length;
  const investigatingCount = alerts.filter(a => a.lifecycleStatus === 'INVESTIGATING').length;
  const resolvedCount = alerts.filter(a => a.lifecycleStatus === 'RESOLVED').length;

  const handleAcknowledge = (alertId) => {
    updateAlertLifecycle(alertId, 'ACKNOWLEDGED', 'Supervisor acknowledged alert.');
  };

  const handleStartInvestigating = (alert) => {
    setInvestigatingModalAlert(alert);
    setSupervisorNote(alert.supervisorAction || 'Checking work booth and ventilation/PPE.');
  };

  const handleConfirmInvestigation = () => {
    if (!investigatingModalAlert) return;
    updateAlertLifecycle(
      investigatingModalAlert.id,
      'INVESTIGATING',
      `Investigating: ${supervisorNote}`,
      supervisorNote
    );
    setInvestigatingModalAlert(null);
    setSupervisorNote('');
  };

  const handleResolve = (alertId) => {
    updateAlertLifecycle(
      alertId,
      'RESOLVED',
      'Issue verified resolved on site.',
      'Supervisor confirmed normal working conditions.'
    );
  };

  return (
    <div className="space-y-4">
      {/* Action Header & Tabs */}
      <div className="industrial-card p-4 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Safety Alert Management & Incident Lifecycle
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Real-time workplace hazard dispatcher and supervisor action console
            </p>
          </div>
        </div>

        {/* Lifecycle Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1 rounded-md border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1 rounded font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'ACTIVE'
                ? 'bg-[#0f294a] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Active</span>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold">
                {activeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ACKNOWLEDGED')}
            className={`px-3 py-1 rounded font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'ACKNOWLEDGED'
                ? 'bg-[#0f294a] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Acknowledged</span>
            {acknowledgedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px] font-mono">
                {acknowledgedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('INVESTIGATING')}
            className={`px-3 py-1 rounded font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'INVESTIGATING'
                ? 'bg-[#0f294a] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Investigating</span>
            {investigatingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-mono">
                {investigatingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-3 py-1 rounded font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'RESOLVED'
                ? 'bg-[#0f294a] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Resolved ({resolvedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-2.5 py-1 rounded font-semibold transition ${
              activeTab === 'ALL'
                ? 'bg-slate-200 text-slate-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({alerts.length})
          </button>
        </div>
      </div>

      {/* Alerts Stream List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="industrial-card p-10 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-800">No alerts in '{activeTab}' status</div>
            <p className="text-xs text-slate-500 mt-1">Workshop operating within configured safety bounds.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';

            return (
              <div
                key={alert.id}
                className={`industrial-card p-4 transition ${
                  alert.lifecycleStatus === 'ACTIVE'
                    ? isCritical
                      ? 'border-red-300 bg-red-50/40'
                      : 'border-amber-300 bg-amber-50/30'
                    : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  {/* Left: Severity & Description */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1 ${
                        isCritical
                          ? 'badge-critical pulse-critical'
                          : isWarning
                          ? 'badge-warning'
                          : 'badge-safe'
                      }`}>
                        {isCritical ? <AlertOctagon className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{alert.severity}</span>
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        alert.lifecycleStatus === 'ACTIVE'
                          ? 'bg-red-100 text-red-800 border border-red-200 font-bold'
                          : alert.lifecycleStatus === 'ACKNOWLEDGED'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : alert.lifecycleStatus === 'INVESTIGATING'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        Status: {alert.lifecycleStatus}
                      </span>

                      <span className="font-mono text-xs text-slate-400">ID: {alert.id}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-xs text-slate-500">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {alert.title}
                    </h3>

                    <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                      {alert.message}
                    </p>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-mono pt-1">
                      <div className="flex items-center gap-1 text-slate-800 font-semibold">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{alert.workerName}</span>
                        <span className="text-slate-500 font-normal">({alert.helmetId})</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{alert.workshopZone}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="text-amber-800 font-semibold">
                        Condition: {alert.value}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap lg:flex-col items-end gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 pt-3 lg:pt-0 lg:pl-4">
                    {alert.lifecycleStatus === 'ACTIVE' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-2xs flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Acknowledge</span>
                        </button>
                        <button
                          onClick={() => handleStartInvestigating(alert)}
                          className="px-3 py-1.5 rounded bg-[#0f294a] hover:bg-[#153e75] text-white font-semibold text-xs transition shadow-2xs"
                        >
                          Investigate
                        </button>
                      </div>
                    )}

                    {alert.lifecycleStatus === 'ACKNOWLEDGED' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartInvestigating(alert)}
                          className="px-3 py-1.5 rounded bg-[#0f294a] hover:bg-[#153e75] text-white font-semibold text-xs transition shadow-2xs flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Add Notes</span>
                        </button>
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition shadow-2xs"
                        >
                          Resolve
                        </button>
                      </div>
                    )}

                    {alert.lifecycleStatus === 'INVESTIGATING' && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-3.5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-2xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    )}

                    {alert.lifecycleStatus === 'RESOLVED' && (
                      <div className="text-right">
                        <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolved ({alert.responseDurationSeconds || 18}s response)
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedHelmetId(alert.helmetId)}
                      className="text-xs text-[#0f294a] font-semibold hover:underline flex items-center gap-1 transition mt-1"
                    >
                      <span>View Worker Profile</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Audit Timeline */}
                {alert.timeline && alert.timeline.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 bg-slate-50/70 p-2.5 rounded-md">
                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 font-mono">
                      Lifecycle Audit History
                    </div>
                    <div className="space-y-1">
                      {alert.timeline.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] font-mono">
                          <span className="text-slate-400 shrink-0">
                            {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          <span className="text-slate-300">→</span>
                          <span className="text-slate-700 font-bold">{step.status}:</span>
                          <span className="text-slate-600">{step.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Investigation Modal */}
      {investigatingModalAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg max-w-lg w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0f294a]" />
                <span>Log Supervisor Investigation — {investigatingModalAlert.id}</span>
              </h3>
              <button
                onClick={() => setInvestigatingModalAlert(null)}
                className="text-slate-400 hover:text-slate-600 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-3 rounded-md border border-slate-200">
              <div><strong>Hazard:</strong> {investigatingModalAlert.title}</div>
              <div><strong>Worker:</strong> {investigatingModalAlert.workerName} ({investigatingModalAlert.helmetId})</div>
              <div><strong>Zone:</strong> {investigatingModalAlert.workshopZone}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supervisor Corrective Notes:
              </label>
              <textarea
                value={supervisorNote}
                onChange={(e) => setSupervisorNote(e.target.value)}
                rows={3}
                placeholder="Detail action taken (e.g. inspected booth, checked ventilation airflow, instructed worker on safety gear)..."
                className="w-full bg-white border border-slate-300 rounded-md p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0f294a]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setInvestigatingModalAlert(null)}
                className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmInvestigation}
                className="px-4 py-1.5 rounded-md bg-[#0f294a] hover:bg-[#153e75] text-white text-xs font-bold"
              >
                Save & Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
