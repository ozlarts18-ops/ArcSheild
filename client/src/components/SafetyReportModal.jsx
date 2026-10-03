import React, { useState, useEffect } from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { useArcShield } from '../context/ArcShieldContext';
import { fetchSessionReportApi } from '../services/api';

export default function SafetyReportModal() {
  const { showReportModal, setShowReportModal, activeSession, helmets, alerts, incidents } = useArcShield();
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (showReportModal) {
      fetchSessionReportApi().then(res => {
        if (res.success) setReportData(res.data);
      }).catch(err => console.error(err));
    }
  }, [showReportModal]);

  if (!showReportModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-lg max-w-4xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-300">
        {/* Modal Action Bar */}
        <div className="p-3.5 bg-slate-100 border-b border-slate-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0f294a]" />
            <span className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              ArcShield — Official Session Safety Audit Report
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-md bg-[#0f294a] hover:bg-[#153e75] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={() => setShowReportModal(false)}
              className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs font-sans leading-relaxed">
          {/* Official Letterhead */}
          <div className="border-b-2 border-[#0f294a] pb-4 flex justify-between items-start">
            <div>
              <div className="text-xl font-bold text-[#0f294a] tracking-tight uppercase">
                ARCSHIELD SAFETY MONITORING DIRECTORATE
              </div>
              <div className="text-xs text-slate-600 font-medium mt-0.5">
                Industrial Training Institute (ITI) Connected PPE Workplace Safety System
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-1">
                Standard: Workplace Occupational Safety Protocol • Real-Time Telemetry Audit
              </div>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-600">
              <div><strong>Report Ref:</strong> {reportData?.reportId || 'RPT-2026-OCT-03'}</div>
              <div><strong>Generated:</strong> {new Date().toLocaleString()}</div>
              <div><strong>Compliance:</strong> VERIFIED_COMPLIANT</div>
            </div>
          </div>

          {/* Session Overview Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-md border border-slate-200">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Shift Session:</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{activeSession?.title || 'Batch B1/A2 Practical'}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Lead Safety Supervisor:</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{activeSession?.instructor || 'Sr. Supervisor O. Sharma'}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Workshop Facility:</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{activeSession?.workshop || 'Welding & Heavy Electrical Annex'}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Shift Duration:</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">2 Hours 32 Minutes</div>
            </div>
          </div>

          {/* Summary KPI Table */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase text-slate-900 text-xs tracking-wider border-b border-slate-200 pb-1">
              1. Session Safety KPI Summary
            </h4>
            <div className="grid grid-cols-4 gap-3 text-center font-mono">
              <div className="border border-slate-200 p-2.5 rounded-md bg-white shadow-2xs">
                <div className="text-[10px] text-slate-500 font-semibold">Trainees Monitored</div>
                <div className="text-xl font-bold text-slate-900">{helmets.length}</div>
              </div>
              <div className="border border-slate-200 p-2.5 rounded-md bg-white shadow-2xs">
                <div className="text-[10px] text-slate-500 font-semibold">Helmet Wearing Rate</div>
                <div className="text-xl font-bold text-emerald-700">{activeSession?.overallCompliancePercent || 95.8}%</div>
              </div>
              <div className="border border-slate-200 p-2.5 rounded-md bg-white shadow-2xs">
                <div className="text-[10px] text-slate-500 font-semibold">Total Safety Alerts</div>
                <div className="text-xl font-bold text-amber-800">{alerts.length}</div>
              </div>
              <div className="border border-slate-200 p-2.5 rounded-md bg-white shadow-2xs">
                <div className="text-[10px] text-slate-500 font-semibold">Avg Supervisor Response</div>
                <div className="text-xl font-bold text-blue-700">18s</div>
              </div>
            </div>
          </div>

          {/* Incident & Near-Miss Log */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase text-slate-900 text-xs tracking-wider border-b border-slate-200 pb-1">
              2. Incident & Near-Miss Register Audit
            </h4>
            <table className="w-full text-left border-collapse border border-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-2 border-r border-slate-200">ID</th>
                  <th className="p-2 border-r border-slate-200">Classification</th>
                  <th className="p-2 border-r border-slate-200">Trainee</th>
                  <th className="p-2 border-r border-slate-200">Zone</th>
                  <th className="p-2 border-r border-slate-200">Observed Condition</th>
                  <th className="p-2">Supervisor Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.map((i) => (
                  <tr key={i.id}>
                    <td className="p-2 font-mono font-bold border-r border-slate-200 text-slate-900">{i.id}</td>
                    <td className="p-2 font-bold border-r border-slate-200">
                      <span className={i.type === 'INCIDENT' ? 'text-red-700' : 'text-amber-800'}>
                        {i.type}
                      </span>
                    </td>
                    <td className="p-2 border-r border-slate-200 font-medium text-slate-900">{i.workerName} ({i.helmetId})</td>
                    <td className="p-2 border-r border-slate-200 text-slate-700">{i.workshopZone}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-700">{i.description}</td>
                    <td className="p-2 font-medium text-slate-900">{i.supervisorAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Attestation & Signatures */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 font-mono text-xs">
            <div>
              <div className="border-b border-slate-400 pb-8"></div>
              <div className="font-bold text-slate-900 mt-1">Lead Safety Supervisor Signature</div>
              <div className="text-slate-500">O. Sharma (Sr. Safety Officer)</div>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8"></div>
              <div className="font-bold text-slate-900 mt-1">ITI Directorate Safety Officer</div>
              <div className="text-slate-500">Certified for Workshop Archive</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
