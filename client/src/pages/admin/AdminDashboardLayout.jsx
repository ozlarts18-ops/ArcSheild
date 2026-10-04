import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Activity,
  HardHat,
  Users,
  AlertOctagon,
  FileWarning,
  BarChart3,
  FileText,
  User,
  KeyRound,
  LogOut,
  Radio,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateProfileApi, changePasswordApi } from '../../services/api';

export default function AdminDashboardLayout() {
  const { user, currentUser, logout, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const activeUser = currentUser || user;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    name: activeUser?.name || 'Administrator',
    phoneNumber: activeUser?.phoneNumber || '',
    workshop: activeUser?.workshop || 'Central Control Center',
    trade: activeUser?.trade || 'Institutional Safety Directorate'
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);
    try {
      const res = await updateProfileApi(profileForm);
      if (res.success) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
        if (res.user) {
          const updated = { ...activeUser, ...res.user };
          setCurrentUser(updated);
        }
        setTimeout(() => {
          setProfileModalOpen(false);
          setProfileMessage(null);
        }, 1200);
      } else {
        setProfileMessage({ type: 'error', text: res.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'An error occurred.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);
    try {
      const res = await changePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (res.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setPasswordModalOpen(false);
          setPasswordMessage(null);
        }, 1200);
      } else {
        setPasswordMessage({ type: 'error', text: res.message || 'Current password incorrect.' });
      }
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'An error occurred.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const navItems = [
    { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Live Monitoring', to: '/admin/dashboard/live', icon: Activity },
    { label: 'Helmets', to: '/admin/dashboard/helmets', icon: HardHat },
    { label: 'Users', to: '/admin/dashboard/users', icon: Users },
    { label: 'Alerts', to: '/admin/dashboard/alerts', icon: AlertOctagon },
    { label: 'Incidents & Near Misses', to: '/admin/dashboard/incidents', icon: FileWarning },
    { label: 'Analytics', to: '/admin/dashboard/analytics', icon: BarChart3 },
    { label: 'Reports', to: '/admin/dashboard/reports', icon: FileText },
  ];

  const adminInitials = activeUser?.name
    ? activeUser.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-[#0f294a] selection:text-white">
      {/* Admin Dashboard Header - Matches User Dashboard Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Brand & Admin Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link
              to="/admin/dashboard"
              className="w-9 h-9 rounded bg-[#0f294a] flex items-center justify-center text-white font-bold shadow-xs shrink-0"
            >
              <Shield className="w-5 h-5 text-emerald-400" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[#0f294a] tracking-tight">ARCSHIELD</span>
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-blue-50 text-[#0f294a] border border-blue-200">
                  ADMIN / SUPERVISOR ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Workshop Safety Management • Institutional Safety Directorate
              </p>
            </div>
          </div>

          {/* Right: Connection status, Administrator Info & Profile Menu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>ONLINE</span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative pl-2 border-l border-slate-200">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded bg-[#0f294a] text-white flex items-center justify-center text-xs font-bold">
                  {adminInitials}
                </div>
                <div className="hidden lg:block text-left text-xs leading-tight">
                  <div className="font-bold text-slate-800">{activeUser?.name || 'Administrator'}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    {activeUser?.role === 'ADMIN' ? 'Supervisor Admin' : 'Administrator'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-md border border-slate-200 shadow-md py-1.5 z-40 text-xs font-medium">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-800">{activeUser?.name || 'Administrator'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{activeUser?.email || 'admin@arcshield.local'}</p>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setProfileForm({
                          name: activeUser?.name || 'Administrator',
                          phoneNumber: activeUser?.phoneNumber || '',
                          workshop: activeUser?.workshop || 'Central Control Center',
                          trade: activeUser?.trade || 'Institutional Safety Directorate'
                        });
                        setProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Admin Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setPasswordModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition text-left cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-slate-500" />
                      <span>Change Password</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 transition text-left font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleLogout}
              title="Logout of Admin"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Admin Sidebar - Exactly matching User Sidebar layout, typography and active state */}
        <aside className="hidden md:flex w-56 bg-white border-r border-slate-200 flex-col shrink-0 min-h-[calc(100vh-61px)] shadow-2xs">
          <div className="p-3 flex-1 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Workshop Management
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition ${
                      isActive
                        ? 'bg-[#0f294a] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Session / Fleet Status Card matching User Session Card */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50 text-xs font-mono space-y-1">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Institutional Safety</div>
            <div className="font-bold text-slate-800">Workshop Safety Console</div>
            <div className="text-[11px] text-emerald-700 font-semibold">Fleet Gateway Online</div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex">
            <div className="bg-white w-64 p-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#0f294a]" />
                    <span className="font-bold text-slate-900 text-sm">ArcShield Admin</span>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="p-1 text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold ${
                            isActive ? 'bg-[#0f294a] text-white' : 'text-slate-600 hover:bg-slate-50'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 p-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-md"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileOpen(false)} />
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 p-5 lg:p-7 overflow-y-auto pb-16">
          <Outlet />
        </main>
      </div>

      {/* Admin Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#0f294a]" />
                Administrator Profile
              </h3>
              <button
                onClick={() => {
                  setProfileModalOpen(false);
                  setProfileMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {profileMessage && (
              <div
                className={`mt-3 p-2.5 rounded-md text-xs flex items-center gap-2 ${
                  profileMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {profileMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-[#0f294a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={activeUser?.email || 'admin@arcshield.local'}
                  className="w-full border border-slate-200 rounded-md p-2.5 text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Email is bound to primary administrative role.</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  className="w-full border border-slate-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-[#0f294a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department / Trade</label>
                <input
                  type="text"
                  value={profileForm.trade}
                  onChange={(e) => setProfileForm({ ...profileForm, trade: e.target.value })}
                  className="w-full border border-slate-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-[#0f294a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Control Bay / Station</label>
                <input
                  type="text"
                  value={profileForm.workshop}
                  onChange={(e) => setProfileForm({ ...profileForm, workshop: e.target.value })}
                  className="w-full border border-slate-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-[#0f294a]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setProfileModalOpen(false);
                    setProfileMessage(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-4 py-2 bg-[#0f294a] hover:bg-[#153e75] text-white rounded-md font-semibold cursor-pointer transition flex items-center gap-1.5"
                >
                  {profileLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#0f294a]" />
                Change Administrator Password
              </h3>
              <button
                onClick={() => {
                  setPasswordModalOpen(false);
                  setPasswordMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordMessage && (
              <div
                className={`mt-3 p-2.5 rounded-md text-xs flex items-center gap-2 ${
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter existing password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full border border-slate-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-[#0f294a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full border border-slate-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-[#0f294a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full border border-slate-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-[#0f294a]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModalOpen(false);
                    setPasswordMessage(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-[#0f294a] hover:bg-[#153e75] text-white rounded-md font-semibold cursor-pointer transition flex items-center gap-1.5"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
