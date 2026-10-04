import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans selection:bg-[#0f294a] selection:text-white">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded bg-[#0f294a] flex items-center justify-center text-white font-bold shadow-xs">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-bold text-xl text-[#0f294a] tracking-tight">ARCSHIELD</span>
        </Link>
        <p className="text-xs text-slate-500 font-medium">Worker & Trainee Safety Dashboard Login</p>
      </div>

      {/* Login Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 max-w-md w-full shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Sign in to your safety account</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Access your personal ArcShield helmet telemetry and shift records
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
            <label className="block text-slate-700 font-bold mb-1">Email Address:</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@workshop.edu"
                className="w-full bg-slate-50 border border-slate-300 rounded-md pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-[#0f294a] text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-slate-700 font-bold">Password:</label>
              <a href="#" className="text-slate-500 hover:text-[#0f294a]">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-[#0f294a] text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-[#0f294a] hover:bg-[#153e75] text-white font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Signing in...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Need an account?</span>
          <Link to="/register" className="text-[#0f294a] font-bold hover:underline">
            Create Worker Account
          </Link>
        </div>
      </div>

      {/* Admin Link footer */}
      <div className="mt-6 text-center text-xs text-slate-500">
        <span>Are you a safety supervisor or directorate officer? </span>
        <Link to="/admin/login" className="text-[#0f294a] font-bold hover:underline">
          Go to Admin Portal
        </Link>
      </div>
    </div>
  );
}
