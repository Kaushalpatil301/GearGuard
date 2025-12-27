import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';

const EquipmentList = () => {
  const [search, setSearch] = useState('');

  const equipment = [
    {
      name: 'Samsung Monitor 15"',
      employee: 'Tejas Modi',
      department: 'Admin',
      serial: 'MT/123/2278737',
      technician: 'Mitchell Adams',
      category: 'Monitors',
      company: 'My Company (San Francisco)'
    },
    {
      name: 'Acer Laptop',
      employee: 'Bhaumik P',
      department: 'Technician',
      serial: 'MT/123/111222',
      technician: 'Marc Demo',
      category: 'Computers',
      company: 'My Company (San Francisco)'
    }
  ];

  const filtered = equipment.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee.toLowerCase().includes(search.toLowerCase()) ||
    e.serial.toLowerCase().includes(search.toLowerCase())
  );

  return (
    /* 🔹 SAME PAGE BACKGROUND AS DASHBOARD */
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 relative overflow-hidden">
      {/* Indigo glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent pointer-events-none" />

      <main className="relative max-w-7xl mx-auto p-8 animate-in fade-in duration-700">
        {/* Glass container */}
        <div className="backdrop-blur-2xl bg-gray-900/20 border border-gray-700/30 rounded-3xl shadow-2xl overflow-hidden">

          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/40">
            <div className="flex items-center gap-3">
              <button className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg border border-gray-600/50 text-gray-300 hover:border-indigo-400 hover:text-white transition">
                New
              </button>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                Equipment
              </span>
            </div>

            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="
                  pl-9 pr-4 py-1.5 text-sm
                  bg-gray-900/40
                  border border-gray-700/40
                  rounded-md
                  text-gray-200 placeholder-gray-500
                  focus:outline-none focus:border-indigo-500
                "
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-widest text-gray-500 border-b border-gray-700/40">
                  <th className="px-6 py-3 font-bold">Equipment Name</th>
                  <th className="px-6 py-3 font-bold">Employee</th>
                  <th className="px-6 py-3 font-bold">Department</th>
                  <th className="px-6 py-3 font-bold">Serial Number</th>
                  <th className="px-6 py-3 font-bold">Technician</th>
                  <th className="px-6 py-3 font-bold">Equipment Category</th>
                  <th className="px-6 py-3 font-bold">Company</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-800/40 hover:bg-gray-800/20 transition"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-100">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {item.employee}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {item.department}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-400">
                      {item.serial}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {item.technician}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.company}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-gray-500 text-sm"
                    >
                      No equipment found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EquipmentList;
