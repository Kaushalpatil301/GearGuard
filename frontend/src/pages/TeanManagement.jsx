import React from 'react';

const TeamsManagement = () => {
  const members = [
    { name: 'Mitchell Admin', role: 'Lead Tech', load: '85%', color: 'bg-red-500' },
    { name: 'Marc Foster', role: 'Field Tech', load: '40%', color: 'bg-emerald-500' },
    { name: 'Sarah Chen', role: 'Network Eng', load: '65%', color: 'bg-indigo-500' },
  ];

  return (
    /* 🔹 SAME PAGE BACKGROUND AS DASHBOARD */
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 relative overflow-hidden">
      {/* Indigo glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent pointer-events-none" />

      <main className="relative max-w-7xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
        <h2 className="text-3xl font-black text-white tracking-tight">
          Teams & Workload
        </h2>

        {/* Glass table container */}
        <div className="backdrop-blur-3xl bg-gray-900/20 border border-gray-700/30 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-gray-950/40 border-b border-gray-800/50">
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <th className="px-10 py-6">Member</th>
                <th className="px-10 py-6">Role</th>
                <th className="px-10 py-6">Workload Efficiency</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800/40">
              {members.map((m) => (
                <tr
                  key={m.name}
                  className="hover:bg-indigo-500/[0.02] transition-all"
                >
                  <td className="px-10 py-6 font-bold text-gray-100">
                    {m.name}
                  </td>

                  <td className="px-10 py-6 text-sm text-gray-500 font-medium uppercase tracking-widest">
                    {m.role}
                  </td>

                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${m.color} transition-all duration-1000`}
                          style={{ width: m.load }}
                        />
                      </div>
                      <span className="text-xs font-black text-gray-400">
                        {m.load}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default TeamsManagement;
