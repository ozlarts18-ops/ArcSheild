import React from 'react';
import { SlidersHorizontal, Sun, Wind, HardHat, AlertOctagon, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react';
import { useArcShield } from '../context/ArcShieldContext';

export default function ScenarioSimulatorBar() {
  const { triggerScenario, isScenarioLoading, activeScenarioName } = useArcShield();

  const scenarios = [
    {
      id: 'NORMAL_WELDING',
      name: 'Normal Welding',
      icon: CheckCircle2,
      style: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300',
      desc: '34°C, 62% RH, Normal UV/Gas/Motion, Helmet Worn (SAFE)'
    },
    {
      id: 'HIGH_UV',
      name: 'Elevated Arc / UV',
      icon: Sun,
      style: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border-yellow-300',
      desc: 'High UV exposure spike, Warning alert'
    },
    {
      id: 'GAS_EXPOSURE',
      name: 'Gas Buildup',
      icon: Wind,
      style: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300',
      desc: 'Elevated combustion gas & air quality warning'
    },
    {
      id: 'HELMET_REMOVED',
      name: 'Helmet Removed',
      icon: HardHat,
      style: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300',
      desc: 'PPE removal in active zone, Compliance drop'
    },
    {
      id: 'FALL_DETECTED',
      name: 'Fall Detected',
      icon: AlertOctagon,
      style: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300 font-bold',
      desc: 'High impact + orientation change + immobility (CRITICAL)'
    },
    {
      id: 'OFFLINE_SYNC',
      name: 'Device Sync',
      icon: RefreshCw,
      style: 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300',
      desc: 'Offline device reconnects and flushes local logs'
    },
    {
      id: 'RESET_ALL_SAFE',
      name: 'Reset Baseline',
      icon: RotateCcw,
      style: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300',
      desc: 'Clear active alerts and restore baseline'
    }
  ];

  return (
    <div className="bg-white/95 border-t border-slate-200 px-6 py-3 sticky bottom-0 z-20 shadow-lg backdrop-blur-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-[#0f294a]" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Scenario Demo Engine:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1 justify-start lg:justify-end">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isActive = activeScenarioName === sc.name;

            return (
              <button
                key={sc.id}
                disabled={isScenarioLoading}
                onClick={() => triggerScenario(sc.id, 'AS-004', sc.name)}
                title={sc.desc}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${sc.style} ${
                  isActive ? 'ring-2 ring-[#0f294a] font-bold' : ''
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{sc.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
