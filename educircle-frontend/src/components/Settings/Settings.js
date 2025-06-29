import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Layout/Navbar";
import Sidebar from "../Layout/Sidebar";
import styles from "../Layout/Layout.module.css"; 
import "./Settings.css";

const Settings = ({ userRole, theme, toggleTheme }) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    school_number: "",
    email: "",
    password: "",
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const user = res.data.user || res.data;
        setForm({
          ...form,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          school_number: user.school_number || "",
          email: user.email || "",
        });
        setLoading(false);
      });
    if (userRole === "teacher") {
      axios.get("/api/courses/teacher", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setCourses(res.data));
    }
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    axios.put("/api/users/me", form, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => alert('Profile updated!'));
  };

  const handlePasswordChange = () => {
    axios.put("/api/users/me/password", passwords, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => alert('Password changed!'))
      .catch(err => alert(err.response?.data?.error || 'Password could not be changed!'));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={theme === "dark" ? "settings-dark-bg" : ""} style={{ background: theme === "dark" ? "#23272f" : "#eaf4e6", minHeight: "100vh" }}>
      <Navbar userName={form.first_name + " " + form.last_name} theme={theme} toggleTheme={toggleTheme} />
      <div style={{ display: "flex" }}>
        <Sidebar role={userRole} theme={theme} />
        <div style={{ flex: 1 }}>
          <div className={`settings-outer-container${theme === "dark" ? " settings-dark-container" : ""}`}>
            <h2 className="settings-title">Settings</h2>
            <form className="settings-form">
              <div className="settings-form-group">
                <label>Name</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} />
              </div>
              <div className="settings-form-group">
                <label>Last Name</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} />
              </div>
              {userRole === "student" && (
                <div className="settings-form-group">
                  <label>School Number</label>
                  <input name="school_number" value={form.school_number} onChange={handleChange} />
                </div>
              )}
              <div className="settings-form-group">
                <label>Email</label>
                <input name="email" value={form.email} onChange={handleChange} />
              </div>
              {userRole === "teacher" && (
                <div className="settings-form-group">
                  <label>Courses</label>
                  <ul className="settings-courses-list">
                    {(Array.isArray(courses) ? courses : []).map(course => (
                      <li key={course._id}>{course.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="settings-form-group">
                <label>Old Password</label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type={showOldPassword ? "text" : "password"}
                    name="old_password"
                    value={passwords.old_password}
                    onChange={e => setPasswords({ ...passwords, old_password: e.target.value })}
                    placeholder="Old password"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(prev => !prev)}
                    className={`show-password-btn${theme === "dark" ? " show-password-btn-dark" : ""}`}
                    style={{
                      marginLeft: 8,
                      padding: "7px 14px",
                      fontSize: "1.1rem",
                      border: "none",
                      borderRadius: "6px",
                      background: theme === "dark" ? "#4caf50" : "#90caf9",
                      color: theme === "dark" ? "#fff" : "#23272f",
                      cursor: "pointer",
                      transition: "background 0.2s, color 0.2s"
                    }}
                  >
                    {showOldPassword ? "🙈 Hide" : "👁️ Show"}
                  </button>
                </div>
              </div>
              <div className="settings-form-group">
                <label>New Password</label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="new_password"
                    value={passwords.new_password}
                    onChange={e => setPasswords({ ...passwords, new_password: e.target.value })}
                    placeholder="New password"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(prev => !prev)}
                    className={`show-password-btn${theme === "dark" ? " show-password-btn-dark" : ""}`}
                    style={{
                      marginLeft: 8,
                      padding: "7px 14px",
                      fontSize: "1.1rem",
                      border: "none",
                      borderRadius: "6px",
                      background: theme === "dark" ? "#4caf50" : "#90caf9",
                      color: theme === "dark" ? "#fff" : "#23272f",
                      cursor: "pointer",
                      transition: "background 0.2s, color 0.2s"
                    }}
                  >
                    {showNewPassword ? "🙈 Hide" : "👁️ Show"}
                  </button>
                </div>
              </div>
              <div className="settings-form-buttons">
                <button type="button" onClick={handlePasswordChange}>Change Password</button>
                <button type="button" onClick={handleSave}>Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
