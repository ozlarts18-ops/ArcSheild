import React, { useState, useEffect } from 'react';
import { History, Calendar, Filter, Clock, ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { getMyHistory } from '../../services/api';

export default function UserSafetyHistoryView() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getMyHistory();
        setHistory(data.history || []);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const filteredHistory = history.filter(item => {
    if (filterType !== 'ALL' && item.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-700" />
            My Safety History Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological audit trail of warnings, near misses, incidents, and PPE status changes for your session.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="WARNING">Exposure Warnings</option>
            <option value="NEAR_MISS">Near Misses</option>
            <option value="INCIDENT">Safety Incidents</option>
            <option value="COMPLIANCE">PPE Compliance</option>
          </select>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading safety audit logs...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No Historical Safety Violations</p>
            <p className="text-xs text-slate-400 mt-0.5">Your past sessions maintain an uninterrupted safe compliance record.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filteredHistory.map((item, idx) => (
              <div key={item.id || idx} className="relative group">
                <div className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                  item.type === 'INCIDENT' ? 'border-rose-500' :
                  item.type === 'NEAR_MISS' || item.type === 'WARNING' ? 'border-amber-500' :
                  'border-blue-500'
                }`} />
                <div className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg p-4 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.type === 'INCIDENT' ? 'bg-rose-100 text-rose-800' :
                        item.type === 'NEAR_MISS' || item.type === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{item.title}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">{item.description}</p>
                  {item.actionTaken && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Corrective Action Taken:</span>
                      <span className="font-semibold text-emerald-700">{item.actionTaken}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
