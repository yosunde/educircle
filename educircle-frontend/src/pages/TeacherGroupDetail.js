import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import AddMaterialModal from "../components/AddMaterialModal";
import AiFeedbackGenerator from "../components/AiFeatures/AiFeedbackGenerator";

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

const TeacherGroupDetail = ({ theme = "light", toggleTheme }) => {
  const { groupId } = useParams();
  const [marks, setMarks] = useState({});
  const [comment, setComment] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [error, setError] = useState("");
  const [membersError, setMembersError] = useState("");

 
  const existingGrade = materials.length > 0 && materials[0].teacher_grade != null ? materials[0].teacher_grade : null;
  const existingNote = materials.length > 0 && materials[0].teacher_notes ? materials[0].teacher_notes : "";

  const fetchMaterials = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/groups/${groupId}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Materials could not be loaded");
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
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/groups//${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      setMembers(data.members || data);
      // Initialize marks for each member
      const initialMarks = {};
      (data.members || data).forEach(member => {
        initialMarks[member.id] = 0;
      });
      setMarks(initialMarks);
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
    if (existingNote) setComment(existingNote);
    // eslint-disable-next-line
  }, [groupId]);

  const handleMarkChange = (memberId, value) => {
    setMarks(prev => ({ ...prev, [memberId]: value }));
  };

  const handleGiveMark = async () => {
    try {
      const token = localStorage.getItem("token");
      const teacher_grade = Object.values(marks).reduce((a, b) => a + Number(b), 0) / (members.length || 1);

      const response = await fetch(`/api/groups/teacher/${groupId}/grade`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          teacher_grade,
          teacher_notes: comment
        })
      });

      if (!response.ok) throw new Error("Grade could not be saved!");

      fetchMaterials();
      alert("Grade and comment saved!");
    } catch (err) {
      alert(err.message || "An error occurred!");
    }
  };

  return (
    <div>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div style={{ display: "flex" }}>
        <Sidebar role="teacher" theme={theme} />
        <div style={{ flex: 1, background: theme === "dark" ? "#23272f" : "#eaf4e6", minHeight: "100vh", padding: "32px 48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ fontWeight: "bold", fontSize: "2rem" }}>Group Materials</h1>
          </div>
          <hr style={{ margin: "18px 0 32px 0", border: 0, borderTop: "1px solid #b2c2b2" }} />
          <div style={{ display: "flex", gap: 32 }}>
            {/* Materials Grid */}
            <div style={{ flex: 2, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
              {loading ? (
                <div>Loading materials...</div>
              ) : error ? (
                <div style={{ color: "#e74c3c" }}>{error}</div>
              ) : materials.length === 0 ? (
                <div>No materials uploaded yet.</div>
              ) : (
                materials.map((mat, i) => (
                  <div key={mat.id || i} style={{
                    background: "#d6e5d8",
                    borderRadius: 16,
                    padding: 28,
                    minHeight: 120,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    cursor: mat.file_type === "github_link" || mat.file_path ? "pointer" : "default"
                  }}
                    onClick={() => {
                      if (mat.file_type === "github_link" && mat.github_link) {
                        window.open(mat.github_link, "_blank");
                      } else if (mat.file_path) {
                        window.open(mat.file_path, "_blank");
                      }
                    }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{materialIcons[mat.file_type] || "📁"}</div>
                    <div style={{ fontWeight: "bold", marginBottom: 6 }}>{materialLabels[mat.file_type] || mat.file_type}</div>
                    {mat.file_type === "github_link" && mat.github_link ? (
                      <div style={{ fontSize: 14, color: "#6c63ff", wordBreak: "break-all" }}>{mat.github_link}</div>
                    ) : mat.file_path ? (
                      <div style={{ fontSize: 14, color: "#6c63ff" }}>{mat.file_path.split("/").pop()}</div>
                    ) : null}
                    {mat.description && (
                      <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>{mat.description}</div>
                    )}
                  </div>
                ))
              )}
            </div>
            {/* Members List & Marking */}
            <div style={{ flex: 1, background: "#d6e5d8", borderRadius: 16, padding: 28, minWidth: 260, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
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
                  <div key={member.id || i} style={{ display: "flex", alignItems: "center", margin: "8px 0" }}>
                    <div style={{ flex: 1 }}>
                      <div>{member.first_name} {member.last_name}</div>
                      {member.school_number && (
                        <div style={{ fontSize: 13, color: "#666" }}>#{member.school_number}</div>
                      )}
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={marks[member.id] || existingGrade || 0}
                      onChange={e => handleMarkChange(member.id, e.target.value)}
                      style={{
                        width: 48,
                        marginLeft: 8,
                        borderRadius: 6,
                        border: theme === "dark" ? "1px solid #444" : "1px solid #ccc",
                        background: theme === "dark" ? "#2c313a" : "#fff",
                        color: theme === "dark" ? "#f1f1f1" : undefined,
                        padding: "6px"
                      }}
                    />
                  </div>
                ))
              )}
              <div style={{ marginTop: 18 }}>
                <div style={{ fontWeight: 500, marginBottom: 6 }}>Add Comment</div>
                <input
                  type="text"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add Comment"
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    border: theme === "dark" ? "1px solid #444" : "1px solid #ccc",
                    padding: "8px 10px"
                  }}
                />
                
                {/* AI Feedback Generator */}
                <AiFeedbackGenerator 
                  score={Object.values(marks).reduce((a, b) => a + Number(b), 0) / (members.length || 1)}
                  projectName={materials[0]?.project_name || 'Project'}
                  onFeedbackGenerated={(feedback) => setComment(feedback)}
                />
              </div>
              <button
                onClick={handleGiveMark}
                style={{
                  marginTop: 12,
                  background: "#6c63ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 20px",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                {existingGrade != null ? "Update Mark" : "Give Mark"}
              </button>
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

export default TeacherGroupDetail; 