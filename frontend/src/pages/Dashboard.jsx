import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import MaintenanceTable from '../components/MaintenanceTable';
import MaintenanceDetail from '../components/MaintenanceDetail';
import NewRequestForm from '../components/NewRequestForm';
import StatusFooter from '../components/StatusFooter';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [tableData, setTableData] = useState([
    { id: 1, subject: 'Test activity', employee: 'Mitchell Admin', status: 'New Request', date: '12/18/2025' },
    { id: 2, subject: 'Server Maintenance', employee: 'Sarah Chen', status: 'In Progress', date: '12/20/2025' }
  ]);

  const filteredData = tableData.filter(item => 
    item.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent pointer-events-none" />

      <main className="p-8 max-w-7xl mx-auto">
        {isCreating ? (
          <NewRequestForm onSave={(req) => { setTableData([req, ...tableData]); setIsCreating(false); }} onBack={() => setIsCreating(false)} />
        ) : selectedRequest ? (
          <MaintenanceDetail data={selectedRequest} onBack={() => setSelectedRequest(null)} />
        ) : (
          <MaintenanceTable data={filteredData} onSelectRequest={setSelectedRequest} />
        )}
      </main>

      <StatusFooter />
    </div>
  );
};

export default Dashboard;