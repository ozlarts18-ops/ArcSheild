import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        navigate('/admin/dashboard');
      } else {
        setError(res.error || 'Invalid administrator credentials');
      }
    } catch (err) {
      setError('Admin verification service error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans selection:bg-[#0f294a] selection:text-white">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded bg-[#0f294a] flex items-center justify-center text-white font-bold shadow-xs">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <span className="font-bold text-xl text-[#0f294a] tracking-tight">ARCSHIELD</span>
        </Link>
      </div>

      {/* Admin Login Card */}
      <div className="bg-white border border-slate-300 rounded-lg p-6 sm:p-8 max-w-md w-full shadow-md space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Safety Directorate Sign In</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Authenticate to access organization-wide fleet safety monitoring and incident registers
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Directorate Email:</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@arcsheild.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-md pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-[#0f294a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Directorate Passkey:</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-[#0f294a]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-[#0f294a] hover:bg-[#153e75] text-white font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Access Admin Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          <Link to="/login" className="text-[#0f294a] font-semibold hover:underline">
            ← Return to Worker Safety Login
          </Link>
        </div>
      </div>
    </div>
  );
}
