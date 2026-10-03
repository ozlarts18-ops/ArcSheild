import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, HardHat, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getAdminAnalytics } from '../../services/api';

export default function AdminAnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAdminAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load admin analytics', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const weeklyTrends = [
    { day: 'Mon', warnings: 2, compliance: 98, nearMisses: 1 },
    { day: 'Tue', warnings: 3, compliance: 96, nearMisses: 0 },
    { day: 'Wed', warnings: 1, compliance: 99, nearMisses: 1 },
    { day: 'Thu', warnings: 4, compliance: 95, nearMisses: 2 },
    { day: 'Fri', warnings: 0, compliance: 100, nearMisses: 0 },
  ];

  const tradeBreakdown = [
    { trade: 'Welding', compliance: 97, activeHelmets: 1 },
    { trade: 'Electrical', compliance: 99, activeHelmets: 0 },
    { trade: 'Machining', compliance: 98, activeHelmets: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-700" />
          Institutional Safety Analytics & Exposure Trends
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Aggregated safety metrics across all workshop bays, trade specializations, and helmet compliance sessions.
        </p>
      </div>

      {/* Grid of Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Alerts & Near Misses */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Weekly Safety Warnings & Near Misses</h3>
          <p className="text-xs text-slate-500 mb-4">Total incident events recorded across training shifts</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="warnings" name="Warnings" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="nearMisses" name="Near Misses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Institutional Compliance Trend */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Overall Institutional PPE Compliance (%)</h3>
          <p className="text-xs text-slate-500 mb-4">Mandatory helmet wear compliance across active sessions</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip />
                <Line type="monotone" dataKey="compliance" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4, fill: '#0284c7' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
