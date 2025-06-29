import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import AiGroupNamer from "../components/AiFeatures/AiGroupNamer";


const StudentProjectGroups = ({ theme = "light", toggleTheme }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);
  const token = localStorage.getItem("token");

  let currentUserId = null;
  if (token) {
    try {
      currentUserId = JSON.parse(atob(token.split('.')[1])).userId;
    } catch (e) { currentUserId = null; }
  }

  console.log("currentUserId", currentUserId, typeof currentUserId);


  const fetchProject = async () => {
    setProjectLoading(true);
    setProjectError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch project details");
      const data = await res.json();
      setProject(data.project || data);
    } catch (err) {
      setProjectError("Project info could not be loaded");
      setProject(null);
    } finally {
      setProjectLoading(false);
    }
  };

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/groups/student/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch groups");
      const data = await res.json();
      const groupArray = data.groups || data;
      const uniqueGroups = groupArray.filter(
        (group, index, self) =>
          index === self.findIndex(g => g.id === group.id)
      );
      setGroups(uniqueGroups);
    } catch (err) {
      setError("Groups could not be loaded");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchGroups();
    // eslint-disable-next-line
  }, [projectId]);

  // Grup oluştur
  const handleCreate = async () => {
    if (!newGroupName.trim()) return;
    try {
      const res = await fetch(`/api/groups/student/project/${projectId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newGroupName })
      });
      if (!res.ok) throw new Error("Group could not be created");
      setShowCreate(false);
      setNewGroupName("");
      fetchGroups();
    } catch (err) {
      alert("Group could not be created!");
    }
  };

  // Gruba katıl
  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    try {
      // groups dizisinde group_code ile eşleşen groupId'yi bul
      const group = groups.find(g => g.group_code === joinCode);
      if (!group) {
        alert("No such group found!");
        return;
      }
      const groupId = group.id;

      const res = await fetch(`/api/groups/student/${groupId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Could not join the group");
      setShowJoin(false);
      setJoinCode("");
      // Katıldığı grubu güncelle
      setGroups(groups.map(g =>
        g.id === groupId ? { ...g, joined: true } : g
      ));
      fetchGroups();
    } catch (err) {
      alert("Could not join the group!");
    }
  };


  return (
    <div>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div style={{ display: "flex" }}>
        <Sidebar role="student" theme={theme} />
        <div
          style={{
            flex: 1,
            background: theme === "dark" ? "#23272f" : "#eaf4e6",
            color: theme === "dark" ? "#f1f1f1" : "#23272f",
            minHeight: "100vh",
            padding: "32px 48px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ fontWeight: "bold", fontSize: "2.2rem" }}>GROUPS</h1>
            <div>
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  background: "#fff",
                  color: "#4caf50",
                  border: "none",
                  borderRadius: 20,
                  padding: "10px 24px",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  marginRight: 12,
                  cursor: "pointer"
                }}
              >+ Create New Group</button>
            </div>
          </div>

          {/* Proje Bilgisi */}
          <div style={{
            background: theme === "dark" ? "#2c313a" : "#d6e5d8",
            color: theme === "dark" ? "#f1f1f1" : "#23272f",
            borderRadius: 16,
            padding: 24,
            margin: "32px 0 24px 0",
            fontSize: "1.1rem"
          }}>
            {projectLoading ? (
              <div>Loading project info...</div>
            ) : projectError ? (
              <div style={{ color: "#e74c3c" }}>{projectError}</div>
            ) : project ? (
              <>
                <b>{project.name}</b><br />
                {project.description && <><span style={{ color: '#888' }}>{project.description}</span><br /></>}
                Course: {project.course_name || project.course || '-'}<br />
                Teacher: {project.teacher_name || '-'}<br />
                Numbers of Students: {project.student_count || project.students || '-'}<br />
                Date of Start: {project.start_date ? new Date(project.start_date).toLocaleDateString() : (project.start || '-') }<br />
                Status: <span style={{ fontWeight: 'bold', color: project.is_active ? '#27ae60' : '#c0392b' }}>{project.is_active ? 'Active' : 'Inactive'}</span><br />
                {project.info && <div style={{ marginTop: 8 }}>{project.info}</div>}
              </>
            ) : null}
          </div>

          {loading ? (
            <div style={{ color: theme === "dark" ? "#fff" : "#333", textAlign: "center", marginTop: 40 }}>Loading groups...</div>
          ) : error ? (
            <div style={{ color: "#e74c3c", textAlign: "center", marginTop: 40 }}>{error}</div>
          ) : (
            <div style={{ display: "flex", gap: 32 }}>
              {groups.map(group => (
                <div
                  key={group.id}
                  style={{
                    background: theme === "dark" ? "#2c313a" : "#fff",
                    color: theme === "dark" ? "#f1f1f1" : "#23272f",
                    borderRadius: 16,
                    padding: 24,
                    minWidth: 240,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: group.joined ? "pointer" : "default",
                    opacity: group.joined ? 1 : 0.7
                  }}
                  onClick={() => group.joined && navigate(`/groups/${group.id}/student-detail`)}
                >
                  <div style={{ fontWeight: "bold", fontSize: "1.1rem", marginBottom: 8 }}>{group.name}</div>
                  {Number(group.creator_id) === Number(currentUserId) && group.group_code && (
                    <div style={{ fontSize: "0.95rem", margin: "4px 0" }}>Group Code: <b>#{group.group_code}</b></div>
                  )}
                  <div style={{ fontSize: "0.95rem", margin: "4px 0" }}>Numbers of Members: {group.member_count || group.members || 0}</div>
                  <div style={{ fontSize: "0.95rem", margin: "4px 0" }}>Date of Start: {group.start || "-"}</div>
                  <div style={{ fontSize: "0.95rem", margin: "4px 0" }}>Status: {group.status}</div>
                  {group.teacher_grade !== null && group.teacher_grade !== undefined && (
                    <div style={{ margin: "8px 0", color: "#6c63ff", fontWeight: "bold" }}>
                      Mark: {group.teacher_grade}
                    </div>
                  )}
                  {group.teacher_notes && (
                    <div style={{ margin: "4px 0", color: "#888" }}>
                      Teacher's note: {group.teacher_notes}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    {group.joined ? (
                      <span style={{
                        background: "#e0e0e0",
                        color: "#4caf50",
                        borderRadius: 12,
                        padding: "6px 18px",
                        fontWeight: "bold",
                        fontSize: "1rem"
                      }}>You are in this group</span>
                    ) : (
                      <button style={{
                        background: "#e0e0e0",
                        color: "#4caf50",
                        border: "none",
                        borderRadius: 12,
                        padding: "6px 18px",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        cursor: "pointer"
                      }} onClick={e => { e.stopPropagation(); setShowJoin(true); }}>
                        + Join
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Modal */}
          {showCreate && (
            <div style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
              background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 1000,
            }}>
              <div style={{
                background: theme === "dark" ? "#2c313a" : "#eaf4e6",
                color: theme === "dark" ? "#f1f1f1" : "#23272f",
                borderRadius: 16, padding: "32px 24px",
                minWidth: "400px", boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
                display: "flex", flexDirection: "column", gap: "16px"
              }}>
                <h3 style={{ margin: 0 }}>Create New Group</h3>
                <input
                  type="text"
                  placeholder="Please enter the group name"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: theme === "dark" ? "1px solid #444" : "1px solid #ccc"
                  }}
                />
                
                {/* AI Group Namer */}
                <AiGroupNamer 
                  projectName={project?.name || ''}
                  projectDescription={project?.description || ''}
                  onNameGenerated={(name) => setNewGroupName(name)}
                />
                
                <button
                  onClick={handleCreate}
                  style={{
                    background: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 24px",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    marginTop: 8,
                    cursor: "pointer"
                  }}
                >Enter</button>
                <button
                  onClick={() => setShowCreate(false)}
                  style={{
                    background: "#fff",
                    color: "#e74c3c",
                    border: "1px solid #e74c3c",
                    borderRadius: 8,
                    padding: "8px 20px",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    marginTop: 4,
                    cursor: "pointer"
                  }}
                >Cancel</button>
              </div>
            </div>
          )}

          {/* Join Modal */}
          {showJoin && (
            <div style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
              background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 1000,
            }}>
              <div style={{
                background: theme === "dark" ? "#2c313a" : "#eaf4e6",
                color: theme === "dark" ? "#f1f1f1" : "#23272f",
                borderRadius: 16, padding: "32px 24px",
                minWidth: "350px", boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
                display: "flex", flexDirection: "column", gap: "16px"
              }}>
                <h3 style={{ margin: 0 }}>Join New Group</h3>
                <input
                  type="text"
                  placeholder="Please enter the group code"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: theme === "dark" ? "1px solid #444" : "1px solid #ccc"
                  }}
                />
                <button
                  onClick={handleJoin}
                  style={{
                    background: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 24px",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    marginTop: 8,
                    cursor: "pointer"
                  }}
                >Enter</button>
                <button
                  onClick={() => setShowJoin(false)}
                  style={{
                    background: "#fff",
                    color: "#e74c3c",
                    border: "1px solid #e74c3c",
                    borderRadius: 8,
                    padding: "8px 20px",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    marginTop: 4,
                    cursor: "pointer"
                  }}
                >Cancel</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StudentProjectGroups;
