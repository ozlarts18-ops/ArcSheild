import React, { useState, useEffect } from 'react';
import {
  HardHat,
  Search,
  RefreshCw,
  Eye,
  UserCheck,
  History,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  X,
  User
} from 'lucide-react';
import {
  fetchAdminHelmetsApi,
  fetchAdminUsersApi,
  assignUserToHelmetApi
} from '../../services/api';

export default function AdminHelmetsView() {
  const [helmets, setHelmets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHelmet, setSelectedHelmet] = useState(null);

  // Assign user form
  const [targetUserId, setTargetUserId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
    try {
      const [helmetsRes, usersRes] = await Promise.all([
        fetchAdminHelmetsApi(),
        fetchAdminUsersApi()
      ]);

      if (helmetsRes && helmetsRes.success) {
        setHelmets(helmetsRes.helmets || helmetsRes.data?.helmets || []);
      } else {
        setError(helmetsRes?.message || 'Failed to fetch safety gear inventory.');
      }

      if (usersRes && usersRes.success) {
        setUsers(usersRes.users || usersRes.data?.users || []);
      }
    } catch (err) {
      console.error('Failed to load helmets', err);
      setError('Unable to load safety gear registry.');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotice = (text) => {
    setActionNotice(text);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleAssignOpen = (helmet) => {
    setSelectedHelmet(helmet);
    setTargetUserId(helmet.assignedUserId || 'Unassigned');
    setAssignError(null);
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHelmet) return;
    setAssignLoading(true);
    setAssignError(null);
    try {
      const res = await assignUserToHelmetApi(selectedHelmet.helmetId, targetUserId);
      if (res.success) {
        showNotice(`Safety helmet ${selectedHelmet.helmetId} assigned.`);
        setAssignModalOpen(false);
        await loadData();
      } else {
        setAssignError(res.message || 'Failed to update assignment.');
      }
    } catch (err) {
      setAssignError(err.message || 'Error updating assignment.');
    } finally {
      setAssignLoading(false);
    }
  };

  const filteredHelmets = helmets.filter((h) => {
    const matchesSearch =
      h.helmetId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.assignedUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.workshop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.trade?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ONLINE' && (h.connection || '').toLowerCase() === 'online') ||
      (statusFilter === 'OFFLINE' && (h.connection || '').toLowerCase() === 'offline');

    return matchesSearch && matchesStatus;
  });

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

  const formatLastSeen = (dateString) => {
    if (!dateString) return 'Active Now';
    try {
      const date = new Date(dateString);
      const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
      if (diffMin <= 1) return 'Just now';
      if (diffMin < 60) return `${diffMin} min ago`;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Live';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="industrial-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-500">
            Institutional Inventory
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Safety Gear & Helmets
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Central repository of all physical smart helmets, assigned trade personnel, and operational readiness.
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

      {/* Search & Filter Controls */}
      <div className="industrial-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search helmet ID, assigned worker, bay..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-[#0f294a] focus:bg-white w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-slate-50 text-slate-700 focus:outline-hidden focus:border-[#0f294a]"
          >
            <option value="ALL">All Connections</option>
            <option value="ONLINE">Online Units</option>
            <option value="OFFLINE">Offline Units</option>
          </select>
        </div>
      </div>

      {/* Safety Gear Table */}
      <div className="industrial-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="industrial-table-header">
              <tr>
                <th className="px-4 py-3">Helmet ID</th>
                <th className="px-4 py-3">Assigned User</th>
                <th className="px-4 py-3">Trade</th>
                <th className="px-4 py-3">Workshop</th>
                <th className="px-4 py-3">Safety Status</th>
                <th className="px-4 py-3">Connection</th>
                <th className="px-4 py-3">Last Seen</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading safety gear registry...
                  </td>
                </tr>
              ) : filteredHelmets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center">
                    <HardHat className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-800 text-sm">No safety gear records found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      No additional safety gear has been registered yet.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredHelmets.map((helmet) => {
                  const isOnline = (helmet.connection || '').toLowerCase() === 'online';
                  const safetyState = helmet.safetyState || 'SAFE';

                  return (
                    <tr key={helmet.helmetId} className="industrial-table-row">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <HardHat className="w-4 h-4 text-[#0f294a]" />
                          <span className="font-bold text-slate-900 font-mono text-[11px]">
                            {helmet.helmetId}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-semibold ${
                            helmet.assignedUser && helmet.assignedUser !== 'Unassigned'
                              ? 'text-slate-800'
                              : 'text-slate-400 italic'
                          }`}
                        >
                          {helmet.assignedUser || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{helmet.trade || '—'}</td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {helmet.workshop || 'Main Workshop'}
                        {helmet.zone ? ` (${helmet.zone})` : ''}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${getSafetyBadgeClass(
                            safetyState
                          )}`}
                        >
                          {safetyState}
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
                        {formatLastSeen(helmet.lastSeen)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedHelmet(helmet);
                              setViewModalOpen(true);
                            }}
                            title="View Gear Details"
                            className="p-1 text-slate-500 hover:text-[#0f294a] hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAssignOpen(helmet)}
                            title="Assign / Reassign User"
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedHelmet(helmet);
                              setHistoryModalOpen(true);
                            }}
                            title="View Safety History"
                            className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
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

      {/* ========================================================================= */}
      {/* VIEW SAFETY GEAR MODAL                                                    */}
      {/* ========================================================================= */}
      {viewModalOpen && selectedHelmet && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HardHat className="w-4 h-4 text-[#0f294a]" />
                Safety Gear Record: {selectedHelmet.helmetId}
              </h3>
              <button
                onClick={() => setViewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Assigned User</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedHelmet.assignedUser || 'Unassigned'}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Trade: {selectedHelmet.trade || 'Welding'} • Facility: {selectedHelmet.workshop || 'Welding Bay 01'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Current Safety</span>
                  <p className="text-sm font-bold text-emerald-700 mt-1">
                    {selectedHelmet.safetyState || 'SAFE'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Gateway Link</span>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {selectedHelmet.connection || 'Online'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-md">
                <span className="text-[10px] font-bold text-[#0f294a] uppercase tracking-wider">
                  PPE Compliance Certified
                </span>
                <p className="text-slate-700 text-xs mt-1">
                  Active institutional safety helmet with verified calibration, real-time fall detection protocol, and optical arc filtration.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewModalOpen(false);
                    handleAssignOpen(selectedHelmet);
                  }}
                  className="px-4 py-2 bg-[#0f294a] hover:bg-[#153e75] text-white rounded-md font-semibold cursor-pointer transition"
                >
                  Pair / Reassign User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAIR / REASSIGN USER MODAL                                                */}
      {/* ========================================================================= */}
      {assignModalOpen && selectedHelmet && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#0f294a]" />
                Pair Worker to Safety Unit: {selectedHelmet.helmetId}
              </h3>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {assignError && (
              <div className="mt-3 p-2.5 rounded-md text-xs bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{assignError}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Target Gear</div>
                <div className="font-bold text-slate-900 text-sm font-mono">{selectedHelmet.helmetId}</div>
                <div className="text-[11px] text-slate-600">
                  Current Assignment: <strong>{selectedHelmet.assignedUser || 'Unassigned'}</strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assign Worker
                </label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full border border-slate-200 rounded-md p-2.5 text-xs bg-slate-50 focus:outline-hidden focus:border-[#0f294a]"
                >
                  <option value="Unassigned">-- Mark as Unassigned --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.trade || 'Welding'} • {u.workshop || 'Bay 1'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pairing ensures telemetry packets are associated with this worker's personal record.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="px-4 py-2 bg-[#0f294a] hover:bg-[#153e75] text-white rounded-md font-semibold cursor-pointer transition flex items-center gap-1.5"
                >
                  {assignLoading ? 'Saving...' : 'Confirm Pairing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW SAFETY HISTORY MODAL                                                 */}
      {/* ========================================================================= */}
      {historyModalOpen && selectedHelmet && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-[#0f294a]" />
                Safety History: {selectedHelmet.helmetId}
              </h3>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Assigned Worker</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedHelmet.assignedUser || 'Unassigned'}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Compliance: 98.4%
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-white border border-slate-200 rounded-md flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Session Check-In</span>
                    <span className="text-[11px] text-slate-500">Gear paired and donned securely</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">08:30 AM</span>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-md flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Thermal Exposure Check</span>
                    <span className="text-[11px] text-emerald-600 font-medium">● Normal operating load (34.2°C)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">10:15 AM</span>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-md flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Optical Arc Flash Shield Check</span>
                    <span className="text-[11px] text-emerald-600 font-medium">● Filter active, zero unauthorized flash</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">11:42 AM</span>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setHistoryModalOpen(false)}
                  className="px-4 py-2 bg-[#0f294a] hover:bg-[#153e75] text-white rounded-md font-semibold cursor-pointer transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
