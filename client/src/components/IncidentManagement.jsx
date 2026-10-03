import React, { useState } from 'react';
import {
  FileWarning,
  AlertOctagon,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  MapPin,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { useArcShield } from '../context/ArcShieldContext';

export default function IncidentManagement() {
  const { incidents, createIncident, setSelectedHelmetId } = useArcShield();

  const [activeTab, setActiveTab] = useState('ALL'); // ALL, INCIDENT, NEAR_MISS
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [newType, setNewType] = useState('NEAR_MISS');
  const [newHelmetId, setNewHelmetId] = useState('AS-001');
  const [newWorkerName, setNewWorkerName] = useState('Rajesh Sharma');
  const [newTrade, setNewTrade] = useState('Welding');
  const [newZone, setNewZone] = useState('Welding Bay 1');
  const [newSeverity, setNewSeverity] = useState('MEDIUM');
  const [newEventType, setNewEventType] = useState('HELMET_REMOVAL_UNSAFE_ZONE');
  const [newDescription, setNewDescription] = useState('');
  const [newSupervisorAction, setNewSupervisorAction] = useState('');

  const filtered = incidents.filter((item) => {
    const matchesTab = activeTab === 'ALL' || item.type === activeTab;
    const matchesSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.workshopZone.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSeverity && matchesSearch;
  });

  const incidentCount = incidents.filter(i => i.type === 'INCIDENT').length;
  const nearMissCount = incidents.filter(i => i.type === 'NEAR_MISS').length;

  const handleSubmitNew = (e) => {
    e.preventDefault();
    createIncident({
      type: newType,
      helmetId: newHelmetId,
      workerName: newWorkerName,
      trade: newTrade,
      workshopZone: newZone,
      severity: newSeverity,
      eventType: newEventType,
      sensorSource: 'Supervisor Observation',
      description: newDescription || 'Observation recorded during training session',
      supervisorAction: newSupervisorAction || 'Reviewed with training cohort'
    });
    setShowCreateModal(false);
    setNewDescription('');
    setNewSupervisorAction('');
  };

  return (
    <div className="space-y-4">
      {/* Header & Distinction Banner */}
      <div className="industrial-card p-4 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-amber-600" />
              <span>Incident & Near-Miss Management Register</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict formal tracking separating actual hazardous incidents from pre-incident near misses
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0f294a] hover:bg-[#153e75] text-white font-bold text-xs transition shadow-2xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Log Safety Record</span>
          </button>
        </div>

        {/* Informational distinction cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
          <div className="bg-red-50/60 border border-red-200 p-3 rounded-md">
            <div className="flex items-center justify-between text-xs font-bold text-red-700">
              <span className="flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" />
                <span>INCIDENTS ({incidentCount})</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-red-700 border border-red-200">
                Significant Unsafe Events
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Events causing physical impact, worker falls, or direct hazardous exposure requiring supervisor response and investigation.
            </p>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-md">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>NEAR MISSES ({nearMissCount})</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-amber-800 border border-amber-200">
                Pre-Incident Conditions
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Unsafe conditions detected early (helmet removed during active shift, gas byproduct buildup, unshielded arc flash) before an accident occurs.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="industrial-card p-3 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium mr-1">Classification:</span>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 rounded font-semibold transition ${
              activeTab === 'ALL' ? 'bg-[#0f294a] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Records ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab('INCIDENT')}
            className={`px-3 py-1 rounded font-semibold transition ${
              activeTab === 'INCIDENT' ? 'bg-[#0f294a] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Incidents ({incidentCount})
          </button>
          <button
            onClick={() => setActiveTab('NEAR_MISS')}
            className={`px-3 py-1 rounded font-semibold transition ${
              activeTab === 'NEAR_MISS' ? 'bg-[#0f294a] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Near-Misses ({nearMissCount})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search incident ID, trainee, zone, cause..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1 text-xs text-slate-800 focus:outline-none focus:border-slate-400 w-56 lg:w-72"
          />
        </div>
      </div>

      {/* Incident Records Table */}
      <div className="industrial-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="industrial-table-header">
              <th className="py-2.5 px-3.5">ID / Type</th>
              <th className="py-2.5 px-3">Date / Time</th>
              <th className="py-2.5 px-3">Worker & Trade</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Condition & Description</th>
              <th className="py-2.5 px-3">Supervisor Action & Resolution</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.map((item) => {
              const isIncident = item.type === 'INCIDENT';
              return (
                <tr key={item.id} className="industrial-table-row">
                  {/* 1. ID & Type */}
                  <td className="py-3 px-3.5">
                    <div className="font-mono font-bold text-slate-900 text-[12px]">{item.id}</div>
                    <span className={`inline-block px-2 py-0.2 rounded text-[10px] font-mono font-bold mt-1 border ${
                      isIncident
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {item.type}
                    </span>
                  </td>

                  {/* 2. Date / Time */}
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                    <div className="font-semibold text-slate-800">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-[10px] text-slate-400">{item.timestamp.slice(0, 10)}</div>
                  </td>

                  {/* 3. Worker / Trade */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{item.workerName}</div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {item.helmetId} • {item.trade}
                    </div>
                  </td>

                  {/* 4. Location */}
                  <td className="py-3 px-3">
                    <div className="text-slate-800 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.workshopZone}</span>
                    </div>
                  </td>

                  {/* 5. Description */}
                  <td className="py-3 px-3 max-w-xs">
                    <p className="text-slate-800 text-xs font-medium leading-relaxed">{item.description}</p>
                    <div className="text-[10px] font-mono text-amber-800 mt-0.5">
                      Event: {item.eventType}
                    </div>
                  </td>

                  {/* 6. Supervisor Action */}
                  <td className="py-3 px-3 max-w-xs">
                    <div className="text-slate-800 text-xs">{item.supervisorAction}</div>
                    <div className="text-[10px] text-emerald-700 font-mono mt-0.5 font-semibold">
                      Resolution: {item.resolution}
                    </div>
                  </td>

                  {/* 7. Status */}
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      item.status === 'CLOSED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {item.status}
                    </span>
                    {item.responseTimeSeconds && (
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {item.responseTimeSeconds}s response
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Manual Safety Log Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg max-w-xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-[#0f294a]" />
                <span>Log New Safety Incident / Near-Miss Record</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Record Type:</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800 font-semibold"
                  >
                    <option value="NEAR_MISS">NEAR MISS (Condition caught early)</option>
                    <option value="INCIDENT">INCIDENT (Significant unsafe event / Fall)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Severity:</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Helmet ID:</label>
                  <input
                    type="text"
                    value={newHelmetId}
                    onChange={(e) => setNewHelmetId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Worker Name:</label>
                  <input
                    type="text"
                    value={newWorkerName}
                    onChange={(e) => setNewWorkerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Trade:</label>
                  <select
                    value={newTrade}
                    onChange={(e) => setNewTrade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800"
                  >
                    <option value="Welding">Welding</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Workshop Zone:</label>
                <input
                  type="text"
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Detailed Description & Observation:</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe what occurred, unsafe behaviors, or equipment hazards..."
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Supervisor Action Taken:</label>
                <textarea
                  value={newSupervisorAction}
                  onChange={(e) => setNewSupervisorAction(e.target.value)}
                  rows={2}
                  placeholder="Immediate corrective intervention, retraining, or safety briefing..."
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#0f294a] hover:bg-[#153e75] text-white font-bold"
                >
                  Save to Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
