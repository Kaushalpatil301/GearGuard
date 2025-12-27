import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  HardDrive,
  Clock,
  AlertTriangle,
  Loader2,
  TrendingUp,
  FileBarChart,
  RefreshCw,
  Calendar as CalendarIcon,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dateRange, setDateRange] = useState("all");
  const [reports, setReports] = useState({
    requestsByTeam: [],
    requestsByEquipment: [],
    technicianWorkload: [],
    slaCompliance: [],
    requestAging: [],
  });

  useEffect(() => {
    fetchAllReports();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAllReports(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchAllReports = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const [teamRes, equipmentRes, workloadRes, slaRes, agingRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/reports/requests-by-team`),
          fetch(`${API_BASE_URL}/reports/requests-by-equipment`),
          fetch(`${API_BASE_URL}/reports/technician-workload`),
          fetch(`${API_BASE_URL}/reports/sla-breach-stats-by-priority`),
          fetch(`${API_BASE_URL}/reports/request-aging`),
        ]);

      const [teamData, equipmentData, workloadData, slaData, agingData] =
        await Promise.all([
          teamRes.json(),
          equipmentRes.json(),
          workloadRes.json(),
          slaRes.json(),
          agingRes.json(),
        ]);

      setReports({
        requestsByTeam: teamData.success ? teamData.data : [],
        requestsByEquipment: equipmentData.success ? equipmentData.data : [],
        technicianWorkload: workloadData.success ? workloadData.data : [],
        slaCompliance: slaData.success ? slaData.data : [],
        requestAging: agingData.success ? agingData.data : [],
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load reports");
      console.error("Reports error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchAllReports(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-xl text-gray-400">Loading reports...</span>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent pointer-events-none" />

      <main className="relative max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in duration-700">
        {/* Header with Refresh */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <FileBarChart size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">
                Reports & Analytics
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {lastUpdated
                  ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
                  : "Loading..."}
              </p>
            </div>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={loading || refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/40"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            <span className="text-sm font-bold">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SummaryCard
            title="Total Teams"
            value={reports.requestsByTeam.length}
            icon={<Users size={24} />}
            color="indigo"
          />
          <SummaryCard
            title="Active Equipment"
            value={reports.requestsByEquipment.length}
            icon={<HardDrive size={24} />}
            color="cyan"
          />
          <SummaryCard
            title="Technicians"
            value={reports.technicianWorkload.length}
            icon={<TrendingUp size={24} />}
            color="green"
          />
          <SummaryCard
            title="SLA Categories"
            value={reports.slaCompliance.length}
            icon={<Clock size={24} />}
            color="orange"
          />
        </div>

        {/* Requests by Team */}
        <ReportSection
          title="Requests by Team"
          icon={<Users size={20} />}
          data={reports.requestsByTeam}
          columns={[
            { key: "team_name", label: "Team", highlight: true },
            { key: "total_requests", label: "Total", align: "center" },
            { key: "new_requests", label: "New", align: "center" },
            {
              key: "in_progress_requests",
              label: "In Progress",
              align: "center",
            },
            { key: "repaired_requests", label: "Repaired", align: "center" },
            { key: "scrap_requests", label: "Scrap", align: "center" },
          ]}
        />

        {/* Requests by Equipment */}
        <ReportSection
          title="Requests by Equipment"
          icon={<HardDrive size={20} />}
          data={reports.requestsByEquipment}
          columns={[
            { key: "equipment_name", label: "Equipment", highlight: true },
            { key: "serial_number", label: "Serial" },
            { key: "team_name", label: "Team" },
            { key: "total_requests", label: "Total", align: "center" },
            { key: "new_requests", label: "New", align: "center" },
            {
              key: "in_progress_requests",
              label: "In Progress",
              align: "center",
            },
          ]}
        />

        {/* Technician Workload */}
        <ReportSection
          title="Technician Workload"
          icon={<TrendingUp size={20} />}
          data={reports.technicianWorkload}
          columns={[
            { key: "technician_name", label: "Technician", highlight: true },
            { key: "technician_email", label: "Email" },
            { key: "active_assignments", label: "Active", align: "center" },
            {
              key: "completed_assignments",
              label: "Completed",
              align: "center",
            },
            {
              key: "overdue_assignments",
              label: "Overdue",
              align: "center",
            },
            {
              key: "total_assignments",
              label: "Total",
              align: "center",
            },
          ]}
        />

        {/* SLA Compliance */}
        <ReportSection
          title="SLA Compliance by Priority"
          icon={<Clock size={20} />}
          data={reports.slaCompliance}
          columns={[
            { key: "priority", label: "Priority", highlight: true },
            {
              key: "total_active_requests",
              label: "Active",
              align: "center",
            },
            {
              key: "breached_requests",
              label: "Breached",
              align: "center",
            },
            { key: "at_risk_requests", label: "At Risk", align: "center" },
            {
              key: "on_track_requests",
              label: "On Track",
              align: "center",
            },
            {
              key: "avg_breach_hours",
              label: "Avg Breach (hrs)",
              align: "center",
              format: (val) => (val ? val.toFixed(1) : "-"),
            },
          ]}
        />

        {/* Request Aging */}
        <ReportSection
          title="Request Aging Analysis"
          icon={<BarChart3 size={20} />}
          data={reports.requestAging}
          columns={[
            { key: "age_bucket", label: "Age Range" },
            { key: "request_count", label: "Count", align: "center" },
            { key: "avg_age_days", label: "Avg Age (days)", align: "center" },
          ]}
        />
      </main>
    </div>
  );
};

const SummaryCard = ({ title, value, icon, color }) => {
  const colors = {
    indigo: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
    cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    green: "border-green-500/30 bg-green-500/10 text-green-400",
    orange: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  };

  return (
    <div
      className={`backdrop-blur-xl border rounded-2xl p-6 ${colors[color]} hover:scale-105 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest font-bold opacity-60">
          {title}
        </span>
        {icon}
      </div>
      <div className="text-4xl font-black text-white">{value}</div>
    </div>
  );
};

const ReportSection = ({ title, icon, data, columns }) => {
  return (
    <div className="backdrop-blur-2xl bg-gray-900/20 border border-gray-700/30 rounded-3xl shadow-2xl overflow-hidden">
      <div className="px-6 py-4 bg-gray-950/40 border-b border-gray-700/40 flex items-center gap-3">
        <div className="text-indigo-400">{icon}</div>
        <h2 className="text-lg font-bold text-white uppercase tracking-wider">
          {title}
        </h2>
        <span className="ml-auto text-xs text-gray-500 font-semibold">
          {data.length} {data.length === 1 ? "record" : "records"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-[11px] uppercase tracking-widest text-gray-500 border-b border-gray-700/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 font-bold ${
                    col.align === "center" ? "text-center" : "text-left"
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-gray-500 text-sm"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-800/40 hover:bg-gray-800/20 transition"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 text-sm ${
                        col.align === "center"
                          ? "text-center font-semibold text-gray-300"
                          : col.highlight
                          ? "text-gray-100 font-bold"
                          : "text-gray-400"
                      }`}
                    >
                      {col.format
                        ? col.format(row[col.key])
                        : row[col.key] !== null && row[col.key] !== undefined
                        ? row[col.key]
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
