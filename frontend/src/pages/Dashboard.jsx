import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import MaintenanceTable from "../components/MaintenanceTable";
import MaintenanceDetail from "../components/MaintenanceDetail";
import NewRequestForm from "../components/NewRequestForm";
import StatusFooter from "../components/StatusFooter";
import { API_BASE_URL } from "../config/api";

const Dashboard = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [kanbanData, setKanbanData] = useState({
    NEW: [],
    IN_PROGRESS: [],
    REPAIRED: [],
    SCRAP: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Kanban data on mount and when returning from other views
  useEffect(() => {
    if (!isCreating && !selectedRequest) {
      fetchKanbanData();
    }
  }, [isCreating, selectedRequest]);

  // Handle incoming navigation state to auto-select a request (e.g., from Equipment page)
  useEffect(() => {
    const selectedRequestId = location.state?.selectedRequestId;
    if (selectedRequestId && !loading) {
      // Find the request in kanban data
      const allRequests = [
        ...kanbanData.NEW,
        ...kanbanData.IN_PROGRESS,
        ...kanbanData.REPAIRED,
        ...kanbanData.SCRAP,
      ];
      const request = allRequests.find((r) => r.id === selectedRequestId);
      if (request) {
        setSelectedRequest(request);
        // Clear the navigation state to prevent re-selecting on subsequent renders
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, kanbanData, loading]);

  const fetchKanbanData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/requests/views/kanban`);
      const data = await response.json();

      if (data.success) {
        setKanbanData(data.data);
      } else {
        setError(data.error?.message || "Failed to fetch requests");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Fetch kanban error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Flatten kanban data for table view and search
  const allRequests = [
    ...kanbanData.NEW,
    ...kanbanData.IN_PROGRESS,
    ...kanbanData.REPAIRED,
    ...kanbanData.SCRAP,
  ];

  const filteredData = allRequests.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.team_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent pointer-events-none" />

      <main className="p-8 max-w-7xl mx-auto">
        {isCreating ? (
          <NewRequestForm
            onSave={() => {
              setIsCreating(false);
              fetchKanbanData(); // Refresh data after creating
            }}
            onBack={() => setIsCreating(false)}
          />
        ) : selectedRequest ? (
          <MaintenanceDetail
            data={selectedRequest}
            onBack={() => {
              setSelectedRequest(null);
              fetchKanbanData(); // Refresh data when returning
            }}
          />
        ) : (
          <MaintenanceTable
            kanbanData={kanbanData}
            data={filteredData}
            onSelectRequest={setSelectedRequest}
            onStatusChange={fetchKanbanData}
            loading={loading}
            error={error}
          />
        )}
      </main>

      <StatusFooter />
    </div>
  );
};

export default Dashboard;
