import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  HardHat,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Shield,
  Phone,
  Mail,
  MapPin,
  Building,
  Check
} from 'lucide-react';
import {
  fetchAdminUsersApi,
  createAdminUserApi,
  updateAdminUserApi,
  toggleUserStatusApi,
  assignHelmetToUserApi,
  fetchAdminHelmetsApi
} from '../../services/api';

export default function AdminUsersView() {
  const [users, setUsers] = useState([]);
  const [helmets, setHelmets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [tradeFilter, setTradeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Add User Form State
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    trade: 'Industrial Welding',
    workshop: 'Welding Bay 01',
    zone: 'Zone A',
    assignedHelmetId: 'Unassigned',
    role: 'USER',
    isActive: true
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);

  // Edit User Form State
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    trade: '',
    workshop: '',
    zone: 'Zone A',
    assignedHelmetId: '',
    isActive: true
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Assign Helmet Form State
  const [selectedHelmetId, setSelectedHelmetId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
    try {
      const [usersRes, helmetsRes] = await Promise.all([
        fetchAdminUsersApi(),
        fetchAdminHelmetsApi()
      ]);

      if (usersRes && usersRes.success) {
        setUsers(usersRes.users || usersRes.data?.users || []);
      } else {
        setError(usersRes?.message || 'Failed to load user roster.');
      }

      if (helmetsRes && helmetsRes.success) {
        setHelmets(helmetsRes.helmets || helmetsRes.data?.helmets || []);
      }
    } catch (err) {
      console.error('Failed to load users & helmets', err);
      setError('Unable to reach safety database.');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotice = (text, type = 'success') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Add User Handler
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    try {
      const payload = {
        name: addForm.name,
        email: addForm.email,
        phoneNumber: addForm.phoneNumber,
        trade: addForm.trade,
        workshop: addForm.workshop,
        zone: addForm.zone,
        assignedHelmetId: addForm.assignedHelmetId === 'Unassigned' ? '' : addForm.assignedHelmetId,
        role: 'USER',
        isActive: addForm.isActive
      };
      const res = await createAdminUserApi(payload);
      if (res.success) {
        showNotice('User created successfully.');
        setAddModalOpen(false);
        setAddForm({
          name: '',
          email: '',
          phoneNumber: '',
          trade: 'Industrial Welding',
          workshop: 'Welding Bay 01',
          zone: 'Zone A',
          assignedHelmetId: 'Unassigned',
          role: 'USER',
          isActive: true
        });
        await loadData();
      } else {
        setAddError(res.message || 'Failed to create user account.');
      }
    } catch (err) {
      setAddError(err.message || 'Error creating user.');
    } finally {
      setAddLoading(false);
    }
  };

  // Edit User Handler
  const handleEditOpen = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      trade: user.trade || 'Industrial Welding',
      workshop: user.workshop || 'Welding Bay 01',
      zone: user.zone || 'Zone A',
      assignedHelmetId: user.assignedHelmet || user.helmetId || 'Unassigned',
      isActive: user.isActive !== undefined ? user.isActive : true
    });
    setEditError(null);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await updateAdminUserApi(selectedUser.id, {
        name: editForm.name,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        trade: editForm.trade,
        workshop: editForm.workshop,
        zone: editForm.zone,
        assignedHelmetId: editForm.assignedHelmetId === 'Unassigned' ? '' : editForm.assignedHelmetId,
        isActive: editForm.isActive
      });

      if (res.success) {
        showNotice('User details updated successfully.');
        setEditModalOpen(false);
        await loadData();
      } else {
        setEditError(res.message || 'Failed to update user.');
      }
    } catch (err) {
      setEditError(err.message || 'Error updating user.');
    } finally {
      setEditLoading(false);
    }
  };

  // Toggle Account Status Handler
  const handleToggleStatus = async (user) => {
    const nextStatus = !user.isActive;
    try {
      const res = await toggleUserStatusApi(user.id, nextStatus);
      if (res.success) {
        showNotice(`User account ${nextStatus ? 'enabled' : 'disabled'}.`);
        await loadData();
      }
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  // Assign Helmet Modal Open
  const handleAssignOpen = (user) => {
    setSelectedUser(user);
    setSelectedHelmetId(user.assignedHelmet || user.helmetId || 'Unassigned');
    setAssignError(null);
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setAssignLoading(true);
    setAssignError(null);
    try {
      const res = await assignHelmetToUserApi(
        selectedUser.id,
        selectedHelmetId === 'Unassigned' ? '' : selectedHelmetId
      );
      if (res.success) {
        showNotice(`Helmet pairing updated for ${selectedUser.name}.`);
        setAssignModalOpen(false);
        await loadData();
      } else {
        setAssignError(res.message || 'Failed to assign helmet.');
      }
    } catch (err) {
      setAssignError(err.message || 'Error updating pairing.');
    } finally {
      setAssignLoading(false);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.trade?.toLowerCase().includes(search.toLowerCase()) ||
      (u.assignedHelmet || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.workshop || '').toLowerCase().includes(search.toLowerCase());

    const matchesTrade = tradeFilter === 'ALL' || u.trade === tradeFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.isActive !== false) ||
      (statusFilter === 'DISABLED' && u.isActive === false);

    return matchesSearch && matchesTrade && matchesStatus;
  });

  const uniqueTrades = Array.from(new Set(users.map((u) => u.trade).filter(Boolean)));

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

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Banner / Actions */}
      <div className="industrial-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-500">
            Personnel Directory
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Users & Trainees Management
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Manage worker accounts, safety certifications, hardware gear pairing, and workshop permissions.
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
              setAddError(null);
              setAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0f294a] hover:bg-[#153e75] text-white rounded-md text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Action Banner / Notification */}
      {actionNotice && (
        <div
          className={`p-3 rounded-md text-xs flex items-center gap-2 shadow-2xs ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-semibold">{actionNotice.text}</span>
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
            placeholder="Search by worker name, email, helmet, bay..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-[#0f294a] focus:bg-white w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-slate-50 text-slate-700 focus:outline-hidden focus:border-[#0f294a]"
          >
            <option value="ALL">All Trades</option>
            {uniqueTrades.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-slate-50 text-slate-700 focus:outline-hidden focus:border-[#0f294a]"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="DISABLED">Disabled Accounts</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="industrial-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="industrial-table-header">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Trade</th>
                <th className="px-4 py-3">Assigned Helmet</th>
                <th className="px-4 py-3">Workshop</th>
                <th className="px-4 py-3">Safety Status</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading registered user directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-800 text-sm">No registered users found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {search || tradeFilter !== 'ALL' || statusFilter !== 'ALL'
                        ? 'Try clearing active search or filters.'
                        : 'No users have been registered yet.'}
                    </p>
                    <button
                      onClick={() => {
                        setSearch('');
                        setTradeFilter('ALL');
                        setStatusFilter('ALL');
                        setAddModalOpen(true);
                      }}
                      className="mt-3 inline-block px-3.5 py-1.5 bg-[#0f294a] text-white text-xs font-semibold rounded-md shadow-2xs hover:bg-[#153e75]"
                    >
                      + Add New User
                    </button>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((worker) => {
                  const safetyStatus = worker.currentSafety || worker.safetyStatus || 'SAFE';
                  const isActive = worker.isActive !== false;

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
                            <span className="text-[11px] text-slate-400 font-mono">{worker.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{worker.email}</td>
                      <td className="px-4 py-3.5 text-slate-700">{worker.trade || 'Industrial Welding'}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] border ${
                            worker.assignedHelmet && worker.assignedHelmet !== 'Unassigned'
                              ? 'bg-slate-100 text-slate-800 border-slate-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200 font-normal'
                          }`}
                        >
                          {worker.assignedHelmet || worker.helmetId || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{worker.workshop || 'Welding Bay 01'}</td>
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
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {isActive ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUser(worker);
                              setViewModalOpen(true);
                            }}
                            title="View User Details"
                            className="p-1 text-slate-500 hover:text-[#0f294a] hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditOpen(worker)}
                            title="Edit User"
                            className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAssignOpen(worker)}
                            title="Assign Helmet"
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <HardHat className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(worker)}
                            title={isActive ? 'Disable User' : 'Enable User'}
                            className={`p-1 rounded cursor-pointer ${
                              isActive
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {isActive ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
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
      {/* ADD USER MODAL                                                            */}
      {/* ========================================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0f294a]" />
                Add New Safety Trainee / Worker
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="mt-3 p-2.5 rounded-md text-xs bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="worker@arcshield.local"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={addForm.phoneNumber}
                    onChange={(e) => setAddForm({ ...addForm, phoneNumber: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trade Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Industrial Welding"
                    value={addForm.trade}
                    onChange={(e) => setAddForm({ ...addForm, trade: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Workshop / Training Centre</label>
                  <input
                    type="text"
                    placeholder="e.g. Welding Bay 01"
                    value={addForm.workshop}
                    onChange={(e) => setAddForm({ ...addForm, workshop: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Zone Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Zone A"
                    value={addForm.zone}
                    onChange={(e) => setAddForm({ ...addForm, zone: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Safety Helmet</label>
                  <select
                    value={addForm.assignedHelmetId}
                    onChange={(e) => setAddForm({ ...addForm, assignedHelmetId: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs bg-slate-50 focus:outline-hidden focus:border-[#0f294a]"
                  >
                    <option value="Unassigned">Unassigned (Assign Later)</option>
                    {helmets.map((h) => (
                      <option key={h.helmetId} value={h.helmetId}>
                        {h.helmetId} ({h.safetyState || 'SAFE'} • {h.assignedUser || 'Available'})
                      </option>
                    ))}
                    {!helmets.some((h) => h.helmetId === 'ARC-001') && (
                      <option value="ARC-001">ARC-001 (Prototype Helmet)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Role</label>
                  <input
                    type="text"
                    disabled
                    value="USER (Default Safety Trainee)"
                    className="w-full border border-slate-200 rounded-md p-2 text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addForm.isActive}
                    onChange={(e) => setAddForm({ ...addForm, isActive: e.target.checked })}
                    className="rounded text-[#0f294a] focus:ring-0"
                  />
                  <span className="font-semibold text-slate-700">Set account status to Active immediately</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 bg-[#0f294a] hover:bg-[#153e75] text-white rounded-md font-semibold cursor-pointer transition flex items-center gap-1.5"
                >
                  {addLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT USER MODAL                                                           */}
      {/* ========================================================================= */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#0f294a]" />
                Edit User: {selectedUser.name}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="mt-3 p-2.5 rounded-md text-xs bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trade Specialization</label>
                  <input
                    type="text"
                    value={editForm.trade}
                    onChange={(e) => setEditForm({ ...editForm, trade: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Workshop / Facility</label>
                  <input
                    type="text"
                    value={editForm.workshop}
                    onChange={(e) => setEditForm({ ...editForm, workshop: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Zone Area</label>
                  <input
                    type="text"
                    value={editForm.zone}
                    onChange={(e) => setEditForm({ ...editForm, zone: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-[#0f294a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Safety Helmet</label>
                  <select
                    value={editForm.assignedHelmetId}
                    onChange={(e) => setEditForm({ ...editForm, assignedHelmetId: e.target.value })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs bg-slate-50 focus:outline-hidden focus:border-[#0f294a]"
                  >
                    <option value="Unassigned">Unassigned</option>
                    {helmets.map((h) => (
                      <option key={h.helmetId} value={h.helmetId}>
                        {h.helmetId} ({h.safetyState || 'SAFE'} • {h.assignedUser || 'Available'})
                      </option>
                    ))}
                    {!helmets.some((h) => h.helmetId === 'ARC-001') && (
                      <option value="ARC-001">ARC-001 (Prototype Helmet)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editForm.isActive ? 'ACTIVE' : 'DISABLED'}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'ACTIVE' })}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs bg-slate-50 focus:outline-hidden focus:border-[#0f294a]"
                  >
                    <option value="ACTIVE">Active Account</option>
                    <option value="DISABLED">Disabled Account</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-[#0f294a] hover:bg-[#153e75] text-white rounded-md font-semibold cursor-pointer transition flex items-center gap-1.5"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ASSIGN HELMET MODAL                                                       */}
      {/* ========================================================================= */}
      {assignModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HardHat className="w-4 h-4 text-[#0f294a]" />
                Assign Safety Helmet
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
                <div className="text-[10px] font-bold text-slate-500 uppercase">Target Worker</div>
                <div className="font-bold text-slate-900 text-sm">{selectedUser.name}</div>
                <div className="text-slate-500">{selectedUser.email}</div>
                <div className="pt-2 text-[11px] text-slate-600">
                  Current Assigned Gear:{' '}
                  <strong className="text-[#0f294a] font-mono">
                    {selectedUser.assignedHelmet || selectedUser.helmetId || 'Unassigned'}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Available Safety Gear
                </label>
                <select
                  value={selectedHelmetId}
                  onChange={(e) => setSelectedHelmetId(e.target.value)}
                  className="w-full border border-slate-200 rounded-md p-2.5 text-xs bg-slate-50 focus:outline-hidden focus:border-[#0f294a]"
                >
                  <option value="Unassigned">-- Unassign Safety Gear --</option>
                  {helmets.map((h) => (
                    <option key={h.helmetId} value={h.helmetId}>
                      {h.helmetId} — Status: {h.safetyState || 'SAFE'} (
                      {h.assignedUser && h.assignedUser !== 'Unassigned'
                        ? `Assigned: ${h.assignedUser}`
                        : 'Available'}
                      )
                    </option>
                  ))}
                  {!helmets.some((h) => h.helmetId === 'ARC-001') && (
                    <option value="ARC-001">ARC-001 — Active Prototype Smart Helmet</option>
                  )}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Assigning a new helmet will automatically calibrate the user's live telemetry stream.
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
                  {assignLoading ? 'Updating...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW USER DETAILS MODAL                                                   */}
      {/* ========================================================================= */}
      {viewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0f294a]" />
                User Safety Profile
              </h3>
              <button
                onClick={() => setViewModalOpen(false)}
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
                  <span className="text-[10px] uppercase font-bold text-slate-500">User ID</span>
                  <p className="text-sm font-bold text-slate-900 font-mono mt-1">{selectedUser.id}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Contact Phone</span>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {selectedUser.phoneNumber || 'Not provided'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Assigned Safety Gear</span>
                  <p className="text-sm font-bold text-[#0f294a] font-mono mt-1">
                    {selectedUser.assignedHelmet || selectedUser.helmetId || 'Unassigned'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Account Status</span>
                  <p className="text-sm font-bold mt-1 text-emerald-700">
                    {selectedUser.isActive !== false ? 'Active' : 'Disabled'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Trade</span>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedUser.trade || 'Industrial Welding'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Workshop Workstation</span>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedUser.workshop || 'Welding Bay 01'}
                  </p>
                </div>
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
                    handleEditOpen(selectedUser);
                  }}
                  className="px-4 py-2 bg-[#0f294a] hover:bg-[#153e75] text-white rounded-md font-semibold cursor-pointer transition"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
