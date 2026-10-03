import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Calendar, Clock, Printer, Eye } from 'lucide-react';

export default function UserReportsView() {
  const [downloading, setDownloading] = useState(null);

  const reports = [
    {
      id: 'REP-SESSION-TODAY',
      title: 'Today’s Safety Session Summary Report',
      period: 'October 3, 2026 (08:30 - 18:00)',
      type: 'Daily Session',
      status: 'Ready',
      size: '184 KB'
    },
    {
      id: 'REP-WEEKLY-40',
      title: 'Weekly Workshop PPE Compliance & Exposure Report',
      period: 'Week 40, 2026',
      type: 'Weekly Summary',
      status: 'Ready',
      size: '342 KB'
    },
    {
      id: 'REP-ENV-EXPOSURE',
      title: 'Arc Flash & Thermal Exposure Audit Log',
      period: 'Last 30 Days',
      type: 'Environmental Audit',
      status: 'Ready',
      size: '512 KB'
    },
    {
      id: 'REP-ZERO-INCIDENT',
      title: 'Trainee Safe Working Compliance Certificate',
      period: 'Q3 2026',
      type: 'Compliance Record',
      status: 'Certified',
      size: '120 KB'
    }
  ];

  const handleDownload = (id) => {
    setDownloading(id);
    setTimeout(() => {
      setDownloading(null);
      alert('Report downloaded successfully as PDF.');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-700" />
          My Safety Reports & Certificates
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Download and print your individual safety session logs, exposure certificates, and PPE wear compliance audits.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(report => (
          <div key={report.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  {report.type}
                </span>
                <span className="text-xs text-slate-400">{report.size}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2.5">{report.title}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {report.period}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {report.status}
              </span>
              <button
                onClick={() => handleDownload(report.id)}
                disabled={downloading === report.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                {downloading === report.id ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
