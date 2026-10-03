import React, { useState, useEffect } from 'react';
import { HardHat, Search, Filter, ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';
import { getAdminHelmets } from '../../services/api';

export default function AdminHelmetsView() {
  const [helmets, setHelmets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminHelmets();
        setHelmets(data.helmets || []);
      } catch (err) {
        console.error('Failed to load helmets', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = helmets.filter(h => 
    h.helmetId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.assignedUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.workshop?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HardHat className="w-5 h-5 text-blue-700" />
            ArcShield Smart Helmet Inventory & Fleet
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository of all physical smart helmets, assigned trade personnel, and operational readiness.
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search helmet ID, user, workshop..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Helmet ID</th>
                <th className="px-4 py-3">Assigned User</th>
                <th className="px-4 py-3">Trade</th>
                <th className="px-4 py-3">Workshop / Zone</th>
                <th className="px-4 py-3">Safety State</th>
                <th className="px-4 py-3">Connection</th>
                <th className="px-4 py-3">Last Ping</th>
                <th className="px-4 py-3">Active Alerts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400">Loading helmet registry...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400">No matching helmets found.</td>
                </tr>
              ) : (
                filtered.map((helmet) => (
                  <tr key={helmet.helmetId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{helmet.helmetId}</td>
                    <td className="px-4 py-3.5 text-slate-800 font-semibold">{helmet.assignedUser || 'Unassigned'}</td>
                    <td className="px-4 py-3.5 text-slate-600">{helmet.trade || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-600">{helmet.workshop || 'Main Workshop'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        helmet.safetyState === 'SAFE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        helmet.safetyState === 'WARNING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {helmet.safetyState || 'SAFE'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        {helmet.connection || 'Online'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {helmet.lastSeen ? new Date(helmet.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-600 font-semibold">{helmet.activeAlerts || 0}</span>
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
