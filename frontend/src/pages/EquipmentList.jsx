import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  AlertTriangle,
  Trash2,
  Filter,
  FileText,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { API_BASE_URL, EQUIPMENT_STATUS } from "../config/api";

const EquipmentList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [highlightedEquipmentId, setHighlightedEquipmentId] = useState(null);

  // Smart button modal state
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipmentRequests, setEquipmentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState(null);

  useEffect(() => {
    fetchEquipment();
    fetchTeams();
  }, []);

  // Handle navigation from other pages (e.g., MaintenanceDetail)
  useEffect(() => {
    const highlightId = location.state?.highlightEquipmentId;
    if (highlightId) {
      setHighlightedEquipmentId(highlightId);
      // Clear the navigation state
      window.history.replaceState({}, document.title);
      // Remove highlight after 3 seconds
      setTimeout(() => setHighlightedEquipmentId(null), 3000);
    }
  }, [location.state]);

  // Handle incoming navigation state for equipment highlighting
  useEffect(() => {
    const highlightId = location.state?.highlightEquipmentId;
    if (highlightId) {
      setHighlightedEquipmentId(highlightId);
      // Clear the navigation state
      window.history.replaceState({}, document.title);
      // Auto-remove highlight after 3 seconds
      setTimeout(() => setHighlightedEquipmentId(null), 3000);
    }
  }, [location.state]);

  const fetchEquipment = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/equipment`);
      const data = await response.json();

      if (data.success) {
        setEquipment(data.data);
      } else {
        setError(data.error?.message || "Failed to fetch equipment");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Fetch equipment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`);
      const data = await response.json();

      if (data.success) {
        setTeams(data.data.filter((t) => t.status === "ACTIVE"));
      }
    } catch (err) {
      console.error("Fetch teams error:", err);
    }
  };

  const handleScrap = async (equipmentId, equipmentName) => {
    if (
      !confirm(
        `Are you sure you want to scrap "${equipmentName}"? This action cannot be undone and will prevent new maintenance requests.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/equipment/${equipmentId}/scrap`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`Equipment "${equipmentName}" marked as scrapped`);
        fetchEquipment();
      } else {
        alert(data.error?.message || "Failed to scrap equipment");
      }
    } catch (err) {
      alert("Failed to connect to server");
      console.error("Scrap error:", err);
    }
  };

  const handleViewRequests = async (equipmentItem) => {
    setSelectedEquipment(equipmentItem);
    setShowRequestsModal(true);
    setLoadingRequests(true);
    setRequestsError(null);
    setEquipmentRequests([]);

    try {
      const response = await fetch(
        `${API_BASE_URL}/equipment/${equipmentItem.id}/requests`
      );
      const data = await response.json();

      if (data.success) {
        setEquipmentRequests(data.data);
      } else {
        setRequestsError(data.error?.message || "Failed to fetch requests");
      }
    } catch (err) {
      setRequestsError("Failed to connect to server");
      console.error("Fetch requests error:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const closeRequestsModal = () => {
    setShowRequestsModal(false);
    setSelectedEquipment(null);
    setEquipmentRequests([]);
    setRequestsError(null);
  };

  // Navigate to Dashboard with selected request for full detail view
  const handleViewRequestDetail = (request) => {
    closeRequestsModal();
    navigate("/dashboard", { state: { selectedRequestId: request.id } });
  };

  const getRequestStatusBadge = (status) => {
    const badges = {
      NEW: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      IN_PROGRESS: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      REPAIRED: "bg-green-500/20 text-green-300 border-green-500/30",
      SCRAP: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return badges[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  const getOpenRequestCount = (requests) => {
    return requests.filter(
      (r) => r.status === "NEW" || r.status === "IN_PROGRESS"
    ).length;
  };

  const isWarrantyExpired = (warrantyEndDate) => {
    if (!warrantyEndDate) return false;
    return new Date(warrantyEndDate) < new Date();
  };

  const formatWarrantyDate = (warrantyEndDate) => {
    if (!warrantyEndDate) return "N/A";
    return new Date(warrantyEndDate).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const badges = {
      OPERATIONAL: "bg-green-500/20 text-green-300 border-green-500/30",
      MAINTENANCE: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      REPAIR: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      SCRAPPED: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return badges[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  const filtered = equipment.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.serial_number?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());

    const matchesTeam =
      !selectedTeam || item.maintenance_team_id === selectedTeam;
    const matchesStatus = !selectedStatus || item.status === selectedStatus;

    return matchesSearch && matchesTeam && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading equipment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-6 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-center text-red-400">{error}</p>
        </div>
      </div>
    );
  }

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
                  <th className="px-6 py-3 font-bold">Serial Number</th>
                  <th className="px-6 py-3 font-bold">Department</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                  <th className="px-6 py-3 font-bold">Warranty</th>
                  <th className="px-6 py-3 font-bold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item, idx) => {
                  const isHighlighted = highlightedEquipmentId === item.id;
                  return (
                    <tr
                      key={idx}
                      className={`border-b border-gray-800/40 hover:bg-gray-800/20 transition ${
                        isHighlighted
                          ? "bg-cyan-500/10 ring-2 ring-cyan-500/40 animate-pulse"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-100">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-400">
                        {item.serial_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {item.department || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isWarrantyExpired(item.warranty_end_date) ? (
                            <>
                              <AlertTriangle
                                size={14}
                                className="text-red-500"
                              />
                              <span className="text-sm font-semibold text-red-400">
                                {formatWarrantyDate(item.warranty_end_date)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-300">
                              {formatWarrantyDate(item.warranty_end_date)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewRequests(item)}
                            className="p-1.5 rounded-lg border border-indigo-600/30 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition"
                            title="View maintenance requests"
                          >
                            <FileText size={14} />
                          </button>
                          {item.status !== "SCRAPPED" && (
                            <button
                              onClick={() => handleScrap(item.id, item.name)}
                              className="p-1.5 rounded-lg border border-red-600/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition"
                              title="Mark as scrapped"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          {item.status === "SCRAPPED" && (
                            <span className="text-xs text-gray-600 italic">
                              Scrapped
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
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

      {/* Equipment Requests Modal */}
      {showRequestsModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Maintenance Requests - {selectedEquipment.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Serial: {selectedEquipment.serial_number}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!loadingRequests && (
                  <span className="px-3 py-1 text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg">
                    {getOpenRequestCount(equipmentRequests)} Open
                  </span>
                )}
                <button
                  onClick={closeRequestsModal}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {loadingRequests && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <span className="ml-3 text-gray-400">
                    Loading requests...
                  </span>
                </div>
              )}

              {requestsError && (
                <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <p className="text-red-400">{requestsError}</p>
                </div>
              )}

              {!loadingRequests &&
                !requestsError &&
                equipmentRequests.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      No maintenance requests found for this equipment
                    </p>
                  </div>
                )}

              {!loadingRequests &&
                !requestsError &&
                equipmentRequests.length > 0 && (
                  <div className="space-y-3">
                    {equipmentRequests.map((request) => (
                      <div
                        key={request.id}
                        onClick={() => handleViewRequestDetail(request)}
                        className="bg-gray-800/30 border border-gray-700/40 rounded-xl p-4 hover:bg-gray-800/50 hover:border-cyan-500/30 transition cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-white mb-1 group-hover:text-cyan-300 transition">
                                {request.title}
                              </h4>
                              <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition opacity-0 group-hover:opacity-100" />
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2">
                              {request.description}
                            </p>
                          </div>
                          <span
                            className={`ml-3 inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border ${getRequestStatusBadge(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                          <div>
                            <span className="text-gray-500 font-medium">
                              Type:
                            </span>
                            <p className="text-gray-300 font-semibold">
                              {request.request_type}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">
                              Priority:
                            </span>
                            <p className="text-gray-300 font-semibold">
                              {request.priority}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">
                              Technician:
                            </span>
                            <p
                              className={`font-semibold ${
                                request.assigned_to_name
                                  ? "text-gray-300"
                                  : "text-gray-500 italic"
                              }`}
                            >
                              {request.assigned_to_name || "Unassigned"}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">
                              Team:
                            </span>
                            <p className="text-gray-300 font-semibold">
                              {request.team_name || "-"}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">
                              Created:
                            </span>
                            <p className="text-gray-300 font-semibold">
                              {new Date(
                                request.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {request.created_by_name && (
                          <div className="mt-3 pt-3 border-t border-gray-700/40 text-xs text-gray-500">
                            Created by:{" "}
                            <span className="text-gray-300 font-medium">
                              {request.created_by_name}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <div className="p-6 border-t border-gray-800 flex gap-3">
              <button
                onClick={() => {
                  closeRequestsModal();
                  navigate(`/equipment/${selectedEquipment.id}`);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                View Equipment Details
              </button>
              <button
                onClick={closeRequestsModal}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
