import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import AddMaterialModal from "../components/AddMaterialModal";

const materialIcons = {
  project_report: "📄",
  code_docs: "📎",
  presentation_video: "🎥",
  project_schedule: "⏰",
  github_link: "🐙",
  project_photos: "📷"
};

const materialLabels = {
  project_report: "Project Report",
  code_docs: "Code Docs",
  presentation_video: "Presentation Video",
  project_schedule: "Project Schedule",
  github_link: "GitHub/GitLab Link",
  project_photos: "Photos of the Project"
};

const StudentGroupDetail = ({ theme = "light", toggleTheme }) => {
  const { groupId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [error, setError] = useState("");
  const [membersError, setMembersError] = useState("");
  const token = localStorage.getItem("token");
  let currentUserId = null;
  if (token) {
    try {
      currentUserId = JSON.parse(atob(token.split('.')[1])).userId;
    } catch (e) { currentUserId = null; }
  }

  const fetchMaterials = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/groups/${groupId}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch materials");
      const data = await res.json();
      setMaterials(data.documents || data);
    } catch (err) {
      setError("Materials could not be loaded");
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    setMembersLoading(true);
    setMembersError("");
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      setMembers(data.members || data);
    } catch (err) {
      setMembersError("Members could not be loaded");
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchMembers();
    // eslint-disable-next-line
  }, [groupId]);

  
  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await fetch(`/api/groups/${groupId}/documents/${materialId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMaterials();
    } catch (err) {
      alert("Document could not be deleted.");
    }
  };

  return (
    <div>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div style={{ display: "flex" }}>
        <Sidebar role="student" theme={theme} />
        <div style={{ flex: 1, background: theme === "dark" ? "#23272f" : "#eaf4e6", minHeight: "100vh", padding: "32px 48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ fontWeight: "bold", fontSize: "2rem" }}>Group Materials</h1>
            <button style={{ background: "#fff", color: "#4caf50", border: "none", borderRadius: 20, padding: "10px 24px", fontWeight: "bold", fontSize: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", cursor: "pointer" }} onClick={() => setShowModal(true)}>+ Add New Material</button>
          </div>
          <hr style={{ margin: "18px 0 32px 0", border: 0, borderTop: "1px solid #b2c2b2" }} />
          <div style={{ display: "flex", gap: 32 }}>
            <div style={{ flex: 2, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
              {loading ? (
                <div style={{ color: theme === "dark" ? "#fff" : "#333" }}>Loading materials...</div>
              ) : error ? (
                <div style={{ color: "#e74c3c" }}>{error}</div>
              ) : materials.length === 0 ? (
                <div style={{ color: theme === "dark" ? "#fff" : "#333" }}>No materials found.</div>
              ) : (
                materials.map((material, i) => (
                  <div key={material.id || i} style={{
                    background: theme === "dark" ? "#2c313a" : "#fff",
                    color: theme === "dark" ? "#f1f1f1" : "#23272f",
                    borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    display: "flex", flexDirection: "column", gap: 12
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1.5rem" }}>{materialIcons[material.file_type] || "📄"}</span>
                      <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                        {materialLabels[material.file_type] || material.file_type}
                      </div>
                    </div>
                    
                    {material.description && (
                      <div style={{ fontSize: 15, color: "#666" }}>{material.description}</div>
                    )}
                    
                    {material.file_name && (
                      <div style={{ fontSize: 14, color: "#888" }}>File: {material.file_name}</div>
                    )}
                    
                    {material.github_link && (
                      <div style={{ fontSize: 14, color: "#888" }}>Link: {material.github_link}</div>
                    )}
                    
                    <div style={{ fontSize: 14, color: "#888" }}>
                      Uploaded: {material.upload_date ? new Date(material.upload_date).toLocaleDateString() : "Unknown"}
                    </div>
                    
                    {/* Delete button for group members */}
                    {material.uploader_id === currentUserId && (
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        style={{
                          background: "#e74c3c",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          padding: "6px 12px",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          marginTop: "auto"
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            {/* Members List */}
            <div style={{ flex: 1, background: "#d6e5d8", borderRadius: 16, padding: 28, minWidth: 220, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ fontWeight: "bold", fontSize: "1.1rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span role="img" aria-label="members">👥</span> Group Members
              </div>
              {membersLoading ? (
                <div>Loading members...</div>
              ) : membersError ? (
                <div style={{ color: "#e74c3c" }}>{membersError}</div>
              ) : members.length === 0 ? (
                <div>No members found.</div>
              ) : (
                members.map((member, i) => (
                  <div key={member.id || i} style={{ fontSize: 15, margin: "6px 0" }}>
                    {member.first_name} {member.last_name}
                    {member.school_number && (
                      <div style={{ fontSize: 13, color: "#666" }}>#{member.school_number}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          <AddMaterialModal
            open={showModal}
            onClose={() => setShowModal(false)}
            groupId={groupId}
            onMaterialAdded={fetchMaterials}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentGroupDetail; 