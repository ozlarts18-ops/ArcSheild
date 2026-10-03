import React, { useState } from 'react';
import { Settings, Shield, Bell, Users, Clock, Sliders, CheckCircle2, Save } from 'lucide-react';

export default function SettingsView() {
  const [workshopName, setWorkshopName] = useState('ITI Main Electrical & Welding Workshop Annex');
  const [shiftDuration, setShiftDuration] = useState('4 Hours');
  const [tempThreshold, setTempThreshold] = useState('45.0');
  const [uvThreshold, setUvThreshold] = useState('4.0');
  const [inactivityTimeout, setInactivityTimeout] = useState('15');
  const [audioAnnunciator, setAudioAnnunciator] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="industrial-card p-4 bg-white flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#0f294a]" />
            <span>Console & Workshop Safety Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure operational alert thresholds, shift schedules, and safety notifications
          </p>
        </div>

        {saveSuccess && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Settings Saved Successfully</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Section 1: Workshop & Shift */}
        <div className="industrial-card p-5 bg-white space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            1. Workshop Center & Practical Shift
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Workshop Facility Name:</label>
              <input
                type="text"
                value={workshopName}
                onChange={(e) => setWorkshopName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Standard Shift Duration:</label>
              <input
                type="text"
                value={shiftDuration}
                onChange={(e) => setShiftDuration(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Safety Thresholds */}
        <div className="industrial-card p-5 bg-white space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            2. Safety Anomaly & Exposure Thresholds
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Thermal Exposure Warning (°C):</label>
              <input
                type="number"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 font-mono font-bold"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Triggers supervisor warning above 45.0°C</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Arc Flash / UV Warning Level:</label>
              <input
                type="number"
                value={uvThreshold}
                onChange={(e) => setUvThreshold(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 font-mono font-bold"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Triggers warning above Level 4.0</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Post-Impact Immobility Timeout (Sec):</label>
              <input
                type="number"
                value={inactivityTimeout}
                onChange={(e) => setInactivityTimeout(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 font-mono font-bold"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Triggers CRITICAL fall alert after 15s</span>
            </div>
          </div>
        </div>

        {/* Section 3: Notification & Alert Preferences */}
        <div className="industrial-card p-5 bg-white space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            3. Alert Annunciator & Dispatch Settings
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={audioAnnunciator}
                onChange={(e) => setAudioAnnunciator(e.target.checked)}
                className="w-4 h-4 text-[#0f294a] rounded"
              />
              <div>
                <div className="font-bold text-slate-800">Enable Local Wearer Audio / Haptic Warnings</div>
                <div className="text-slate-500 text-[11px]">Wearer's helmet immediately buzzes on warning prior to supervisor dispatch</div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 rounded-md bg-[#0f294a] hover:bg-[#153e75] text-white font-bold text-xs shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
