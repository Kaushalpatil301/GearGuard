import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  LayoutDashboard,
  Calendar,
  HardDrive,
  Users,
  Search,
  Plus
} from 'lucide-react';

const Navbar = ({ onSearch, searchTerm, isMinimal }) => {
  return (
    <nav
      className="
        sticky top-0 z-50
        bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950
        backdrop-blur-xl
        border-b border-gray-800/40
        shadow-[0_10px_30px_-15px_rgba(0,0,0,0.9)]
        text-gray-100
        px-8 py-4
        overflow-hidden
      "
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent pointer-events-none" />

      <div className="relative flex items-center justify-between max-w-7xl mx-auto">
        {/* Left */}
        <div className="flex items-center space-x-10">
          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/40 border border-indigo-400/30">
              <Activity size={22} />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase italic bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              GearGuard
            </span>
          </NavLink>

          {/* Nav tabs */}
          <div className="hidden lg:flex items-center space-x-2">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" end />
            <NavItem to="/calendar" icon={<Calendar size={18} />} label="Calendar" />
            <NavItem to="/equipment" icon={<HardDrive size={18} />} label="Equipment" />
            <NavItem to="/teams" icon={<Users size={18} />} label="Teams" />

            {/* New Request tab */}
            <NavItem
              to="/requests/new"
              icon={<Plus size={18} />}
              label="New Request"
              primary
            />
          </div>
        </div>

        {/* Right */}
        {!isMinimal && (
          <div className="relative group hidden sm:block">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-400 transition-colors"
            />
            <input
              type="text"
              placeholder="Search resources..."
              className="
                pl-11 pr-4 py-2.5 w-72
                bg-gray-900/40
                border border-gray-700/30
                rounded-2xl
                text-gray-100 placeholder-gray-600
                focus:outline-none focus:ring-2 focus:ring-indigo-500/40
              "
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}
      </div>
    </nav>
  );
};

/* NavLink helper */
const NavItem = ({ to, icon, label, end = false, primary = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `
      flex items-center space-x-2.5 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all
      ${
        primary
          ? isActive
            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40'
            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/30'
          : isActive
          ? 'bg-indigo-600/10 text-white border border-indigo-500/20'
          : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/20'
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default Navbar;
