import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Activity,
  AlertOctagon,
  History,
  BarChart3,
  FileText,
  User,
  LogOut,
  Radio,
  Clock,
  HardHat,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UserOverviewView from './UserOverviewView';
import UserLiveMonitoringView from './UserLiveMonitoringView';
import UserAlertsView from './UserAlertsView';
import UserSafetyHistoryView from './UserSafetyHistoryView';
import UserAnalyticsView from './UserAnalyticsView';
import UserReportsView from './UserReportsView';
import UserProfileView from './UserProfileView';

export default function UserDashboardLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
    { id: 'LIVE_MONITORING', label: 'Live Monitoring', icon: Activity },
    { id: 'ALERTS', label: 'Alerts', icon: AlertOctagon },
    { id: 'SAFETY_HISTORY', label: 'Safety History', icon: History },
    { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
    { id: 'REPORTS', label: 'Reports', icon: FileText },
    { id: 'PROFILE', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-[#0f294a] selection:text-white">
      {/* User Dashboard Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Brand & User Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="w-9 h-9 rounded bg-[#0f294a] flex items-center justify-center text-white font-bold shadow-xs">
              <Shield className="w-5 h-5 text-emerald-400" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[#0f294a] tracking-tight">ARCSHIELD</span>
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  MY SAFETY CONSOLE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Personal PPE Safety & Telemetry Monitor • {currentUser?.trade || 'Welding'} Trade
              </p>
            </div>
          </div>

          {/* Right: Status Pills & Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-md text-xs font-mono">
              <HardHat className="w-3.5 h-3.5 text-slate-500" />
              <span>Assigned: <strong className="text-slate-800">{currentUser?.assignedHelmetId || 'ARC-001'}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>LIVE</span>
            </div>

            {/* User Profile dropdown/button */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded bg-[#0f294a] text-white flex items-center justify-center text-xs font-bold">
                {currentUser?.name?.slice(0, 2)?.toUpperCase() || 'RS'}
              </div>
              <div className="hidden lg:block text-left text-xs leading-tight">
                <div className="font-bold text-slate-800">{currentUser?.name || 'Rahul Sharma'}</div>
                <div className="text-[10px] text-slate-500">{currentUser?.workshop || 'Welding Bay 01'}</div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* User Sidebar */}
        <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-61px)] shadow-2xs">
          <div className="p-3 flex-1 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              My Safety Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#0f294a] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Session Info Card */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50 text-xs font-mono space-y-1">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Shift Session</div>
            <div className="font-bold text-slate-800">Shift Active (2h 32m)</div>
            <div className="text-[11px] text-emerald-700 font-semibold">Compliance: 97.6%</div>
          </div>
        </aside>

        {/* User Main View Content */}
        <main className="flex-1 p-5 lg:p-7 overflow-y-auto pb-16">
          {activeTab === 'OVERVIEW' && <UserOverviewView onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === 'LIVE_MONITORING' && <UserLiveMonitoringView />}
          {activeTab === 'ALERTS' && <UserAlertsView />}
          {activeTab === 'SAFETY_HISTORY' && <UserSafetyHistoryView />}
          {activeTab === 'ANALYTICS' && <UserAnalyticsView />}
          {activeTab === 'REPORTS' && <UserReportsView />}
          {activeTab === 'PROFILE' && <UserProfileView />}
        </main>
      </div>
    </div>
  );
}
