import React, { useState, useEffect } from "react";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import { useNavigate } from "react-router-dom";

const TeacherAllGroups = ({ theme = "light", toggleTheme }) => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/groups/teacher/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Groups could not be loaded");
        const data = await res.json();
        const groupArray = data.groups || data;
        const uniqueGroups = groupArray.filter(
          (group, index, self) =>
            index === self.findIndex(g => g.group_id === group.group_id)
        );
        setGroups(uniqueGroups);
      } catch (err) {
        setError("Groups could not be loaded");
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  return (
    <div>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div style={{ display: "flex" }}>
        <Sidebar role="teacher" theme={theme} />
        <div style={{ flex: 1, background: theme === "dark" ? "#23272f" : "#eaf4e6", minHeight: "100vh", padding: "32px 48px" }}>
          <h1 style={{ fontWeight: "bold", fontSize: "2rem", marginBottom: 32 }}>All Groups</h1>
          {loading ? (
            <div style={{ color: theme === "dark" ? "#fff" : "#333" }}>Loading groups...</div>
          ) : error ? (
            <div style={{ color: "#e74c3c" }}>{error}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {groups.map(group => (
                <div key={group.group_id} style={{
                  background: "#d6e5d8",
                  borderRadius: 16,
                  padding: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  cursor: "pointer"
                }} onClick={() => navigate(`/groups/${group.group_id}/teacher-detail`)}>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{group.group_name}</div>
                    <div style={{ fontSize: 15, color: "#555" }}>Project: {group.project_name}</div>
                    <div style={{ fontSize: 15, color: "#555" }}>Course: {group.course_name}</div>
                    {group.teacher_grade !== null && group.teacher_grade !== undefined && (
                      <div style={{ marginTop: 8, color: "#6c63ff", fontWeight: "bold" }}>Mark: {group.teacher_grade}</div>
                    )}
                    {group.teacher_notes && (
                      <div style={{ marginTop: 4, color: "#888", fontSize: 14 }}>Notes: {group.teacher_notes}</div>
                    )}
                  </div>
                  <div style={{ fontWeight: 500, color: group.project_is_active ? "#27ae60" : "#c0392b" }}>{group.project_is_active ? "Active" : "Closed"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAllGroups; 