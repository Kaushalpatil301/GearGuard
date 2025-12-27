import React from 'react';

const StatusFooter = () => (
  <div className="fixed bottom-8 left-1/2 -translate-x-1/2 backdrop-blur-2xl bg-gray-950/80 border border-gray-700/30 rounded-3xl px-8 py-3.5 shadow-2xl flex items-center space-x-8 z-40 border-indigo-500/20">
    <div className="flex items-center space-x-3">
      <div className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </div>
      <span className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">Warm Elk Node v1.4</span>
    </div>
    <div className="h-4 w-px bg-gray-800" />
    <div className="flex space-x-6 text-[11px] font-black text-gray-500 tracking-widest">
      <span className="hover:text-white cursor-pointer transition-colors uppercase">Network</span>
      <span className="hover:text-white cursor-pointer transition-colors uppercase">Logs</span>
    </div>
  </div>
);

export default StatusFooter;