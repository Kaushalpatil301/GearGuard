import React from 'react';
import NewRequestForm from '../components/NewRequestForm';

const NewRequestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 relative overflow-hidden">
      {/* Same indigo glow as Dashboard */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent pointer-events-none" />

      <main className="relative p-8 max-w-7xl mx-auto">
        <NewRequestForm />
      </main>
    </div>
  );
};

export default NewRequestPage;
