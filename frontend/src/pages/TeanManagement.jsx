import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

const TeamsManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/teams`);
      const data = await response.json();

      if (data.success) {
        setTeams(data.data);
      } else {
        setError(data.error?.message || "Failed to fetch teams");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Fetch teams error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId) => {
    try {
      setActionLoading(true);
      setActionError(null);

      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members`);
      const data = await response.json();

      if (data.success) {
        setTeamMembers(data.data);
      } else {
        setActionError(data.error?.message || "Failed to fetch team members");
      }
    } catch (err) {
      setActionError("Failed to connect to server");
      console.error("Fetch members error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setActionSuccess("Team created successfully");
        setShowCreateModal(false);
        setFormData({ name: "", description: "" });
        fetchTeams();
      } else {
        setActionError(data.error?.message || "Failed to create team");
      }
    } catch (err) {
      setActionError("Failed to connect to server");
      console.error("Create team error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setActionSuccess("Team updated successfully");
        setShowEditModal(false);
        setFormData({ name: "", description: "" });
        setSelectedTeam(null);
        fetchTeams();
      } else {
        setActionError(data.error?.message || "Failed to update team");
      }
    } catch (err) {
      setActionError("Failed to connect to server");
      console.error("Update team error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivateTeam = async (teamId) => {
    if (!confirm("Are you sure you want to deactivate this team?")) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setActionSuccess("Team deactivated successfully");
        fetchTeams();
      } else {
        setActionError(data.error?.message || "Failed to deactivate team");
      }
    } catch (err) {
      setActionError("Failed to connect to server");
      console.error("Deactivate team error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/teams/${selectedTeam.id}/members`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: newMemberEmail }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setActionSuccess("Technician added successfully");
        setNewMemberEmail("");
        fetchTeamMembers(selectedTeam.id);
      } else {
        setActionError(data.error?.message || "Failed to add member");
      }
    } catch (err) {
      setActionError("Failed to connect to server");
      console.error("Add member error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm("Are you sure you want to remove this member from the team?"))
      return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/teams/${selectedTeam.id}/members/${userId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setActionSuccess("Member removed successfully");
        fetchTeamMembers(selectedTeam.id);
      } else {
        setActionError(data.error?.message || "Failed to remove member");
      }
    } catch (err) {
      setActionError("Failed to connect to server");
      console.error("Remove member error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (team) => {
    setSelectedTeam(team);
    setFormData({ name: team.name, description: team.description || "" });
    setShowEditModal(true);
    setActionError(null);
    setActionSuccess(null);
  };

  const openMembersModal = (team) => {
    setSelectedTeam(team);
    setShowMembersModal(true);
    setActionError(null);
    setActionSuccess(null);
    fetchTeamMembers(team.id);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowMembersModal(false);
    setSelectedTeam(null);
    setFormData({ name: "", description: "" });
    setNewMemberEmail("");
    setActionError(null);
    setActionSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 relative overflow-hidden">
      {/* Indigo glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent pointer-events-none" />

      <main className="relative max-w-7xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Teams Management
          </h2>
          <button
            onClick={() => {
              setShowCreateModal(true);
              setActionError(null);
              setActionSuccess(null);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Team
          </button>
        </div>

        {/* Global Success/Error Messages */}
        {actionSuccess && (
          <div className="backdrop-blur-3xl bg-emerald-900/20 border border-emerald-700/30 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <p className="text-emerald-400">{actionSuccess}</p>
          </div>
        )}

        {actionError && (
          <div className="backdrop-blur-3xl bg-red-900/20 border border-red-700/30 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-400">{actionError}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="backdrop-blur-3xl bg-gray-900/20 border border-gray-700/30 rounded-[2.5rem] p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="mt-4 text-gray-400">Loading teams...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="backdrop-blur-3xl bg-red-900/20 border border-red-700/30 rounded-2xl p-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Teams Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className="backdrop-blur-3xl bg-gray-900/20 border border-gray-700/30 rounded-2xl p-6 hover:border-indigo-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {team.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          team.is_active
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {team.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(team)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-all"
                      title="Edit team"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    {team.is_active && (
                      <button
                        onClick={() => handleDeactivateTeam(team.id)}
                        className="p-2 hover:bg-red-900/20 rounded-lg transition-all"
                        title="Deactivate team"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {team.description || "No description"}
                </p>

                <button
                  onClick={() => openMembersModal(team)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg font-medium transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Manage Members
                </button>
              </div>
            ))}

            {teams.length === 0 && (
              <div className="col-span-full backdrop-blur-3xl bg-gray-900/20 border border-gray-700/30 rounded-2xl p-12 text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  No teams found. Create your first team!
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold">Create New Team</h3>
              <button
                onClick={closeModals}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
              {actionError && (
                <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-red-400">{actionError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., IT Support Team"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows="3"
                  placeholder="Describe the team's responsibilities..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  {actionLoading ? "Creating..." : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold">Edit Team</h3>
              <button
                onClick={closeModals}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTeam} className="p-6 space-y-4">
              {actionError && (
                <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-red-400">{actionError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  {actionLoading ? "Updating..." : "Update Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Management Modal */}
      {showMembersModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold">
                {selectedTeam.name} - Members
              </h3>
              <button
                onClick={closeModals}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Add Member Form */}
              <form
                onSubmit={handleAddMember}
                className="bg-gray-800/50 rounded-xl p-4"
              >
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Add Technician (Enter User ID)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter technician user ID"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-all disabled:opacity-50"
                  >
                    {actionLoading ? "Adding..." : "Add"}
                  </button>
                </div>
              </form>

              {/* Success/Error Messages */}
              {actionError && (
                <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-red-400">{actionError}</p>
                </div>
              )}

              {actionSuccess && (
                <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-3 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <p className="text-emerald-400">{actionSuccess}</p>
                </div>
              )}

              {/* Members List */}
              {actionLoading && teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  <p className="mt-2 text-gray-400">Loading members...</p>
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No members in this team yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Current Members ({teamMembers.length})
                  </h4>
                  {teamMembers.map((member) => (
                    <div
                      key={member.membership_id}
                      className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all"
                    >
                      <div>
                        <p className="font-medium text-white">{member.name}</p>
                        <p className="text-sm text-gray-400">{member.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Role: {member.role} • Joined:{" "}
                          {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="p-2 hover:bg-red-900/20 rounded-lg transition-all"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsManagement;
