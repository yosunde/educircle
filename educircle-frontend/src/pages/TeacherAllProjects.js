import React, { useState, useEffect } from "react";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import { useNavigate } from "react-router-dom";

const TeacherAllProjects = ({ theme = "light", toggleTheme }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/projects/teacher", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Projects could not be loaded");
        const data = await res.json();
        setProjects(data.projects || data);
      } catch (err) {
        setError("Projects could not be loaded");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div style={{ display: "flex" }}>
        <Sidebar role="teacher" theme={theme} />
        <div style={{ flex: 1, background: theme === "dark" ? "#23272f" : "#eaf4e6", minHeight: "100vh", padding: "32px 48px" }}>
          <h1 style={{ fontWeight: "bold", fontSize: "2rem", marginBottom: 32 }}>All Projects</h1>
          {loading ? (
            <div style={{ color: theme === "dark" ? "#fff" : "#333" }}>Loading projects...</div>
          ) : error ? (
            <div style={{ color: "#e74c3c" }}>{error}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {projects.map(project => (
                <div key={project.id} style={{
                  background: "#d6e5d8",
                  borderRadius: 16,
                  padding: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  cursor: "pointer"
                }} onClick={() => navigate(`/projects/${project.id}/groups/teacher`)}>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{project.name}</div>
                    <div style={{ fontSize: 15, color: "#555" }}>Course: {project.course_name}</div>
                  </div>
                  <div style={{ fontWeight: 500, color: project.is_active ? "#27ae60" : "#c0392b" }}>{project.is_active ? "Active" : "Closed"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAllProjects; 