import React, { useState, useEffect } from 'react';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import { useNavigate } from 'react-router-dom';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();

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
    if (!token) {
      setError("You need to be logged in.");
      setLoading(false);
      return;
    }

    fetch('/api/courses/student', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch courses');
      return res.json();
    })
    .then(data => {
      setCourses(data.courses || []);
      setLoading(false);
    })
    .catch(err => {
      setError('Could not load courses.');
      setLoading(false);
    });
  }, []);

  const handleJoinCourse = () => {
    if (!courseCode.trim()) return;
    setLoading(true);
    setError('');
    const token = localStorage.getItem("token");

    fetch('/api/courses/student/join', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ course_code: courseCode })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.error || 'Failed to join course') });
      }
      return res.json();
    })
    .then(data => {
      console.log('Kursa katıldıktan sonra gelen API cevabı:', data);
      
      
      fetch('/api/courses/student', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => res.json())
      .then(updatedData => setCourses(updatedData.courses || []));

      setShowJoinModal(false);
      setCourseCode('');
      setLoading(false);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div style={{ display: 'flex' }}>
        <Sidebar role="student" />
        <div style={{ flex: 1 }}>
          <div style={{ 
            background: theme === 'dark' ? '#2c2a4a' : '#e6f0e6', 
            minHeight: "100vh", 
            padding: "32px",
            transition: 'background-color 0.3s'
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: '16px', borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #dce1dd'}}>
              <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", margin: 0, color: theme === 'dark' ? '#fff' : '#333' }}>Courses</h1>
              <button
                style={{ padding: "10px 20px", borderRadius: "8px", background: theme === 'dark' ? '#2a2a2a' : '#fff', border: theme === 'dark' ? '1px solid #444' : '1px solid #ccc', color: theme === 'dark' ? '#fff' : '#333', cursor: 'pointer' }}
                onClick={() => setShowJoinModal(true)}
              >
                + Join New Course
              </button>
            </div>

            {error && <div style={{ color: "red", margin: "12px 0" }}>{error}</div>}
            {loading && <div style={{ color: theme === 'dark' ? '#aaa' : "#888", margin: "12px 0" }}>Loading...</div>}

            <div style={{ margin: "24px 0", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search your courses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: "10px", borderRadius: "8px", border: theme === 'dark' ? '1px solid #444' : '1px solid #ccc', width: "350px", background: theme === 'dark' ? '#2a2a2a' : '#fff', color: theme === 'dark' ? '#fff' : '#333' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {filteredCourses.map(course => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/student/${course.id}/projects`)}
                  style={{
                    background: theme === 'dark' ? '#1e1e1e' : "#fff",
                    color: theme === 'dark' ? '#e0e0e0' : '#333',
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: theme === 'dark' ? '1px solid #333' : '1px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "8px", fontSize: '1.1rem' }}>{course.name}</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '12px', lineHeight: '1.6' }}>
                    <div><strong>Start Date:</strong> {new Date(course.created_at).toLocaleDateString()}</div>
                    <div><strong>Status:</strong> <span style={{ fontWeight: 'bold', color: course.is_active ? '#27ae60' : '#c0392b' }}>{course.is_active ? 'Active' : 'Inactive'}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {showJoinModal && (
              <div style={{
                position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center",
                justifyContent: "center", zIndex: 1000,
              }}>
                <div style={{
                  background: theme === 'dark' ? '#2a2a2a' : "#f4f7f6", 
                  color: theme === 'dark' ? '#e0e0e0' : '#333',
                  borderRadius: "16px", padding: "32px 24px",
                  minWidth: "350px", boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
                  display: "flex", flexDirection: "column", gap: "16px"
                }}>
                  <h3 style={{ margin: 0 }}>Join New Course</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label htmlFor="course-code">Please enter the course code</label>
                    <input
                      id="course-code"
                      type="text"
                      placeholder="Value"
                      value={courseCode}
                      onChange={e => setCourseCode(e.target.value)}
                      style={{ padding: "10px", borderRadius: "8px", border: theme === 'dark' ? '1px solid #444' : "1px solid #ccc", background: theme === 'dark' ? '#1e1e1e' : '#fff', color: theme === 'dark' ? '#fff' : '#333' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                    <button onClick={() => setShowJoinModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', background: theme === 'dark' ? '#3a3a3a' : '#fff', border: theme === 'dark' ? '1px solid #555' : '1px solid #ccc', color: theme === 'dark' ? '#fff' : '#333', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button onClick={handleJoinCourse} style={{ padding: '8px 16px', borderRadius: '8px', background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      Enter
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

export default StudentCourses; 