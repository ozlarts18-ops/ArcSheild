import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  HardHat,
  Activity,
  Wind,
  Sun,
  Thermometer,
  MapPin,
  ArrowRight,
  FileText,
  Lock,
  Radio,
  Clock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#0f294a] selection:text-white">
      {/* Public Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#0f294a] flex items-center justify-center text-white font-bold shadow-xs">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-lg text-[#0f294a] tracking-tight">ARCSHIELD</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Connected Safety Gear
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-[#0f294a] transition">How It Works</a>
            <a href="#monitoring" className="hover:text-[#0f294a] transition">What It Monitors</a>
            <a href="#features" className="hover:text-[#0f294a] transition">Features</a>
            <a href="#preview" className="hover:text-[#0f294a] transition">Dashboard Preview</a>
            <a href="#workflow" className="hover:text-[#0f294a] transition">Safety Workflow</a>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-md text-slate-700 font-semibold hover:text-[#0f294a] transition"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-md bg-[#0f294a] hover:bg-[#153e75] text-white font-bold transition shadow-xs"
            >
              Get Started
            </Link>
            <Link
              to="/admin/login"
              className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Connected PPE Workplace Safety Management</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0f294a] tracking-tight leading-tight">
            Smart Connected Safety Gear for Electrical & Welding Trades
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            ArcShield continuously monitors workplace safety conditions and provides timely warnings, helping workers and supervisors respond to hazardous situations before they become serious incidents.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-md bg-[#0f294a] hover:bg-[#153e75] text-white font-bold text-sm transition shadow-sm flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm transition shadow-2xs"
            >
              User Login
            </Link>
          </div>

          <div className="pt-8 text-xs font-mono text-slate-500 flex flex-wrap items-center justify-center gap-6">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Real-Time Hazard Detection
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Optical Helmet Compliance
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Fall & Immobility Tracking
            </span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">System Process</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f294a]">How ArcShield Works</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              A streamlined, continuous safety loop from the worker's gear to supervisory intervention and audit logs.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { step: '01', title: 'Worker', desc: 'Equips connected smart safety helmet at shift start' },
              { step: '02', title: 'Safety Gear', desc: 'Embedded sensing monitors local environmental conditions' },
              { step: '03', title: 'Monitoring', desc: 'Continuous data telemetry analyzed for safety anomalies' },
              { step: '04', title: 'Warning', desc: 'Instant local on-helmet alert and supervisor notification' },
              { step: '05', title: 'Response', desc: 'Immediate supervisor corrective action and hazard clearance' },
              { step: '06', title: 'Safety Record', desc: 'Event logged automatically into training center audit register' },
            ].map((s) => (
              <div key={s.step} className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-mono font-bold text-slate-400">{s.step}</div>
                <div className="font-bold text-sm text-[#0f294a]">{s.title}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What ArcShield Monitors Section */}
      <section id="monitoring" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Operational Coverage</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f294a]">What ArcShield Monitors</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Real-world industrial hazards detected and interpreted at the operational level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Environmental */}
            <div className="industrial-card p-5 space-y-3">
              <div className="w-8 h-8 rounded bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <Thermometer className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Environmental Conditions</h3>
              <ul className="text-xs text-slate-600 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5">• Exposure Temperature</li>
                <li className="flex items-center gap-1.5">• Ambient Climate & Humidity</li>
                <li className="flex items-center gap-1.5">• UV / Arc Flash Exposure</li>
                <li className="flex items-center gap-1.5">• Workshop Lighting (Lux)</li>
                <li className="flex items-center gap-1.5">• Combustion Gases & Air Quality</li>
              </ul>
            </div>

            {/* 2. Worker Safety */}
            <div className="industrial-card p-5 space-y-3">
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Worker Safety & Motion</h3>
              <ul className="text-xs text-slate-600 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5">• Helmet Worn / Removed State</li>
                <li className="flex items-center gap-1.5">• High-Impact Force Detection</li>
                <li className="flex items-center gap-1.5">• Worker Fall & Immobility</li>
                <li className="flex items-center gap-1.5">• Abnormal Tilt & Movement</li>
                <li className="flex items-center gap-1.5">• Shift Compliance Tracking</li>
              </ul>
            </div>

            {/* 3. Location & Connectivity */}
            <div className="industrial-card p-5 space-y-3">
              <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Location & Connection</h3>
              <ul className="text-xs text-slate-600 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5">• Workshop Zone Mapping</li>
                <li className="flex items-center gap-1.5">• Location Coordinates</li>
                <li className="flex items-center gap-1.5">• Live Telemetry Link State</li>
                <li className="flex items-center gap-1.5">• Local Offline Data Buffering</li>
                <li className="flex items-center gap-1.5">• Automatic Sync on Reconnect</li>
              </ul>
            </div>

            {/* 4. Local Safety Annunciator */}
            <div className="industrial-card p-5 space-y-3">
              <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Local Safety Feedback</h3>
              <ul className="text-xs text-slate-600 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5">• Immediate Audible Buzzer</li>
                <li className="flex items-center gap-1.5">• High-Visibility Visual Warning</li>
                <li className="flex items-center gap-1.5">• Haptic Vibration Pulse</li>
                <li className="flex items-center gap-1.5">• On-Device Status Messages</li>
                <li className="flex items-center gap-1.5">• Worker Alerted Before Escalation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="preview" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">User Experience</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f294a]">Personal Safety Dashboard Preview</h2>
            <p className="text-xs text-slate-600">
              A clean, focused operational readout designed for the worker to monitor their own safety.
            </p>
          </div>

          {/* Static Preview Card */}
          <div className="max-w-2xl mx-auto industrial-card p-6 bg-slate-50/50 border border-slate-300 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <div className="text-xs font-mono text-slate-500">ASSIGNED SAFETY GEAR</div>
                <div className="text-sm font-bold text-slate-900">ARC-001 • Rahul Sharma (Welding)</div>
              </div>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold badge-safe">
                ● SAFE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <div className="text-slate-500 text-[10px]">Temperature</div>
                <div className="font-bold text-slate-900 text-sm">34.2 °C</div>
                <div className="text-emerald-700 text-[10px]">Normal</div>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <div className="text-slate-500 text-[10px]">Humidity</div>
                <div className="font-bold text-slate-900 text-sm">62 %</div>
                <div className="text-emerald-700 text-[10px]">Normal</div>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <div className="text-slate-500 text-[10px]">UV / Arc Exposure</div>
                <div className="font-bold text-slate-900 text-sm">Normal</div>
                <div className="text-emerald-700 text-[10px]">Safe Flux</div>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <div className="text-slate-500 text-[10px]">Gas Exposure</div>
                <div className="font-bold text-slate-900 text-sm">Normal</div>
                <div className="text-emerald-700 text-[10px]">Air Quality Clean</div>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <div className="text-slate-500 text-[10px]">Motion Status</div>
                <div className="font-bold text-slate-900 text-sm">Stable</div>
                <div className="text-emerald-700 text-[10px]">No Fall</div>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <div className="text-slate-500 text-[10px]">Helmet Status</div>
                <div className="font-bold text-emerald-700 text-sm">WORN</div>
                <div className="text-slate-500 text-[10px]">Session Active</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
              <span>Location: Welding Bay 01</span>
              <span>Connection: Live WebSocket</span>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Workflow Section */}
      <section id="workflow" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Safety Lifecycle</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f294a]">Continuous Safety Workflow</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            {[
              { label: 'MONITOR', desc: 'Edge sensing' },
              { label: 'DETECT', desc: 'Threshold limits' },
              { label: 'WARN', desc: 'Immediate alarm' },
              { label: 'RESPOND', desc: 'Supervisor action' },
              { label: 'RECORD', desc: 'Incident register' },
              { label: 'ANALYZE', desc: 'Audit intelligence' },
            ].map((w, idx) => (
              <div key={idx} className="bg-white p-4 rounded-md border border-slate-200 space-y-1">
                <div className="font-bold text-xs text-[#0f294a] tracking-wider">{w.label}</div>
                <div className="text-[11px] text-slate-500">{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-16 bg-[#0f294a] text-white">
        <div className="max-w-4xl mx-auto px-5 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Start Monitoring with ArcShield
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
            Protect electrical and welding trainees with connected workplace PPE sensing, instant hazard alerting, and comprehensive compliance records.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="px-6 py-3 rounded-md bg-white text-[#0f294a] font-bold text-sm hover:bg-slate-100 transition shadow-sm"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-md bg-transparent border border-slate-400 text-white font-semibold text-sm hover:bg-white/10 transition"
            >
              Login to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white tracking-wider">ARCSHIELD</span>
            <span>• Smart Connected Safety Gear</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-white transition">Worker Login</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
            <Link to="/admin/login" className="hover:text-white transition">Admin Portal</Link>
          </div>

          <div>
            &copy; {new Date().getFullYear()} ArcShield Safety Directorate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
