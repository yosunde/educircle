import React, { useState, useEffect } from "react";
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import { Link } from 'react-router-dom';


const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', description: '' });

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  useEffect(() => {
    
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

 
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");

    console.log('Frontendden gönderilen token:', token);

    if (!token) {
      setError("You need to sign in.");
      setLoading(false);
      return;
    }
    fetch("/api/courses/teacher", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch courses");
        return res.json();
      })
      .then(data => {
        console.log("API response:", data);
        setCourses(data.courses);
        setLoading(false);
      })
      .catch(err => {
        setError("Courses could not be loaded.");
        setLoading(false);
      });
  }, []);

  const handleAddCourse = () => {
    if (newCourseName.trim() === "") return;
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You need to sign in.");
      setLoading(false);
      return;
    }
    fetch("/api/courses/teacher", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: newCourseName })
    })
      .then(res => {
        if (!res.ok) throw new Error("Kurs eklenemedi");
        return res.json();
      })
      .then(response => {
        setCourses([response.course, ...courses]);
        setShowModal(false);
        setNewCourseName("");
        setLoading(false);
      })
      .catch(() => {
        setError("Course could not be added.");
        setLoading(false);
      });
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setEditFormData({ name: course.name, description: course.description || '' });
    setShowEditModal(true);
  };

  const handleUpdateCourse = () => {
    if (!editingCourse) return;
    setLoading(true);
    const token = localStorage.getItem("token");

    fetch(`/api/courses/teacher/${editingCourse.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editFormData)
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update course');
      return res.json();
    })
    .then(response => {
      const updatedCourse = response.course;
      setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      setShowEditModal(false);
      setEditingCourse(null);
      setLoading(false);
    })
    .catch(err => {
      setError('Course could not be updated.');
      setLoading(false);
    });
  };

  const handleCloseCourse = (courseId) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    fetch(`/api/courses/teacher/${courseId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_active: false })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to close course');
      return res.json();
    })
    .then(response => {
      const updatedCourse = response.course;
      setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      setLoading(false);
    })
    .catch(err => {
      setError('Course could not be closed.');
      setLoading(false);
    });
  };

  return (
    <div>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div style={{ display: "flex" }}>
        <Sidebar role="teacher" />
        <div style={{ flex: 1 }}>
          <div style={{ 
            background: theme === 'dark' ? '#2c2a4a' : '#e6f0e6', 
            minHeight: "100vh", 
            padding: "32px" 
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", margin: 0 }}>Courses</h1>
              <button
                style={{ padding: "8px 16px", borderRadius: "8px", background: "#fff", border: "1px solid #ccc" }}
                onClick={() => setShowModal(true)}
              >
                + Add New Course
              </button>
            </div>
            {error && <div style={{ color: "red", margin: "12px 0" }}>{error}</div>}
            {loading && <div style={{ color: "#888", margin: "12px 0" }}>Loading...</div>}
            <div style={{ margin: "24px 0", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc", width: "300px" }}
              />
            </div>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {courses
                .filter(course => course.name.toLowerCase().includes(search.toLowerCase()))
                .map(course => (
                  <Link to={`/courses/teacher/projects/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div
                      key={course.id}
                      style={{
                        background: "#fff",
                        borderRadius: "16px",
                        padding: "24px",
                        minWidth: "250px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                      }}
                    >
                      <div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenEditModal(course);
                          }}
                          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
                        >
                          ✏️
                        </button>
                        <div style={{ fontWeight: "bold", marginBottom: "8px", fontSize: '1.1rem' }}>{course.name}</div>
                        <p style={{ fontSize: '0.9rem', color: '#555', borderTop: '1px solid #eee', paddingTop: '8px', margin: '8px 0' }}>
                          {course.description || 'No description provided.'}
                        </p>
                        <div style={{ fontSize: '0.85rem', color: '#333', marginTop: '12px', lineHeight: '1.6' }}>
                          <div><strong>Code:</strong> {course.course_code}</div>
                          <div><strong>Status:</strong> <span style={{ fontWeight: 'bold', color: course.is_active ? '#27ae60' : '#c0392b' }}>{course.is_active ? 'Active' : 'Inactive'}</span></div>
                          <div><strong>Created:</strong> {new Date(course.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      {course.is_active && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCloseCourse(course.id);
                          }}
                          style={{ marginTop: "16px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", alignSelf: "flex-start", cursor: 'pointer' }}
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </Link>
                ))}
              {}
              {courses && [...Array(Math.max(0, 4 - courses.length))].map((_, i) => (
                <div
                  key={`empty-${i}`}
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "24px",
                    minWidth: "250px",
                    minHeight: "180px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#bbb",
                    fontSize: "24px",
                  }}
                >
                  <span>＋</span>
                </div>
              ))}
            </div>
            {}
            {showModal && (
              <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}>
                <div style={{
                  background: "#e6f0e6",
                  borderRadius: "16px",
                  padding: "32px 24px",
                  minWidth: "320px",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  <h3 style={{ margin: 0 }}>Add New Course</h3>
                  <input
                    type="text"
                    placeholder="Course Name"
                    value={newCourseName}
                    onChange={e => setNewCourseName(e.target.value)}
                    style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <button
                      onClick={() => setShowModal(false)}
                      style={{ padding: "8px 16px", borderRadius: "8px", background: "#fff", border: "1px solid #ccc" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCourse}
                      style={{ padding: "8px 16px", borderRadius: "8px", background: "#e74c3c", color: "#fff", border: "none" }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
            {}
            {showEditModal && editingCourse && (
              <div style={{
                position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center",
                justifyContent: "center", zIndex: 1000,
              }}>
                <div style={{
                  background: "#fff", borderRadius: "16px", padding: "32px 24px",
                  minWidth: "400px", boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
                  display: "flex", flexDirection: "column", gap: "16px"
                }}>
                  <h3 style={{ margin: 0 }}>Edit Course</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label htmlFor="edit-course-name">Course Name</label>
                    <input
                      id="edit-course-name"
                      type="text"
                      value={editFormData.name}
                      onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                      style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label htmlFor="edit-course-desc">Description</label>
                    <textarea
                      id="edit-course-desc"
                      rows="4"
                      value={editFormData.description}
                      onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                      style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc", resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                    <button
                      onClick={() => setShowEditModal(false)}
                      style={{ padding: "8px 16px", borderRadius: "8px", background: "#fff", border: "1px solid #ccc" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateCourse}
                      style={{ padding: "8px 16px", borderRadius: "8px", background: "#3498db", color: "#fff", border: "none" }}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCourses;
