import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  ShieldCheck,
  Users
} from 'lucide-react';
import { useArcShield } from '../context/ArcShieldContext';

export default function ReportsView() {
  const { activeSession, helmets, alerts, incidents, setShowReportModal } = useArcShield();

  const [reportType, setReportType] = useState('DAILY');
  const [selectedTrade, setSelectedTrade] = useState('ALL');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-03');

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = 'ID,Type,Worker,Trade,Zone,Severity,Description,SupervisorAction,Status\n';
    const rows = incidents.map(i => `"${i.id}","${i.type}","${i.workerName}","${i.trade}","${i.workshopZone}","${i.severity}","${i.description}","${i.supervisorAction}","${i.status}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ArcShield_${reportType}_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="industrial-card p-4 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0f294a]" />
            <span>Workplace Safety & Compliance Reports</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate formal safety audit documentation, incident histories, and compliance records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0f294a] hover:bg-[#153e75] text-xs font-bold text-white transition shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span>Generate Official PDF</span>
          </button>
        </div>
      </div>

      {/* Report Generator Filter Controls */}
      <div className="industrial-card p-4 bg-white space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
          Report Configuration & Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Report Format:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 font-medium focus:outline-none"
            >
              <option value="DAILY">Daily Session Safety Report</option>
              <option value="WEEKLY">Weekly Workshop Compliance</option>
              <option value="INCIDENT">Incident & Near-Miss Audit</option>
              <option value="PPE_COMPLIANCE">PPE Wearing Compliance Log</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Trade Discipline:</label>
            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 font-medium focus:outline-none"
            >
              <option value="ALL">All Trades (Welding & Electrical)</option>
              <option value="Welding">Welding Only</option>
              <option value="Electrical">Electrical Only</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Workshop Zone:</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 font-medium focus:outline-none"
            >
              <option value="ALL">All Workshop Zones</option>
              <option value="Welding Bay 1">Welding Bay 1</option>
              <option value="Welding Bay 2">Welding Bay 2</option>
              <option value="Welding Bay 3">Welding Bay 3</option>
              <option value="Electrical Lab A">Electrical Lab A</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 font-medium focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 font-medium focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Report Preview Document Card */}
      <div className="industrial-card p-6 bg-white space-y-5">
        {/* Document Header */}
        <div className="border-b-2 border-[#0f294a] pb-4 flex justify-between items-start">
          <div>
            <div className="text-lg font-bold text-[#0f294a] tracking-tight uppercase">
              ARCSHIELD WORKPLACE SAFETY & TRAINING REPORT
            </div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">
              Industrial Training Institute (ITI) Directorate of Safety
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">
              Scope: {reportType} REPORT • Period: {startDate} to {endDate}
            </div>
          </div>
          <div className="text-right font-mono text-[11px] text-slate-600">
            <div><strong>Ref:</strong> RPT-2026-OCT-03</div>
            <div><strong>Status:</strong> VERIFIED_APPROVED</div>
            <div><strong>Auditor:</strong> O. Sharma</div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-md border border-slate-200 text-xs">
          <div>
            <div className="text-slate-500 uppercase text-[10px] font-bold">Monitored Trainees:</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">{helmets.length} Workers</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase text-[10px] font-bold">Shift Compliance:</div>
            <div className="text-base font-bold text-emerald-700 mt-0.5">{activeSession?.overallCompliancePercent || 95.8}%</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase text-[10px] font-bold">Recorded Incidents:</div>
            <div className="text-base font-bold text-red-700 mt-0.5">{incidents.filter(i => i.type === 'INCIDENT').length} Events</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase text-[10px] font-bold">Pre-Incident Near Misses:</div>
            <div className="text-base font-bold text-amber-800 mt-0.5">{incidents.filter(i => i.type === 'NEAR_MISS').length} Events</div>
          </div>
        </div>

        {/* Report Log Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Audit Event History & Resolution Records
          </h4>
          <table className="w-full text-left border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-2 border-r border-slate-200">ID</th>
                <th className="p-2 border-r border-slate-200">Classification</th>
                <th className="p-2 border-r border-slate-200">Worker</th>
                <th className="p-2 border-r border-slate-200">Zone</th>
                <th className="p-2 border-r border-slate-200">Observed Condition</th>
                <th className="p-2">Supervisor Action Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incidents.map((i) => (
                <tr key={i.id}>
                  <td className="p-2 font-mono font-bold text-slate-900 border-r border-slate-200">{i.id}</td>
                  <td className="p-2 border-r border-slate-200">
                    <span className={`font-bold ${i.type === 'INCIDENT' ? 'text-red-700' : 'text-amber-800'}`}>
                      {i.type}
                    </span>
                  </td>
                  <td className="p-2 font-semibold text-slate-800 border-r border-slate-200">{i.workerName} ({i.trade})</td>
                  <td className="p-2 text-slate-700 border-r border-slate-200">{i.workshopZone}</td>
                  <td className="p-2 text-slate-700 border-r border-slate-200">{i.description}</td>
                  <td className="p-2 text-slate-800">{i.supervisorAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
