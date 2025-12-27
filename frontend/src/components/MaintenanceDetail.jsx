import React from 'react';
import { ChevronLeft, Diamond, Clock, Building2, User, HardDrive } from 'lucide-react';

const MaintenanceDetail = ({ data, onBack }) => {
  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        <div>
          <button 
            onClick={onBack}
            className="group flex items-center text-indigo-400 hover:text-indigo-300 transition-colors mb-2 text-sm font-medium"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">Subject</span>
            <h1 className="text-4xl font-black text-white tracking-tight">{data.subject}</h1>
          </div>
        </div>

        {/* Status Stepper - Mirrored from Image */}
        <div className="flex items-center p-1.5 bg-gray-900/50 border border-gray-700/50 rounded-2xl backdrop-blur-md">
          <StatusStep label="New Request" active />
          <StepSeparator />
          <StatusStep label="In Progress" />
          <StepSeparator />
          <StatusStep label="Repaired" />
          <StepSeparator />
          <StatusStep label="Scrap" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Info Fields (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="backdrop-blur-xl bg-gray-800/20 border border-gray-700/30 rounded-3xl p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <DetailField label="Created By" value={data.employee} icon={<User size={14}/>} />
              <DetailField label="Maintenance For" value="Equipment" />
              <DetailField label="Equipment" value="Acer Laptop/LP/008/MDH*011" icon={<HardDrive size={14}/>} fullWidth />
              <DetailField label="Category" value={data.category} isCapitalize />
              <DetailField label="Request Date" value="12/18/2025" />
              
              <div className="md:col-span-2 pt-4">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4 block">Maintenance Type</label>
                <div className="flex gap-8">
                  <RadioOption label="Corrective" name="mtype" defaultChecked />
                  <RadioOption label="Preventive" name="mtype" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tabs */}
          <div className="backdrop-blur-xl bg-gray-800/20 border border-gray-700/30 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex border-b border-gray-700/30 bg-gray-900/20">
              <button className="px-8 py-4 text-sm font-bold border-b-2 border-indigo-500 bg-indigo-500/5 text-white">Notes</button>
              <button className="px-8 py-4 text-sm font-bold text-gray-500 hover:text-gray-300 transition-colors">Instructions</button>
            </div>
            <div className="p-8">
              <textarea 
                className="w-full bg-transparent border-none focus:ring-0 text-gray-300 placeholder-gray-600 h-32 resize-none text-lg"
                placeholder="Add internal activity logs or technical notes..."
              />
            </div>
          </div>
        </div>

        {/* Right Section: Scheduling & Priority (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="backdrop-blur-xl bg-gray-800/20 border border-gray-700/30 rounded-3xl p-8 shadow-2xl space-y-8">
            <DetailField label="Team" value="Internal Maintenance" />
            <DetailField label="Technician" value={data.technician} icon={<User size={14}/>} />
            <DetailField label="Scheduled Date" value="12/28/2025 14:30:00" icon={<Clock size={14}/>} />
            
            <div className="flex justify-between items-end pt-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 block">Priority</label>
                <div className="flex gap-1.5 text-indigo-500">
                  <Diamond size={20} fill="currentColor" />
                  <Diamond size={20} className="text-gray-700" />
                  <Diamond size={20} className="text-gray-700" />
                </div>
              </div>
              <div className="text-right">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Company</label>
                <div className="flex items-center gap-2 text-gray-300">
                  <Building2 size={16} />
                  <span className="font-medium">{data.company}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Helper Sub-Components --- */

const DetailField = ({ label, value, icon, fullWidth, isCapitalize }) => (
  <div className={`${fullWidth ? 'md:col-span-2' : ''} space-y-1`}>
    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
      {icon} {label}
    </label>
    <div className={`text-lg font-medium text-gray-100 border-b border-gray-700/50 pb-2 ${isCapitalize ? 'capitalize' : ''}`}>
      {value}
    </div>
  </div>
);

const StatusStep = ({ label, active }) => (
  <span className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
    active 
    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/50' 
    : 'text-gray-500 hover:text-gray-300'
  }`}>
    {label}
  </span>
);

const StepSeparator = () => <span className="text-gray-700 px-1">❯</span>;

const RadioOption = ({ label, ...props }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <input type="radio" {...props} className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500 focus:ring-offset-gray-900" />
    <span className="text-gray-300 group-hover:text-white transition-colors">{label}</span>
  </label>
);

export default MaintenanceDetail;