import React, { useState } from 'react';
import { User, Shield, HardHat, MapPin, Mail, Phone, Building, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserProfileView() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const profileData = {
    name: user?.name || 'Rahul Sharma',
    email: user?.email || 'rahul.welder@iti.edu',
    trade: user?.trade || 'Welding & Thermal Fabrication',
    workshop: user?.workshop || 'Welding Bay 01',
    helmetId: user?.helmetId || 'ARC-001',
    institution: 'National ITI Technical Training Centre',
    emergencyContact: '+91 98765 43210 (Supervisor Desk)'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-700" />
          Worker Profile & Assigned Gear
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Your personal safety profile, assigned PPE unit pairing, and workshop workstation details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-800 font-bold text-xl flex items-center justify-center mx-auto border-2 border-blue-200">
            {profileData.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-3">{profileData.name}</h3>
          <p className="text-xs text-slate-500">{profileData.trade}</p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Safety Certified
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3 text-left text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{profileData.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{profileData.institution}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{profileData.workshop}</span>
            </div>
          </div>
        </div>

        {/* Assigned Gear Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <HardHat className="w-4 h-4 text-blue-700" />
            Assigned ArcShield Hardware & Safety Pairing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Assigned Helmet ID</span>
              <p className="text-lg font-bold text-blue-900 mt-1">{profileData.helmetId}</p>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">● Active Pairing</span>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Assigned Workstation</span>
              <p className="text-lg font-bold text-slate-900 mt-1">{profileData.workshop}</p>
              <span className="text-[10px] text-slate-500 mt-1 block">Zone A — Indoor Bay</span>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Emergency Contact</span>
              <p className="text-sm font-bold text-slate-800 mt-1">{profileData.emergencyContact}</p>
              <span className="text-[10px] text-slate-500 mt-1 block">Duty Supervisor On-Call</span>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Firmware Status</span>
              <p className="text-sm font-bold text-emerald-700 mt-1">Up to Date</p>
              <span className="text-[10px] text-slate-500 mt-1 block">Certified Calibration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
