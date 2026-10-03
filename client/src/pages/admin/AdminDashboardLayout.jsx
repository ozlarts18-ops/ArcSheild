import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Shield, LayoutDashboard, Radio, HardHat, Users, 
  AlertTriangle, FileWarning, BarChart3, Cpu, LogOut,
  Bell, CheckCircle2, Search, Menu, X, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Live Fleet Monitoring', to: '/admin/dashboard/live', icon: Radio },
    { label: 'All Helmets', to: '/admin/dashboard/helmets', icon: HardHat },
    { label: 'All Users', to: '/admin/dashboard/users', icon: Users },
    { label: 'Active Alerts', to: '/admin/dashboard/alerts', icon: AlertTriangle },
    { label: 'Incidents & Near Misses', to: '/admin/dashboard/incidents', icon: FileWarning },
    { label: 'System Analytics', to: '/admin/dashboard/analytics', icon: BarChart3 },
    { label: 'System Health', to: '/admin/dashboard/system', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
                  ArcShield <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-900 tracking-normal uppercase">Supervisor Admin</span>
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">Institutional Safety Directorate</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Central Gateway Online
            </div>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-900">{user?.name || 'Director / Safety Officer'}</div>
                <div className="text-[11px] text-slate-500">Administrator Role</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Sign out of Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs sticky top-22">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Fleet & Safety Management
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-900 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-slate-100 px-3">
              <div className="text-[11px] font-medium text-slate-500">System State</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">Multi-User Ready</div>
              <p className="text-[10px] text-slate-400 mt-1">Ready for scalable fleet expansion across workshops.</p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/50 flex">
            <div className="bg-white w-64 p-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                  <span className="font-bold text-slate-900 text-sm">Admin Navigation</span>
                  <button onClick={() => setMobileOpen(false)} className="p-1 text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
                          isActive ? 'bg-blue-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 p-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
            <div className="flex-1" onClick={() => setMobileOpen(false)} />
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
