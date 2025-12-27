import React from 'react';
import { Activity, Plus } from 'lucide-react';

const MaintenanceTable = ({ data, onSelectRequest }) => {
  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <KPICard title="Critical Equipment" value="5" suffix="units" subtitle="System Health: 32%" color="red" />
        <KPICard title="Technician Load" value="85" suffix="%" subtitle="High Utilization" color="blue" />
        <KPICard title="Open Requests" value={data.length} suffix="pending" subtitle="Live queue" color="green" />
      </div>

      <div className="backdrop-blur-3xl bg-gray-900/20 border border-gray-700/30 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-gray-500 text-[10px] uppercase tracking-[0.25em] font-black bg-gray-950/40">
              <th className="px-10 py-6">Task Subject</th>
              <th className="px-10 py-6">Employee</th>
              <th className="px-10 py-6">Status</th>
              <th className="px-10 py-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40">
            {data.map((row) => (
              <tr key={row.id} onClick={() => onSelectRequest(row)} className="group hover:bg-indigo-500/[0.04] transition-all cursor-pointer">
                <td className="px-10 py-7">
                  <div className="font-bold text-gray-100 group-hover:text-indigo-300 transition-colors text-lg">{row.subject}</div>
                  <div className="text-[10px] text-gray-600 mt-1 font-bold uppercase tracking-widest">{row.date}</div>
                </td>
                <td className="px-10 py-7 text-gray-400 text-sm font-medium">{row.employee}</td>
                <td className="px-10 py-7">
                  <span className="px-4 py-1.5 bg-gray-950/80 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-700/50 text-indigo-400">
                    {row.status}
                  </span>
                </td>
                <td className="px-10 py-7 text-right">
                  <div className="text-indigo-400 text-xs font-black opacity-100 flex items-center justify-end space-x-2">
                    <span>DETAILS</span> <Activity size={14} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, suffix, subtitle, color }) => {
  const colors = {
    red: "border-red-500/20 text-red-400 shadow-red-500/[0.03]",
    blue: "border-blue-500/20 text-blue-400 shadow-blue-500/[0.03]",
    green: "border-emerald-500/20 text-emerald-400 shadow-emerald-500/[0.03]"
  };
  return (
    <div className={`backdrop-blur-3xl bg-gray-900/10 border-2 rounded-[2.5rem] p-10 shadow-2xl transition-all duration-500 hover:-translate-y-3 ${colors[color]}`}>
      <h3 className="text-[11px] uppercase tracking-[0.35em] font-black text-gray-500 mb-6">{title}</h3>
      <div className="flex items-baseline space-x-3">
        <p className="text-6xl font-black text-white">{value}</p>
        <span className="text-lg font-black opacity-30 uppercase tracking-widest">{suffix}</span>
      </div>
      <p className="text-[11px] font-bold mt-4 opacity-40 italic">{subtitle}</p>
    </div>
  );
};

export default MaintenanceTable;