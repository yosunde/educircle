import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";

const TeacherProjectGroups = ({ theme = "light", toggleTheme }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [marks, setMarks] = useState({});
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);
  const token = localStorage.getItem("token");


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
      setProjectError("Proje bilgisi yüklenemedi");
      setProject(null);
    } finally {
      setProjectLoading(false);
    }
  };

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/groups/teacher/project/${projectId}`, {
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
      setError("Gruplar yüklenemedi");
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

  const openMarkModal = async (group) => {
    setSelectedGroup(group);
    setLoadingMembers(true);
    setShowMarkModal(true);
    try {
      const res = await fetch(`/api/groups/teacher/${group.id}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      setMembers(data.members || data);
      setMarks((data.members || data).reduce(
        (acc, m) => ({ ...acc, [`${m.first_name} ${m.last_name}`]: 0 }),
        {}
      ));
    } catch (err) {
      setMembers([]);
      setMarks({});
    } finally {
      setLoadingMembers(false);
    }
  };

 
  const handleSaveMarks = async () => {
    if (!selectedGroup) return;
    const grade = Object.values(marks).reduce((a, b) => a + Number(b), 0) / (members.length || 1);
    await fetch(`/api/groups/teacher/${selectedGroup.id}/grade`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ grade })
    });
    setShowMarkModal(false);
    setSelectedGroup(null);
    setMarks({});
    setMembers([]);
    fetchGroups();
  };

  // Grubu kapat
  const handleCloseGroup = async (groupId) => {
    await fetch(`/api/groups/teacher/${groupId}/close`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchGroups();
  };

  // Modal kapat
  const closeMarkModal = () => {
    setShowMarkModal(false);
    setSelectedGroup(null);
    setMarks({});
    setMembers([]);
  };

  return (
    <div>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div style={{ display: "flex" }}>
        <Sidebar role="teacher" theme={theme} />
        <div style={{
          flex: 1,
          background: theme === "dark" ? "#23272f" : "#eaf4e6",
          minHeight: "100vh",
          padding: "32px 48px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ fontWeight: "bold", fontSize: "2.2rem" }}>GROUPS</h1>
            <div>
              <input
                type="text"
                placeholder="Search"
                style={{
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: 20,
                  padding: "10px 24px",
                  fontSize: "1rem",
                  marginRight: 12
                }}
              />
            </div>
          </div>

          {/* Proje Bilgisi */}
          <div style={{
            background: theme === "dark" ? "#2c313a" : "#d6e5d8",
            color: theme === "dark" ? "#f1f1f1" : undefined,
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
                    color: theme === "dark" ? "#f1f1f1" : undefined,
                    borderRadius: 16,
                    padding: 24,
                    minWidth: 240,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer"
                  }}
                  onClick={() => navigate(`/groups/${group.id}/teacher-detail`)}
                >
                  <div style={{ fontWeight: "bold", fontSize: "1.1rem", marginBottom: 8 }}>{group.name}</div>
                  {group.group_code && <div style={{ fontSize: "0.95rem", margin: "4px 0" }}>Group Code: <b>#{group.group_code}</b></div>}
                  <div style={{ fontSize: "0.95rem", margin: "4px 0" }}>Numbers of Members: {group.member_count || (group.members ? group.members.length : 0)}</div>
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
                    {group.teacher_grade == null ? (
                      <button
                        style={{
                          background: "#6c63ff",
                          color: "#fff",
                          border: "none",
                          borderRadius: 12,
                          padding: "6px 18px",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          cursor: "pointer"
                        }}
                        onClick={e => { e.stopPropagation(); openMarkModal(group); }}
                      >
                        Give Mark
                      </button>
                    ) : (
                      <button
                        style={{
                          background: "#6c63ff",
                          color: "#fff",
                          border: "none",
                          borderRadius: 12,
                          padding: "6px 18px",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          cursor: "pointer"
                        }}
                        onClick={e => { e.stopPropagation(); openMarkModal(group); }}
                      >
                        Update Mark
                      </button>
                    )}
                    {group.status === "Active" && (
                      <button style={{
                        background: "#f8bcbc",
                        color: "#c0392b",
                        border: "none",
                        borderRadius: 12,
                        padding: "6px 18px",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        cursor: "pointer"
                      }} onClick={e => { e.stopPropagation(); handleCloseGroup(group.id); }}>
                        Close
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Give Mark Modal */}
          {showMarkModal && selectedGroup && (
            <div style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
              background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 1000,
            }}>
              <div style={{
                background: theme === "dark" ? "#23272f" : "#eaf4e6",
                color: theme === "dark" ? "#f1f1f1" : undefined,
                borderRadius: 16, padding: "32px 24px",
                minWidth: "350px", boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
                display: "flex", flexDirection: "column", gap: "16px"
              }}>
                <h3 style={{ margin: 0 }}>Group Members</h3>
                {loadingMembers ? (
                  <div>Loading members...</div>
                ) : (
                  members.map(member => (
                    <div key={member.id || member.name || member.fullName || member.username} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ flex: 1 }}>
                        {(member.first_name || "") + " " + (member.last_name || "")}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={marks[`${member.first_name} ${member.last_name}`]}
                        onChange={e => setMarks({ ...marks, [`${member.first_name} ${member.last_name}`]: e.target.value })}
                        style={{
                          width: 60,
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
                <button
                  onClick={handleSaveMarks}
                  style={{
                    background: "#6c63ff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 24px",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    marginTop: 8,
                    cursor: "pointer"
                  }}
                >Save</button>
                <button
                  onClick={closeMarkModal}
                  style={{
                    background: "#fff",
                    color: "#6c63ff",
                    border: "1px solid #6c63ff",
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

export default TeacherProjectGroups;
