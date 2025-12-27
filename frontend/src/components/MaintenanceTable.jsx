import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Plus,
  AlertCircle,
  Loader2,
  Clock,
  AlertTriangle,
  Timer,
} from "lucide-react";
import { API_BASE_URL, REQUEST_STATUS } from "../config/api";

const MaintenanceTable = ({
  kanbanData,
  data,
  onSelectRequest,
  onStatusChange,
  loading,
  error,
}) => {
  const navigate = useNavigate();
  const [draggedRequest, setDraggedRequest] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const statusColumns = [
    { key: "NEW", label: "New Requests", color: "blue" },
    { key: "IN_PROGRESS", label: "In Progress", color: "yellow" },
    { key: "REPAIRED", label: "Repaired", color: "green" },
    { key: "SCRAP", label: "Scrapped", color: "red" },
  ];

  const handleDragStart = (e, request) => {
    setDraggedRequest(request);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, columnKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnKey);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedRequest || draggedRequest.status === newStatus) {
      setDraggedRequest(null);
      setIsDragging(false);
      return;
    }

    await updateRequestStatus(draggedRequest.id, newStatus);
    setDraggedRequest(null);
    setIsDragging(false);
  };

  const updateRequestStatus = async (requestId, newStatus) => {
    setUpdatingStatus(requestId);
    setStatusError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Refresh kanban data
        onStatusChange();
      } else {
        // Backend validation error - show specific message
        setStatusError(data.error?.message || "Failed to update status");
        setTimeout(() => setStatusError(null), 5000);
      }
    } catch (err) {
      setStatusError("Failed to connect to server");
      setTimeout(() => setStatusError(null), 5000);
      console.error("Status update error:", err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: "text-gray-500",
      MEDIUM: "text-blue-400",
      HIGH: "text-orange-400",
      CRITICAL: "text-red-400",
    };
    return colors[priority] || "text-gray-500";
  };

  const getStatusColor = (status) => {
    const colors = {
      NEW: "border-blue-500/30 bg-blue-500/5",
      IN_PROGRESS: "border-yellow-500/30 bg-yellow-500/5",
      REPAIRED: "border-green-500/30 bg-green-500/5",
      SCRAP: "border-red-500/30 bg-red-500/5",
    };
    return colors[status] || "border-gray-500/30 bg-gray-500/5";
  };

  // Calculate KPI metrics
  const totalRequests = data.length;
  const criticalCount = data.filter((r) => r.priority === "CRITICAL").length;
  const overdueCount = data.filter((r) => r.is_overdue).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading maintenance requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
      {/* Error Banner */}
      {(error || statusError) && (
        <div className="backdrop-blur-lg bg-red-900/20 border border-red-600/40 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <span className="text-red-300">{error || statusError}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <KPICard
          title="Critical Requests"
          value={criticalCount}
          suffix="urgent"
          subtitle={`${
            Math.round((criticalCount / totalRequests) * 100) || 0
          }% of total`}
          color="red"
        />
        <KPICard
          title="Overdue Items"
          value={overdueCount}
          suffix="late"
          subtitle="Needs immediate attention"
          color="orange"
        />
        <KPICard
          title="Open Requests"
          value={totalRequests}
          suffix="active"
          subtitle="Live queue"
          color="blue"
        />
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => (
          <div
            key={column.key}
            className={`backdrop-blur-xl bg-gray-900/20 border border-gray-700/30 rounded-3xl overflow-hidden shadow-2xl transition-all ${
              dragOverColumn === column.key
                ? "ring-2 ring-indigo-500 scale-[1.02]"
                : ""
            }`}
            onDragOver={(e) => handleDragOver(e, column.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.key)}
          >
            {/* Column Header */}
            <div className="px-6 py-4 bg-gray-950/40 border-b border-gray-700/40">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                {column.label}
              </h3>
              <p className="text-2xl font-black text-white mt-1">
                {kanbanData[column.key]?.length || 0}
              </p>
            </div>

            {/* Cards */}
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {kanbanData[column.key]?.map((request) => (
                <div
                  key={request.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, request)}
                  onDragEnd={() => setIsDragging(false)}
                  onClick={() => {
                    if (!isDragging && request.equipment_id) {
                      navigate(`/equipment/${request.equipment_id}`);
                    }
                  }}
                  className={`backdrop-blur-lg ${getStatusColor(
                    request.status
                  )} border rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-all cursor-grab active:cursor-grabbing ${
                    updatingStatus === request.id
                      ? "opacity-50 cursor-wait"
                      : ""
                  }`}
                >
                  {/* Priority Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[9px] uppercase tracking-widest font-bold ${getPriorityColor(
                        request.priority
                      )}`}
                    >
                      {request.priority}
                    </span>
                    {request.sla_breached && (
                      <span className="flex items-center gap-1 text-[9px] text-red-400 font-bold">
                        <AlertTriangle size={12} />
                        BREACH
                      </span>
                    )}
                    {!request.sla_breached && request.is_overdue && (
                      <AlertTriangle size={14} className="text-red-400" />
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-white mb-2 line-clamp-2">
                    {request.title}
                  </h4>

                  {/* Equipment */}
                  <p className="text-[10px] text-gray-500 mb-2 truncate">
                    {request.equipment_name || "Unknown Equipment"}
                  </p>

                  {/* SLA Information - Only show for open requests */}
                  {request.sla_hours_remaining !== null &&
                    request.sla_hours_remaining !== undefined && (
                      <div
                        className={`flex items-center gap-1 text-[9px] mb-2 ${
                          request.sla_breached
                            ? "text-red-400 font-bold"
                            : parseFloat(request.sla_hours_remaining) <
                              request.sla_hours * 0.2
                            ? "text-orange-400"
                            : "text-gray-500"
                        }`}
                      >
                        <Timer size={10} />
                        {request.sla_breached
                          ? `Breached by ${Math.abs(
                              parseFloat(request.sla_hours_remaining)
                            ).toFixed(1)}h`
                          : `${parseFloat(request.sla_hours_remaining).toFixed(
                              1
                            )}h remaining`}
                      </div>
                    )}

                  {/* Team & Type */}
                  <div className="flex items-center justify-between text-[9px] text-gray-600">
                    <span>{request.team_name}</span>
                    <span className="uppercase">{request.request_type}</span>
                  </div>

                  {/* Assigned Technician */}
                  {request.assigned_to_name && (
                    <div className="mt-2 pt-2 border-t border-gray-700/40">
                      <p className="text-[9px] text-indigo-400 uppercase tracking-wider">
                        {request.assigned_to_name}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {kanbanData[column.key]?.length === 0 && (
                <div className="text-center py-8 text-gray-600 text-xs">
                  No requests
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legacy Table View (for search results) */}
      {data.length > 0 && (
        <div className="backdrop-blur-3xl bg-gray-900/20 border border-gray-700/30 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="px-6 py-4 bg-gray-950/40 border-b border-gray-700/40">
            <h3 className="text-sm font-bold text-indigo-400">
              All Requests ({data.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left text-gray-500 text-[10px] uppercase tracking-[0.25em] font-black bg-gray-950/40">
                  <th className="px-10 py-6">Title</th>
                  <th className="px-10 py-6">Equipment</th>
                  <th className="px-10 py-6">Team</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6">Priority</th>
                  <th className="px-10 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {data.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => {
                      if (row.equipment_id) {
                        navigate(`/equipment/${row.equipment_id}`);
                      }
                    }}
                    className="group hover:bg-indigo-500/[0.04] transition-all cursor-pointer"
                  >
                    <td className="px-10 py-7">
                      <div className="font-bold text-gray-100 group-hover:text-indigo-300 transition-colors text-sm">
                        {row.title}
                      </div>
                      {row.is_overdue && (
                        <div className="flex items-center gap-1 text-[10px] text-red-400 mt-1">
                          <Clock size={10} />
                          Overdue
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-7 text-gray-400 text-xs">
                      {row.equipment_name || "Unknown Equipment"}
                    </td>
                    <td className="px-10 py-7 text-gray-400 text-xs">
                      {row.team_name}
                    </td>
                    <td className="px-10 py-7">
                      <span className="px-4 py-1.5 bg-gray-950/80 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-700/50 text-indigo-400">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <span
                        className={`text-xs font-bold ${getPriorityColor(
                          row.priority
                        )}`}
                      >
                        {row.priority}
                      </span>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="text-indigo-400 text-xs font-black opacity-100 flex items-center justify-end space-x-2">
                        <span>DETAILS</span> <Activity size={14} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const KPICard = ({ title, value, suffix, subtitle, color }) => {
  const colors = {
    red: "border-red-500/20 text-red-400 shadow-red-500/[0.03]",
    orange: "border-orange-500/20 text-orange-400 shadow-orange-500/[0.03]",
    blue: "border-blue-500/20 text-blue-400 shadow-blue-500/[0.03]",
    green: "border-emerald-500/20 text-emerald-400 shadow-emerald-500/[0.03]",
  };
  return (
    <div
      className={`backdrop-blur-3xl bg-gray-900/10 border-2 rounded-[2.5rem] p-10 shadow-2xl transition-all duration-500 hover:-translate-y-3 ${colors[color]}`}
    >
      <h3 className="text-[11px] uppercase tracking-[0.35em] font-black text-gray-500 mb-6">
        {title}
      </h3>
      <div className="flex items-baseline space-x-3">
        <p className="text-6xl font-black text-white">{value}</p>
        <span className="text-lg font-black opacity-30 uppercase tracking-widest">
          {suffix}
        </span>
      </div>
      <p className="text-[11px] font-bold mt-4 opacity-40 italic">{subtitle}</p>
    </div>
  );
};

export default MaintenanceTable;
