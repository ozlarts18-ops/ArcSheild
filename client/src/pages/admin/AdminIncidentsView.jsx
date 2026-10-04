import React, { useState, useEffect } from 'react';
import {
  FileWarning,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Eye,
  X,
  Calendar,
  User,
  HardHat
} from 'lucide-react';
import {
  fetchAdminIncidentsApi,
  createAdminIncidentApi,
  fetchAdminUsersApi
} from '../../services/api';

export default function AdminIncidentsView() {
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const [activeTab, setActiveTab] = useState('ALL'); // ALL, INCIDENTS, NEAR_MISSES
  const [search, setSearch] = useState('');

  // Modals
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const [form, setForm] = useState({
    type: 'NEAR_MISS',
    title: '',
    description: '',
    affectedUser: '',
    helmetId: 'ARC-001',
    workshop: 'Welding Bay 01',
    actionTaken: ''
  });
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState(null);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
    try {
      const [incRes, usersRes] = await Promise.all([
        fetchAdminIncidentsApi(),
        fetchAdminUsersApi()
      ]);

      if (incRes && incRes.success) {
        setIncidents(incRes.incidents || incRes.data?.incidents || []);
      } else {
        setError(incRes?.message || 'Failed to fetch incident log.');
      }

      if (usersRes && usersRes.success) {
        setUsers(usersRes.users || usersRes.data?.users || []);
        if (usersRes.users?.length > 0 && !form.affectedUser) {
          setForm((prev) => ({ ...prev, affectedUser: usersRes.users[0].name }));
        }
      }
    } catch (err) {
      console.error('Failed to load incidents', err);
      setError('Unable to load incidents register.');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setLogLoading(true);
    setLogError(null);
    try {
      const res = await createAdminIncidentApi(form);
      if (res.success) {
        setActionNotice(
          `${form.type === 'INCIDENT' ? 'Incident' : 'Near-Miss'} logged successfully.`
        );
        setTimeout(() => setActionNotice(null), 4000);
        setLogModalOpen(false);
        setForm({
          type: 'NEAR_MISS',
          title: '',
          description: '',
          affectedUser: users[0]?.name || 'Active Worker',
          helmetId: 'ARC-001',
          workshop: 'Welding Bay 01',
          actionTaken: ''
        });
        await loadData();
      } else {
        setLogError(res.message || 'Failed to save event record.');
      }
    } catch (err) {
      setLogError(err.message || 'Error creating incident.');
    } finally {
      setLogLoading(false);
    }
  };

  const filteredItems = incidents.filter((item) => {
    if (activeTab === 'INCIDENTS' && item.type !== 'INCIDENT') return false;
    if (activeTab === 'NEAR_MISSES' && item.type !== 'NEAR_MISS') return false;

    if (search) {
      const term = search.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(term);
      const matchDesc = (item.description || '').toLowerCase().includes(term);
      const matchWorker = (item.affectedUser || '').toLowerCase().includes(term);
      const matchHelmet = (item.helmetId || '').toLowerCase().includes(term);
      if (!matchTitle && !matchDesc && !matchWorker && !matchHelmet) return false;
    }

    return true;
  });

  const incidentItems = incidents.filter((i) => i.type === 'INCIDENT');
  const nearMissItems = incidents.filter((i) => i.type === 'NEAR_MISS');

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
            Safety Governance & Investigations
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Incidents & Near-Misses Register
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Formal institutional audit trail for compliance review, root-cause investigations, and preventive actions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#0f294a]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setLogError(null);
              setLogModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0f294a] hover:bg-[#153e75] text-white rounded-md text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Safety Event</span>
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
            onClick={() => loadData(true)}
            className="px-2.5 py-1 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="industrial-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#0f294a] text-white shadow-2xs'
                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Events ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab('INCIDENTS')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === 'INCIDENTS'
                ? 'bg-red-700 text-white shadow-2xs'
                : 'bg-red-50 border border-red-200 text-red-800 hover:bg-red-100'
            }`}
          >
            Incidents ({incidentItems.length})
          </button>
          <button
            onClick={() => setActiveTab('NEAR_MISSES')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === 'NEAR_MISSES'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Near Misses ({nearMissItems.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search records by worker, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-[#0f294a] focus:bg-white w-full"
          />
        </div>
      </div>

      {/* Events Register Table */}
      <div className="industrial-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="industrial-table-header">
              <tr>
                <th className="px-4 py-3">Date / Time</th>
                <th className="px-4 py-3">Classification</th>
                <th className="px-4 py-3">Title & Context</th>
                <th className="px-4 py-3">Affected User</th>
                <th className="px-4 py-3">Helmet ID</th>
                <th className="px-4 py-3">Corrective Resolution</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading incidents register...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="font-bold text-slate-800 text-sm">No recorded events for this period</p>
                    <p className="text-xs text-slate-500 mt-1">
                      No safety incidents or near misses recorded in the system.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isIncident = item.type === 'INCIDENT';

                  return (
                    <tr key={item.id} className="industrial-table-row">
                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {formatTimestamp(item.timestamp)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                            isIncident ? 'badge-critical' : 'badge-warning'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.description}</p>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        {item.affectedUser || 'Worker'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">
                        {item.helmetId || 'ARC-001'}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs text-slate-600">
                        {item.actionTaken ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{item.actionTaken}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Investigation complete</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setViewModalOpen(true);
                          }}
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

      {/* ========================================================================= */}
      {/* LOG EVENT MODAL                                                           */}
      {/* ========================================================================= */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-[#0f294a]" />
                Log Safety Incident or Near-Miss
              </h3>
              <button
                onClick={() => setLogModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {logError && (
              <div className="mt-3 p-2.5 rounded-md text-xs bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{logError}</span>
              </div>
            )}

            <form onSubmit={handleLogSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Classification</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-slate-200 rounded-md p-2 bg-slate-50 text-xs font-semibold focus:outline-hidden focus:border-[#0f294a]"
                >
                  <option value="NEAR_MISS">Near-Miss (Hazard avoided / potential risk flagged)</option>
                  <option value="INCIDENT">Safety Incident (Safety protocol breached / exposure event)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unlatched shield during arc ignition"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Affected Worker</label>
                  <select
                    value={form.affectedUser}
                    onChange={(e) => setForm({ ...form, affectedUser: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs bg-slate-50 focus:outline-hidden focus:border-[#0f294a]"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} ({u.trade || 'Welding'})
                      </option>
                    ))}
                    {users.length === 0 && <option value="Active Worker">Active Worker</option>}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Associated Helmet ID</label>
                  <input
                    type="text"
                    value={form.helmetId}
                    onChange={(e) => setForm({ ...form, helmetId: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Workshop Bay / Zone</label>
                <input
                  type="text"
                  value={form.workshop}
                  onChange={(e) => setForm({ ...form, workshop: e.target.value })}
                  className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide precise details, context, and immediate supervisor observations..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corrective Action Taken</label>
                <input
                  type="text"
                  placeholder="e.g. Work halted, supervisor reminded proper pre-weld check"
                  value={form.actionTaken}
                  onChange={(e) => setForm({ ...form, actionTaken: e.target.value })}
                  className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logLoading}
                  className="px-4 py-2 bg-[#0f294a] hover:bg-[#153e75] text-white rounded-md font-semibold cursor-pointer transition flex items-center gap-1.5"
                >
                  {logLoading ? 'Saving...' : 'Save Safety Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW EVENT DETAILS MODAL                                                  */}
      {/* ========================================================================= */}
      {viewModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-[#0f294a]" />
                Event File: {selectedItem.id}
              </h3>
              <button
                onClick={() => setViewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">{selectedItem.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      selectedItem.type === 'INCIDENT' ? 'badge-critical' : 'badge-warning'
                    }`}
                  >
                    {selectedItem.type}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Affected Worker</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">{selectedItem.affectedUser}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Helmet Hardware</span>
                  <p className="text-sm font-bold text-slate-800 font-mono mt-1">{selectedItem.helmetId}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Workshop Location</span>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{selectedItem.workshop}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Recorded Timestamp</span>
                  <p className="text-[11px] font-mono text-slate-700 mt-1">
                    {formatTimestamp(selectedItem.timestamp)}
                  </p>
                </div>
              </div>

              {selectedItem.actionTaken && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-md">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Corrective & Preventive Action
                  </span>
                  <p className="text-emerald-900 text-xs mt-1">{selectedItem.actionTaken}</p>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2 bg-[#0f294a] hover:bg-[#153e75] text-white rounded-md font-semibold cursor-pointer transition"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
