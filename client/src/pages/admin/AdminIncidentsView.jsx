import React, { useState, useEffect } from 'react';
import { FileWarning, Plus, Search, CheckCircle2, AlertTriangle, AlertOctagon, User, HardHat, Calendar } from 'lucide-react';
import { getAdminIncidents, createAdminIncident } from '../../services/api';

export default function AdminIncidentsView() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'NEAR_MISS',
    title: '',
    description: '',
    affectedUser: 'Rahul Sharma',
    helmetId: 'ARC-001',
    workshop: 'Welding Bay 01',
    actionTaken: ''
  });

  const loadIncidents = async () => {
    try {
      const data = await getAdminIncidents();
      setIncidents(data.incidents || []);
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAdminIncident(formData);
      setModalOpen(false);
      setFormData({
        type: 'NEAR_MISS',
        title: '',
        description: '',
        affectedUser: 'Rahul Sharma',
        helmetId: 'ARC-001',
        workshop: 'Welding Bay 01',
        actionTaken: ''
      });
      loadIncidents();
    } catch (err) {
      console.error('Failed to log incident', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-blue-700" />
            Safety Incidents & Near-Misses Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal institutional audit trail for compliance review, root-cause investigations, and preventive actions.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Log Safety Event
        </button>
      </div>

      {/* Incident Cards / List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading incident register...</div>
        ) : incidents.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">Zero Incidents on File</h3>
            <p className="text-xs text-slate-500 mt-1">No formal safety incidents or near misses recorded today.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {incidents.map((item) => (
              <div key={item.id} className="p-5 hover:bg-slate-50/80 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.type === 'INCIDENT' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2">{item.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-slate-500">
                    <span>Worker: <strong className="text-slate-700">{item.affectedUser}</strong></span>
                    <span>Helmet: <strong className="text-slate-700 font-mono">{item.helmetId}</strong></span>
                    <span>Zone: <strong className="text-slate-700">{item.workshop}</strong></span>
                  </div>
                  {item.actionTaken && (
                    <div className="text-emerald-700 font-medium">
                      Corrective Action: <span className="font-semibold">{item.actionTaken}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Log Incident or Near-Miss</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Classification</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium"
                >
                  <option value="NEAR_MISS">Near Miss (Hazard Avoided)</option>
                  <option value="INCIDENT">Safety Incident (Protocol Breached)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unlatched shield during arc ignition"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the context, equipment, and sequence of events..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corrective Action Taken</label>
                <input
                  type="text"
                  placeholder="e.g. Work halted, supervisor reminded proper pre-weld check"
                  value={formData.actionTaken}
                  onChange={e => setFormData({ ...formData, actionTaken: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-semibold cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
