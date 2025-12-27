import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Diamond,
  Clock,
  Building2,
  User,
  HardDrive,
  UserPlus,
  Activity,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../hooks/useAuth";

const MaintenanceDetail = ({ data, onBack }) => {
  const navigate = useNavigate();
  const { getUserId, canAssignRequests } = useAuth();
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [assignedTech, setAssignedTech] = useState(data.assigned_to_name);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("notes");
  const [equipmentDetails, setEquipmentDetails] = useState(null);

  // Fetch logs and equipment details on mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLogsLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/requests/${data.id}/logs`
        );
        const result = await response.json();

        if (result.success) {
          setLogs(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLogsLoading(false);
      }
    };

    const fetchEquipmentDetails = async () => {
      if (data.equipment_id) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/equipment/${data.equipment_id}`
          );
          const result = await response.json();
          if (result.success) {
            setEquipmentDetails(result.data);
          }
        } catch (err) {
          console.error("Failed to fetch equipment details:", err);
        }
      }
    };

    fetchLogs();
    fetchEquipmentDetails();
  }, [data.id, data.equipment_id]);

  if (!data) return null;

  const handleAssignToMe = async () => {
    const currentUserId = getUserId();
    if (!currentUserId) {
      setAssignError("User not authenticated");
      return;
    }

    setAssigning(true);
    setAssignError(null);
    setAssignSuccess(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/requests/${data.id}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assigned_to: currentUserId,
            assigned_by: currentUserId,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setAssignedTech(result.data.assigned_to_name);
        setAssignSuccess(true);
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setAssignSuccess(false), 3000);
      } else {
        setAssignError(result.error?.message || "Failed to assign request");
      }
    } catch (err) {
      setAssignError("Failed to connect to server");
      console.error("Assignment error:", err);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        <div>
          <button
            onClick={onBack}
            className="group flex items-center text-indigo-400 hover:text-indigo-300 transition-colors mb-2 text-sm font-medium"
          >
            <ChevronLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Dashboard
          </button>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">
              Subject
            </span>
            <h1 className="text-4xl font-black text-white tracking-tight">
              {data.subject}
            </h1>
          </div>
        </div>

        {/* Status Stepper - Mirrored from Image */}
        <div className="flex items-center p-1.5 bg-gray-900/50 border border-gray-700/50 rounded-2xl backdrop-blur-md">
          <StatusStep label="New Request" active />
          <StepSeparator />
          <StatusStep label="In Progress" />
          <StepSeparator />
          <StatusStep label="Repaired" />
          <StepSeparator />
          <StatusStep label="Scrap" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Info Fields (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="backdrop-blur-xl bg-gray-800/20 border border-gray-700/30 rounded-3xl p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <DetailField
                label="Created By"
                value={data.created_by_name || "Unknown"}
                icon={<User size={14} />}
              />
              <DetailField
                label="Request Type"
                value={data.request_type}
                isCapitalize
              />
              <DetailField
                label="Equipment"
                value={data.equipment_name || "Unknown"}
                icon={<HardDrive size={14} />}
                fullWidth
                isClickable={!!equipmentDetails}
                equipmentId={data.equipment_id}
              />
              <DetailField
                label="Priority"
                value={data.priority}
                isCapitalize
              />
              <DetailField
                label="Request Date"
                value={
                  data.created_at
                    ? new Date(data.created_at).toLocaleDateString()
                    : "-"
                }
              />

              {data.scheduled_date && (
                <DetailField
                  label="Scheduled Date"
                  value={new Date(data.scheduled_date).toLocaleDateString()}
                />
              )}
            </div>
          </div>

          {/* Bottom Tabs */}
          <div className="backdrop-blur-xl bg-gray-800/20 border border-gray-700/30 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex border-b border-gray-700/30 bg-gray-900/20">
              <button
                onClick={() => setActiveTab("notes")}
                className={`px-8 py-4 text-sm font-bold transition-colors ${
                  activeTab === "notes"
                    ? "border-b-2 border-indigo-500 bg-indigo-500/5 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-8 py-4 text-sm font-bold transition-colors flex items-center gap-2 ${
                  activeTab === "history"
                    ? "border-b-2 border-indigo-500 bg-indigo-500/5 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Activity size={14} />
                History
                {logs.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
                    {logs.length}
                  </span>
                )}
              </button>
            </div>
            <div className="p-8">
              {activeTab === "notes" ? (
                <textarea
                  className="w-full bg-transparent border-none focus:ring-0 text-gray-300 placeholder-gray-600 h-32 resize-none text-lg"
                  placeholder="Add internal activity logs or technical notes..."
                />
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {logsLoading ? (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      <Loader2 size={24} className="animate-spin" />
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No activity history yet
                    </div>
                  ) : (
                    logs.map((log, index) => (
                      <LogEntry key={log.id} log={log} isFirst={index === 0} />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Scheduling & Priority (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="backdrop-blur-xl bg-gray-800/20 border border-gray-700/30 rounded-3xl p-8 shadow-2xl space-y-8">
            <DetailField
              label="Team"
              value={data.team_name || "Internal Maintenance"}
            />

            {/* Technician Field with Assign Button */}
            <div className="space-y-3">
              <DetailField
                label="Technician"
                value={assignedTech || "Unassigned"}
                icon={<User size={14} />}
              />

              {/* Assign to Me Button - Only show if not assigned, status is NEW, and user can assign requests */}
              {!assignedTech &&
                data.status === "NEW" &&
                canAssignRequests() && (
                  <button
                    onClick={handleAssignToMe}
                    disabled={assigning}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20"
                  >
                    <UserPlus size={16} />
                    {assigning ? "Assigning..." : "Assign to Me"}
                  </button>
                )}

              {/* Success Message */}
              {assignSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs text-center animate-in fade-in slide-in-from-top-2">
                  Successfully assigned!
                </div>
              )}

              {/* Error Message */}
              {assignError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {assignError}
                </div>
              )}
            </div>
            <DetailField
              label="Scheduled Date"
              value="12/28/2025 14:30:00"
              icon={<Clock size={14} />}
            />

            {/* SLA Information - Only show for open requests */}
            {data.sla_hours_remaining !== null &&
              data.sla_hours_remaining !== undefined && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
                    <Timer size={14} /> SLA Status
                  </label>
                  <div
                    className={`p-4 rounded-xl border ${
                      data.sla_breached
                        ? "bg-red-500/10 border-red-500/30"
                        : parseFloat(data.sla_hours_remaining) <
                          data.sla_hours * 0.2
                        ? "bg-orange-500/10 border-orange-500/30"
                        : "bg-gray-700/20 border-gray-700/30"
                    }`}
                  >
                    {data.sla_breached ? (
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={16} className="text-red-400" />
                        <span className="text-sm font-bold text-red-400">
                          SLA BREACHED
                        </span>
                      </div>
                    ) : null}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Target SLA</p>
                        <p className="text-white font-bold">
                          {data.sla_hours}h
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Elapsed</p>
                        <p className="text-white font-bold">
                          {parseFloat(data.sla_hours_elapsed || 0).toFixed(1)}h
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500 text-xs mb-1">
                          {data.sla_breached ? "Breached By" : "Remaining"}
                        </p>
                        <p
                          className={`font-bold text-lg ${
                            data.sla_breached
                              ? "text-red-400"
                              : parseFloat(data.sla_hours_remaining) <
                                data.sla_hours * 0.2
                              ? "text-orange-400"
                              : "text-green-400"
                          }`}
                        >
                          {data.sla_breached
                            ? `${Math.abs(
                                parseFloat(data.sla_hours_remaining)
                              ).toFixed(1)}h`
                            : `${parseFloat(data.sla_hours_remaining).toFixed(
                                1
                              )}h`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Closed Status Info - Show for REPAIRED/SCRAP */}
            {(data.status === "REPAIRED" || data.status === "SCRAP") && (
              <div className="p-4 rounded-xl border border-gray-700/30 bg-gray-700/20">
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <Clock size={12} />
                  SLA tracking stopped (request closed)
                </p>
              </div>
            )}

            <div className="flex justify-between items-end pt-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 block">
                  Priority
                </label>
                <div className="flex gap-1.5 text-indigo-500">
                  <Diamond size={20} fill="currentColor" />
                  <Diamond size={20} className="text-gray-700" />
                  <Diamond size={20} className="text-gray-700" />
                </div>
              </div>
              <div className="text-right">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">
                  Company
                </label>
                <div className="flex items-center gap-2 text-gray-300">
                  <Building2 size={16} />
                  <span className="font-medium">{data.company}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Helper Sub-Components --- */

const DetailField = ({
  label,
  value,
  icon,
  fullWidth,
  isCapitalize,
  isClickable,
  equipmentId,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isClickable && equipmentId) {
      navigate(`/equipment/${equipmentId}`);
    }
  };

  return (
    <div className={`${fullWidth ? "md:col-span-2" : ""} space-y-1`}>
      <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
        {icon} {label}
      </label>
      <div
        onClick={handleClick}
        className={`text-lg font-medium text-gray-100 border-b border-gray-700/50 pb-2 ${
          isCapitalize ? "capitalize" : ""
        } ${
          isClickable
            ? "cursor-pointer hover:text-cyan-400 hover:border-cyan-500/50 transition group flex items-center gap-2"
            : ""
        }`}
      >
        {value}
        {isClickable && (
          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
        )}
      </div>
    </div>
  );
};

const StatusStep = ({ label, active }) => (
  <span
    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
      active
        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/50"
        : "text-gray-500 hover:text-gray-300"
    }`}
  >
    {label}
  </span>
);

const StepSeparator = () => <span className="text-gray-700 px-1">❯</span>;

const RadioOption = ({ label, ...props }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <input
      type="radio"
      {...props}
      className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
    />
    <span className="text-gray-300 group-hover:text-white transition-colors">
      {label}
    </span>
  </label>
);

const LogEntry = ({ log, isFirst }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionLabel = (action) => {
    const labels = {
      request_created: "Request Created",
      request_assigned: "Assigned to Technician",
      status_changed: "Status Changed",
      equipment_scrapped: "Equipment Scrapped",
      request_updated: "Request Updated",
      priority_changed: "Priority Changed",
      scheduled_date_changed: "Schedule Updated",
      equipment_assigned: "Equipment Assigned",
    };
    return labels[action] || action.replace(/_/g, " ").toUpperCase();
  };

  const getActionIcon = (action) => {
    if (action === "request_assigned") return "👤";
    if (action === "status_changed") return "🔄";
    if (action === "equipment_scrapped") return "🗑️";
    if (action === "request_created") return "✨";
    if (action === "priority_changed") return "⚡";
    if (action === "scheduled_date_changed") return "📅";
    return "📝";
  };

  const renderDetails = (details) => {
    if (!details) return null;

    const entries = [];

    // Status change
    if (details.previous_status && details.new_status) {
      entries.push(
        <span key="status" className="text-xs text-gray-400">
          <span className="text-gray-500">{details.previous_status}</span>
          {" → "}
          <span className="text-indigo-400">{details.new_status}</span>
        </span>
      );
    }

    // Priority change
    if (details.old_priority && details.new_priority) {
      entries.push(
        <span key="priority" className="text-xs text-gray-400">
          <span className="text-gray-500">{details.old_priority}</span>
          {" → "}
          <span className="text-orange-400">{details.new_priority}</span>
        </span>
      );
    }

    // Assignment
    if (details.assigned_to_name) {
      entries.push(
        <span key="assigned" className="text-xs text-indigo-400">
          {details.assigned_to_name}
        </span>
      );
    }

    // Assigned by (if different from user)
    if (
      details.assigned_by_name &&
      details.assigned_by_name !== log.user_name
    ) {
      entries.push(
        <span key="by" className="text-xs text-gray-500">
          by {details.assigned_by_name}
        </span>
      );
    }

    return entries.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-1">{entries}</div>
    ) : null;
  };

  return (
    <div className="relative flex gap-3">
      {/* Timeline line */}
      {!isFirst && (
        <div className="absolute left-[15px] top-0 w-0.5 h-3 bg-gray-700/50 -translate-y-3" />
      )}

      {/* Icon */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800/50 border border-gray-700/50 flex items-center justify-center text-sm">
        {getActionIcon(log.action)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              {getActionLabel(log.action)}
            </p>
            {renderDetails(log.details)}
          </div>
          <span className="text-[10px] text-gray-500 whitespace-nowrap">
            {formatDate(log.created_at)}
          </span>
        </div>
        {log.user_name && (
          <p className="text-[10px] text-gray-500 mt-1">by {log.user_name}</p>
        )}
      </div>
    </div>
  );
};

export default MaintenanceDetail;
