import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  HardDrive,
  MapPin,
  Building2,
  Calendar,
  AlertTriangle,
  Loader2,
  FileText,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

const EquipmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const fetchEquipmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/equipment/${id}`);
      const data = await response.json();

      if (data.success) {
        setEquipment(data.data);
      } else {
        setError(data.error?.message || "Failed to load equipment details");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Fetch equipment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipmentRequests = async () => {
    try {
      setRequestsLoading(true);

      const response = await fetch(`${API_BASE_URL}/equipment/${id}/requests`);
      const data = await response.json();

      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (err) {
      console.error("Fetch requests error:", err);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipmentDetails();
    fetchEquipmentRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getStatusBadge = (status) => {
    const badges = {
      OPERATIONAL: "bg-green-500/20 text-green-300 border-green-500/30",
      UNDER_MAINTENANCE:
        "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      SCRAPPED: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return badges[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
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

  const isWarrantyExpired = (warrantyEndDate) => {
    if (!warrantyEndDate) return false;
    return new Date(warrantyEndDate) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getOpenRequestCount = () => {
    return requests.filter(
      (r) => r.status === "NEW" || r.status === "IN_PROGRESS"
    ).length;
  };

  const handleRequestClick = (request) => {
    navigate("/dashboard", { state: { selectedRequestId: request.id } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-lg">Loading equipment details...</span>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="backdrop-blur-lg bg-red-900/20 border border-red-600/40 rounded-2xl p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-300 mb-2">
              Equipment Not Found
            </h2>
            <p className="text-red-400 mb-6">
              {error || "The equipment you're looking for doesn't exist."}
            </p>
            <button
              onClick={() => navigate("/equipment")}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
            >
              Back to Equipment List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const openRequestCount = getOpenRequestCount();
  const warrantyExpired = isWarrantyExpired(equipment.warranty_end_date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent pointer-events-none" />

      <main className="relative max-w-7xl mx-auto p-8 animate-in fade-in duration-700">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center text-indigo-400 hover:text-indigo-300 transition-colors mb-6 text-sm font-medium"
        >
          <ChevronLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back
        </button>

        {/* Equipment Header */}
        <div className="backdrop-blur-xl bg-gray-800/20 border border-gray-700/30 rounded-3xl p-8 shadow-2xl mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
                <HardDrive className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-1">
                  {equipment.name}
                </h1>
                <p className="text-sm text-gray-400 font-mono">
                  S/N: {equipment.serial_number}
                </p>
              </div>
            </div>
            <div>
              <span
                className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-xl border ${getStatusBadge(
                  equipment.status
                )}`}
              >
                {equipment.status}
              </span>
            </div>
          </div>

          {/* Equipment Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DetailCard
              icon={<Building2 size={16} />}
              label="Department"
              value={equipment.department || "N/A"}
            />
            <DetailCard
              icon={<MapPin size={16} />}
              label="Location"
              value={equipment.location || "N/A"}
            />
            <DetailCard
              icon={<Users size={16} />}
              label="Maintenance Team"
              value={equipment.maintenance_team_name || "N/A"}
            />
            <DetailCard
              icon={<Calendar size={16} />}
              label="Purchase Date"
              value={formatDate(equipment.purchase_date)}
            />
          </div>

          {/* Warranty Information */}
          {equipment.warranty_end_date && (
            <div className="mt-6 pt-6 border-t border-gray-700/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {warrantyExpired ? (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                      Warranty Status
                    </p>
                    <p
                      className={`text-sm font-bold ${
                        warrantyExpired ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {warrantyExpired ? "Expired" : "Active"} - Ends{" "}
                      {formatDate(equipment.warranty_end_date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {equipment.description && (
            <div className="mt-6 pt-6 border-t border-gray-700/40">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                Description
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                {equipment.description}
              </p>
            </div>
          )}
        </div>

        {/* Maintenance Requests Section */}
        <div className="backdrop-blur-xl bg-gray-800/20 border border-gray-700/30 rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-8 py-6 bg-gray-950/40 border-b border-gray-700/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">
                Maintenance Requests
              </h2>
              {openRequestCount > 0 && (
                <span className="px-2.5 py-1 bg-orange-500/20 text-orange-300 text-xs font-bold rounded-full border border-orange-500/30">
                  {openRequestCount} Open
                </span>
              )}
            </div>
          </div>

          <div className="p-8">
            {requestsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-gray-500" size={24} />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  No maintenance requests found for this equipment
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => handleRequestClick(request)}
                    className="bg-gray-800/30 border border-gray-700/40 rounded-xl p-4 hover:bg-gray-800/50 hover:border-indigo-500/30 transition cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-white mb-1 group-hover:text-indigo-300 transition">
                          {request.title}
                        </h4>
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
                        <span className="text-gray-500 font-medium">Type:</span>
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
                        <span className="text-gray-500 font-medium">Team:</span>
                        <p className="text-gray-300 font-semibold">
                          {request.team_name || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">
                          Created:
                        </span>
                        <p className="text-gray-300 font-semibold">
                          {formatDate(request.created_at)}
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
        </div>
      </main>
    </div>
  );
};

const DetailCard = ({ icon, label, value }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 text-gray-500">
      {icon}
      <span className="text-xs uppercase tracking-widest font-bold">
        {label}
      </span>
    </div>
    <p className="text-lg font-bold text-gray-100">{value}</p>
  </div>
);

export default EquipmentDetailPage;
