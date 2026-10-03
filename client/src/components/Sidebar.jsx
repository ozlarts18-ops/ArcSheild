import React from 'react';
import {
  LayoutDashboard,
  Activity,
  AlertOctagon,
  Users,
  FileWarning,
  BarChart3,
  FileText,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { useArcShield } from '../context/ArcShieldContext';

export default function Sidebar() {
  const { activeView, setActiveView, alerts, incidents, helmets } = useArcShield();

  const activeAlertsCount = alerts.filter(a => a.lifecycleStatus === 'ACTIVE').length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.lifecycleStatus === 'ACTIVE').length;
  const openIncidentsCount = incidents.filter(i => i.status === 'OPEN').length;
  const onlineHelmetsCount = helmets.filter(h => h.connectionStatus === 'ONLINE').length;

  const navItems = [
    {
      id: 'OVERVIEW',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'LIVE_MONITORING',
      label: 'Live Monitoring',
      icon: Activity,
      badge: `${onlineHelmetsCount}/${helmets.length}`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    },
    {
      id: 'ALERTS',
      label: 'Alerts',
      icon: AlertOctagon,
      badge: activeAlertsCount > 0 ? activeAlertsCount : null,
      badgeColor: criticalCount > 0
        ? 'bg-red-50 text-red-700 border border-red-200 font-bold pulse-critical'
        : 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'
    },
    {
      id: 'HELMETS_WORKERS',
      label: 'Helmets / Workers',
      icon: Users,
      badge: `${helmets.length}`,
      badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200'
    },
    {
      id: 'INCIDENTS',
      label: 'Incidents & Near-Misses',
      icon: FileWarning,
      badge: openIncidentsCount > 0 ? `${openIncidentsCount} Open` : null,
      badgeColor: 'bg-slate-100 text-slate-700 border border-slate-200'
    },
    {
      id: 'ANALYTICS',
      label: 'Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'REPORTS',
      label: 'Reports',
      icon: FileText,
      badge: null
    },
    {
      id: 'SETTINGS',
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-61px)] shadow-2xs">
      {/* Navigation Items */}
      <div className="p-3.5 flex-1 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Safety Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-semibold transition ${
                isActive
                  ? 'bg-[#0f294a] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive ? 'bg-white/20 text-white border border-white/30' : item.badgeColor
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Operational Workshop Summary */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0f294a] mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Workshop Safety Status</span>
        </div>
        <div className="space-y-1.5 text-xs text-slate-600 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">Monitored Zones:</span>
            <span className="font-semibold text-slate-800">4 Bays / 2 Labs</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Active Helmets:</span>
            <span className="font-semibold text-emerald-700">{onlineHelmetsCount} Online</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Active Hazards:</span>
            <span className={`font-semibold ${criticalCount > 0 ? 'text-red-600 font-bold' : 'text-slate-800'}`}>
              {criticalCount} Critical
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
