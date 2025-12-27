import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const tableData = [
    {
      subject: 'Test activity',
      employee: 'Mitchell Admin',
      technician: 'Mitchell Admin',
      category: 'computer',
      status: 'New Request',
      company: 'My company'
    }
    // Add more rows as needed
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 to-transparent" />

      {/* Top Navigation */}
      <nav className="backdrop-blur-lg bg-gray-800/30 border-b border-gray-600/40 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="px-3 py-2 text-lg font-bold text-gray-100 border-b-2 border-indigo-500">
              Dashboard
            </Link>
            <Link to="/calendar" className="px-3 py-2 text-lg font-medium text-gray-300 hover:text-gray-100 transition-colors">
              Maintenance Calendar
            </Link>
            <Link to="/reporting" className="px-3 py-2 text-lg font-medium text-gray-300 hover:text-gray-100 transition-colors">
              Equipment Reporting
            </Link>
            <Link to="/teams" className="px-3 py-2 text-lg font-medium text-gray-300 hover:text-gray-100 transition-colors">
              Teams
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 bg-gray-700/20 border border-gray-600/30 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="px-6 py-2 bg-gray-700/30 border border-gray-600/40 rounded-xl text-gray-100 font-medium hover:bg-gray-600/40 transition-all">
              New
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Critical Equipment Card */}
          <div className="backdrop-blur-lg bg-gray-800/30 border-2 border-red-600/40 rounded-2xl p-6 shadow-2xl shadow-black/30">
            <h3 className="text-xl font-bold text-gray-100 mb-2">Critical Equipment</h3>
            <p className="text-4xl font-bold text-red-400">5 units</p>
            <p className="text-sm text-gray-400 mt-1">Health 30%</p>
          </div>

          {/* Technician Load Card */}
          <div className="backdrop-blur-lg bg-gray-800/30 border-2 border-blue-600/40 rounded-2xl p-6 shadow-2xl shadow-black/30">
            <h3 className="text-xl font-bold text-gray-100 mb-2">Technician Load</h3>
            <p className="text-4xl font-bold text-blue-400">85%</p>
            <p className="text-sm text-gray-400 mt-1">utilized (Assign carefully)</p>
          </div>

          {/* Open Requests Card */}
          <div className="backdrop-blur-lg bg-gray-800/30 border-2 border-green-600/40 rounded-2xl p-6 shadow-2xl shadow-black/30">
            <h3 className="text-xl font-bold text-gray-100 mb-2">Open Requests</h3>
            <p className="text-4xl font-bold text-green-400">12 pending</p>
            <p className="text-sm text-gray-400 mt-1">3 overdue</p>
          </div>
        </div>

        {/* Requests Table */}
        <div className="backdrop-blur-lg bg-gray-800/30 border border-gray-600/40 rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
          <table className="w-full">
            <thead className="bg-gray-700/20">
              <tr>
                <th className="px-6 py-4 text-left text-lg font-bold text-gray-100">Subject</th>
                <th className="px-6 py-4 text-left text-lg font-bold text-gray-100">Employee</th>
                <th className="px-6 py-4 text-left text-lg font-bold text-gray-100">Technician</th>
                <th className="px-6 py-4 text-left text-lg font-bold text-gray-100">Category</th>
                <th className="px-6 py-4 text-left text-lg font-bold text-gray-100">Status</th>
                <th className="px-6 py-4 text-left text-lg font-bold text-gray-100">Company</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600/40">
              {tableData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-700/20 transition-colors">
                  <td className="px-6 py-4 text-base text-gray-300">{row.subject}</td>
                  <td className="px-6 py-4 text-base text-gray-300">{row.employee}</td>
                  <td className="px-6 py-4 text-base text-gray-300">{row.technician}</td>
                  <td className="px-6 py-4 text-base text-gray-300">{row.category}</td>
                  <td className="px-6 py-4 text-base text-gray-300">{row.status}</td>
                  <td className="px-6 py-4 text-base text-gray-300">{row.company}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Alert */}
      <div className="fixed bottom-6 right-6 backdrop-blur-lg bg-yellow-600/20 border border-yellow-500/40 rounded-full px-6 py-3 shadow-2xl shadow-black/30 flex items-center space-x-2">
        <span className="text-yellow-300 font-medium">⚠️</span>
        <span className="text-sm text-gray-100">Warm Elk</span>
      </div>
    </div>
  );
};

export default Dashboard;