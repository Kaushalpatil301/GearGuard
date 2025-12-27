import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Save,
  HardDrive,
  User,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { API_BASE_URL, REQUEST_TYPE, PRIORITY } from "../config/api";
import { useAuth } from "../hooks/useAuth";

// Helper function to get user role from localStorage
const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.role || null;
  } catch {
    return null;
  }
};

// Check if user can create preventive requests (MANAGER/ADMIN)
const canCreatePreventive = () => {
  const role = getUserRole();
  return role === "MANAGER" || role === "ADMIN";
};

const NewRequestForm = () => {
  const navigate = useNavigate();
  const { getUserId, canCreatePreventive } = useAuth();

  // State
  const [equipment, setEquipment] = useState([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedEquipmentDetails, setSelectedEquipmentDetails] =
    useState(null);
  const [assignedTeam, setAssignedTeam] = useState(null);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const [formData, setFormData] = useState({
    equipment_id: "",
    request_type: "CORRECTIVE",
    title: "",
    description: "",
    priority: "MEDIUM",
    scheduled_date: "",
    sla_hours: 48,
  });

  // Fetch equipment (exclude SCRAPPED)
  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoadingEquipment(true);
      const response = await fetch(`${API_BASE_URL}/equipment`);
      const data = await response.json();

      if (data.success) {
        // Filter out scrapped equipment
        const availableEquipment = data.data.filter(
          (e) => e.status !== "SCRAPPED"
        );
        setEquipment(availableEquipment);
      } else {
        setError("Failed to load equipment list");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Fetch equipment error:", err);
    } finally {
      setLoadingEquipment(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Clear scheduled_date if switching to CORRECTIVE
    if (name === "request_type" && value === "CORRECTIVE") {
      setFormData((prev) => ({ ...prev, scheduled_date: "" }));
    }

    // Fetch equipment details and assigned team when equipment is selected
    if (name === "equipment_id" && value) {
      await fetchEquipmentDetails(value);
    } else if (name === "equipment_id" && !value) {
      setSelectedEquipmentDetails(null);
      setAssignedTeam(null);
    }
  };

  const fetchEquipmentDetails = async (equipmentId) => {
    try {
      setLoadingTeam(true);
      const response = await fetch(`${API_BASE_URL}/equipment/${equipmentId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedEquipmentDetails(data.data);

        // Fetch team details if equipment has maintenance_team_id
        if (data.data.maintenance_team_id) {
          await fetchTeamDetails(data.data.maintenance_team_id);
        } else {
          setAssignedTeam(null);
        }
      }
    } catch (err) {
      console.error("Fetch equipment details error:", err);
    } finally {
      setLoadingTeam(false);
    }
  };

  const fetchTeamDetails = async (teamId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`);
      const data = await response.json();

      if (data.success) {
        setAssignedTeam(data.data);
      }
    } catch (err) {
      console.error("Fetch team details error:", err);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.equipment_id) {
      errors.equipment_id = "Equipment is required";
    }

    if (!formData.title || formData.title.trim().length < 5) {
      errors.title = "Title must be at least 5 characters";
    }

    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    // PREVENTIVE requests REQUIRE scheduled_date (mirror backend rule)
    if (formData.request_type === "PREVENTIVE" && !formData.scheduled_date) {
      errors.scheduled_date =
        "Scheduled date is required for preventive maintenance";
    }

    // Validate scheduled_date is in future if provided
    if (formData.scheduled_date) {
      const scheduledTime = new Date(formData.scheduled_date).getTime();
      const now = new Date().getTime();
      if (scheduledTime < now) {
        errors.scheduled_date = "Scheduled date must be in the future";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Frontend validation
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const userId = getUserId();
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      const payload = {
        equipment_id: formData.equipment_id,
        request_type: formData.request_type,
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        scheduled_date: formData.scheduled_date || null,
        sla_hours: parseInt(formData.sla_hours) || 48,
        created_by: userId,
      };

      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        // Success - redirect to dashboard
        navigate("/dashboard");
      } else {
        // Backend validation error
        setError(data.error?.message || "Failed to create request");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 backdrop-blur-lg bg-red-900/20 border border-red-600/40 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <span className="text-red-300">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              disabled={submitting}
              className="group flex items-center text-gray-500 hover:text-indigo-400 transition-colors mb-2 text-sm font-medium disabled:opacity-50"
            >
              <ChevronLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Discard & Back
            </button>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Create New Request
            </h1>
          </div>

          <button
            type="submit"
            disabled={submitting || loadingEquipment}
            className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-bold transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Save Request</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="backdrop-blur-xl bg-gray-800/20 border border-gray-700/30 rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Equipment Selection */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
                    <HardDrive size={14} /> Equipment *
                  </label>
                  {loadingEquipment ? (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      Loading equipment...
                    </div>
                  ) : (
                    <>
                      <select
                        name="equipment_id"
                        value={formData.equipment_id}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-900/40 border border-gray-700 focus:border-indigo-500 outline-none p-3 rounded-lg text-gray-100"
                      >
                        <option value="">Select Equipment</option>
                        {equipment.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} - {item.serial_number} ({item.status})
                          </option>
                        ))}
                      </select>
                      {validationErrors.equipment_id && (
                        <p className="text-red-400 text-xs mt-1">
                          {validationErrors.equipment_id}
                        </p>
                      )}
                    </>
                  )}

                  {/* Auto-Assigned Team Display */}
                  {formData.equipment_id && (
                    <div className="mt-4 p-4 bg-indigo-900/20 border border-indigo-600/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <User
                          size={16}
                          className="text-indigo-400 mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                            Auto-Assigned Maintenance Team
                          </p>
                          {loadingTeam ? (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Loader2 size={14} className="animate-spin" />
                              <span>Loading team...</span>
                            </div>
                          ) : assignedTeam ? (
                            <div>
                              <p className="text-white font-semibold text-sm">
                                {assignedTeam.name}
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                {assignedTeam.specialization} •{" "}
                                {assignedTeam.member_count || 0} members
                              </p>
                            </div>
                          ) : (
                            <p className="text-yellow-400 text-xs">
                              ⚠️ No team assigned to this equipment
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-500 text-[10px] mt-2 italic">
                        Team is automatically assigned based on equipment
                        configuration
                      </p>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                    Title *
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Laptop Screen Repair (min 5 characters)"
                    className="w-full bg-transparent border-b border-gray-700 focus:border-indigo-500 outline-none pb-2 text-xl font-bold text-white placeholder-gray-700 transition-colors"
                  />
                  {validationErrors.title && (
                    <p className="text-red-400 text-xs mt-1">
                      {validationErrors.title}
                    </p>
                  )}
                </div>

                {/* Request Type */}
                <div className="md:col-span-2 pt-4">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4 block">
                    Request Type *
                  </label>
                  <div className="flex gap-8">
                    <RadioOption
                      label="Corrective (Fix broken equipment)"
                      name="request_type"
                      value="CORRECTIVE"
                      checked={formData.request_type === "CORRECTIVE"}
                      onChange={handleChange}
                    />
                    {canCreatePreventive() && (
                      <RadioOption
                        label="Preventive (Scheduled maintenance)"
                        name="request_type"
                        value="PREVENTIVE"
                        checked={formData.request_type === "PREVENTIVE"}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="backdrop-blur-xl bg-gray-800/20 border border-gray-700/30 rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex border-b border-gray-700/30 bg-gray-900/20 px-8 py-4">
                <span className="text-sm font-bold text-indigo-400">
                  Description * (min 10 characters)
                </span>
              </div>
              <div className="p-8">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-none focus:ring-0 text-gray-300 placeholder-gray-700 h-32 resize-none text-lg"
                  placeholder="Describe the issue or maintenance work required in detail..."
                />
                {validationErrors.description && (
                  <p className="text-red-400 text-xs mt-2">
                    {validationErrors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="backdrop-blur-xl bg-gray-800/20 border border-gray-700/30 rounded-3xl p-8 shadow-2xl space-y-8">
              {/* Priority */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-gray-900/40 border border-gray-700 focus:border-indigo-500 outline-none p-3 rounded-lg text-gray-100"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              {/* Scheduled Date */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
                  <Clock size={14} />
                  Scheduled Date {formData.request_type === "PREVENTIVE" && "*"}
                </label>
                <input
                  name="scheduled_date"
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={handleChange}
                  required={formData.request_type === "PREVENTIVE"}
                  className="w-full bg-gray-900/40 border border-gray-700 focus:border-indigo-500 outline-none p-3 rounded-lg text-gray-100"
                />
                {validationErrors.scheduled_date && (
                  <p className="text-red-400 text-xs mt-1">
                    {validationErrors.scheduled_date}
                  </p>
                )}
                {formData.request_type === "PREVENTIVE" && (
                  <p className="text-yellow-400 text-xs mt-1">
                    ⚠️ Required for preventive maintenance
                  </p>
                )}
              </div>

              {/* SLA Hours */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                  SLA (Hours)
                </label>
                <input
                  name="sla_hours"
                  type="number"
                  value={formData.sla_hours}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-gray-900/40 border border-gray-700 focus:border-indigo-500 outline-none p-3 rounded-lg text-gray-100"
                />
                <p className="text-gray-600 text-xs">
                  Expected resolution time
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="backdrop-blur-xl bg-blue-900/10 border border-blue-600/20 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-blue-400 mb-2">📋 Note</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Team assigned automatically from equipment</li>
                <li>• Scrapped equipment cannot be selected</li>
                <li>• Preventive requests need scheduled date</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

/* Helpers */
const RadioOption = ({ label, ...props }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <input
      type="radio"
      {...props}
      className="w-4 h-4 text-indigo-600 bg-gray-900 border-gray-700 focus:ring-indigo-500 focus:ring-offset-gray-900"
    />
    <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
      {label}
    </span>
  </label>
);

export default NewRequestForm;
