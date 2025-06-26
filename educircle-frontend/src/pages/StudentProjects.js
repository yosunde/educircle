import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';

const StudentProjects = () => {
  const { courseId } = useParams();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [projectCode, setProjectCode] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinError, setJoinError] = useState('');

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

  
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      
      setProjects(Array.isArray(data) ? data : (data.projects || data.data || []));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
      
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [courseId]);

  
  const filteredProjects = (Array.isArray(projects) ? projects : []).filter(project =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  
  const handleJoinProject = async () => {
    if (!projectCode.trim()) return;
    
    try {
      setJoinError('');
      const token = localStorage.getItem('token');
      const response = await fetch('/api/projects/join', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_code: projectCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join project');
      }

      
      await fetchProjects();
      setShowJoinModal(false);
      setProjectCode('');
    } catch (err) {
      setJoinError(err.message);
      console.error('Error joining project:', err);
    }
  };

  if (loading) {
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ color: theme === 'dark' ? '#fff' : '#333' }}>Loading projects...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ color: '#e74c3c' }}>Error: {error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", margin: 0, color: theme === 'dark' ? '#fff' : '#333' }}>Projects</h1>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: theme === 'dark' ? '#2a2a2a' : '#fff', border: theme === 'dark' ? '1px solid #444' : '1px solid #ccc', borderRadius: '8px', padding: '4px 12px' }}>
                  <span style={{ marginRight: 8 }}>☰</span>
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      color: theme === 'dark' ? '#fff' : '#333',
                      fontSize: '1rem',
                      width: 120
                    }}
                  />
                  <span style={{ marginLeft: 8 }}>🔍</span>
                </div>
                <button
                  style={{ padding: "8px 16px", borderRadius: "8px", background: "#fff", border: "1px solid #ccc", fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => setShowJoinModal(true)}
                >
                  + Join New Project
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
              {filteredProjects.map(project => (
                <div key={project.id} style={{
                  background: theme === 'dark' ? '#1e1e1e' : "#fff",
                  color: theme === 'dark' ? '#e0e0e0' : '#333',
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  border: theme === 'dark' ? '1px solid #333' : '1px solid transparent',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: 180
                }}>
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: "bold", marginBottom: "8px", fontSize: '1.1rem' }}>{project.name}</div>
                    {project.project_code && (
                      <div style={{ fontSize: '0.95rem', margin: '4px 0' }}>Project Code: <b>#{project.project_code}</b></div>
                    )}
                    {project.description && (
                      <div style={{ fontSize: '0.9rem', margin: '4px 0', color: theme === 'dark' ? '#bbb' : '#666' }}>{project.description}</div>
                    )}
                    <div style={{ fontSize: '0.95rem', margin: '4px 0' }}>Number of Students: {project.student_count || 0}</div>
                    <div style={{ fontSize: '0.95rem', margin: '4px 0' }}>Date of Start: {new Date(project.created_at || project.start_date).toLocaleDateString()}</div>
                    {project.due_date && (
                      <div style={{ fontSize: '0.95rem', margin: '4px 0' }}>Due Date: {new Date(project.due_date).toLocaleDateString()}</div>
                    )}
                    <div style={{ fontSize: '0.95rem', margin: '4px 0' }}>Status: <span style={{ fontWeight: 'bold', color: project.is_active ? '#27ae60' : '#c0392b' }}>{project.is_active ? 'Active' : 'Inactive'}</span></div>
                  </div>
                  {project.is_active && (
                    <button
                      style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Close
                    </button>
                  )}
                </div>
              ))}
              {[...Array(Math.max(0, 4 - filteredProjects.length))].map((_, i) => (
                <div key={`empty-${i}`} style={{
                  background: theme === 'dark' ? '#1e1e1e' : '#fff',
                  borderRadius: '16px',
                  minHeight: 180,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '24px'
                }}>
                  <span>＋</span>
                </div>
              ))}
            </div>

            {}
            {showJoinModal && (
              <div style={{
                position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center",
                justifyContent: "center", zIndex: 1000,
              }}>
                <div style={{
                  background: theme === 'dark' ? '#2c2a4a' : '#e6f0e6',
                  borderRadius: "16px", padding: "32px 24px",
                  minWidth: "350px", boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
                  display: "flex", flexDirection: "column", gap: "16px"
                }}>
                  <h3 style={{ margin: 0, color: theme === 'dark' ? '#fff' : '#333' }}>Join New Project</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label htmlFor="project-code" style={{ color: theme === 'dark' ? '#fff' : '#333' }}>Please enter the project code</label>
                    <input
                      id="project-code"
                      type="text"
                      placeholder="Enter project code"
                      value={projectCode}
                      onChange={e => setProjectCode(e.target.value)}
                      style={{ 
                        padding: "10px", 
                        borderRadius: "8px", 
                        border: '1px solid #ccc',
                        background: theme === 'dark' ? '#2a2a2a' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#333'
                      }}
                    />
                    {joinError && (
                      <div style={{ color: '#e74c3c', fontSize: '0.9rem', marginTop: '4px' }}>
                        {joinError}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                    <button 
                      onClick={() => {
                        setShowJoinModal(false);
                        setProjectCode('');
                        setJoinError('');
                      }} 
                      style={{ 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        background: theme === 'dark' ? '#2a2a2a' : '#fff', 
                        border: '1px solid #ccc', 
                        color: theme === 'dark' ? '#fff' : '#333', 
                        cursor: 'pointer' 
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleJoinProject} 
                      style={{ 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        background: '#e74c3c', 
                        color: '#fff', 
                        border: 'none', 
                        cursor: 'pointer' 
                      }}
                    >
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

export default StudentProjects; 