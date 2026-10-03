import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, MapPin, CheckCircle2, Shield, HardHat } from 'lucide-react';
import { getAdminUsers } from '../../services/api';

export default function AdminUsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminUsers();
        setUsers(data.users || []);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.trade?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-700" />
            Registered Trainees & Workshop Workers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Directory of enrolled students, assigned PPE units, current safety state, and active training bays.
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search worker name, email, trade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Worker Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Trade Specialization</th>
                <th className="px-4 py-3">Assigned Helmet</th>
                <th className="px-4 py-3">Assigned Workshop</th>
                <th className="px-4 py-3">Current Safety</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">Loading user directory...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">No registered trainees found.</td>
                </tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.id || u.email} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                          {u.name?.[0] || 'U'}
                        </div>
                        <span className="font-bold text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3.5 text-slate-700">{u.trade || 'Welding'}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800">
                        {u.assignedHelmet || 'ARC-001'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{u.workshop || 'Welding Bay 01'}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {u.currentSafety || 'SAFE'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active Session
                      </span>
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
