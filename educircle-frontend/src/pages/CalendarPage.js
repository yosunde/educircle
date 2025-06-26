import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import { useParams } from 'react-router-dom';
import './CalendarPage.css';


function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

const CalendarPage = ({ role }) => {
  const { courseId } = useParams();
  const [projects, setProjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateProjects, setDateProjects] = useState([]);

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        let url = '';
        if (role === 'teacher') {
          if (courseId) {
            url = `/api/projects/course/${courseId}`;
          } else {
            url = '/api/projects/teacher';
          }
        } else {
          url = '/api/projects/student';
        }
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : (data.projects || data.data || []));
      } catch (err) {
        setError('Failed to fetch projects');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [role, courseId]);

  useEffect(() => {
    const dayProjects = (Array.isArray(projects) ? projects : []).filter(p => {
      const start = p.start_date ? new Date(p.start_date) : null;
      const end = p.due_date ? new Date(p.due_date) : null;
      return (
        (start && isSameDay(selectedDate, start)) ||
        (end && isSameDay(selectedDate, end))
      );
    });
    setDateProjects(dayProjects);
  }, [selectedDate, projects]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div style={{ display: 'flex' }}>
        <Sidebar role={role} />
        <div style={{ flex: 1 }}>
          <div style={{
            background: theme === 'dark' ? '#e6f0e6' : '#e6f0e6',
            minHeight: '100vh',
            padding: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            transition: 'background-color 0.3s',
          }}>
            <h1 style={{ fontSize: '2.3rem', fontWeight: 'bold', color: theme === 'dark' ? '#222' : '#333', marginBottom: 28, textAlign: 'center', letterSpacing: '-1px' }}>Calendar</h1>
            <div className="calendar-card" style={{
              background: '#fff',
              borderRadius: 24,
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              border: '1.5px solid #e0e0e0',
              padding: '40px 48px 32px 48px',
              minWidth: 420,
              maxWidth: 600,
              width: '100%',
              minHeight: 520,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                {loading ? (
                  <div>Loading...</div>
                ) : error ? (
                  <div style={{ color: '#e74c3c' }}>{error}</div>
                ) : (
                  <Calendar
                    value={selectedDate}
                    onChange={setSelectedDate}
                    tileContent={({ date, view }) => {
                      if (view !== 'month') return null;
                      const starts = (Array.isArray(projects) ? projects : []).some(
                        p => p.start_date && isSameDay(date, new Date(p.start_date))
                      );
                      const ends = (Array.isArray(projects) ? projects : []).some(
                        p => p.due_date && isSameDay(date, new Date(p.due_date))
                      );
                      return (
                        <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 2 }}>
                          {starts && <span style={{ color: '#7c3aed', fontSize: 20, marginRight: ends ? 2 : 0 }}>•</span>}
                          {ends && <span style={{ color: '#e74c3c', fontSize: 20 }}>•</span>}
                        </span>
                      );
                    }}
                    tileClassName={() => 'big-calendar-tile'}
                  />
                )}
              </div>
              {}
              <div style={{ width: '100%', marginTop: 8 }}>
                <h3 style={{ margin: 0, fontWeight: 500, color: theme === 'dark' ? '#222' : '#333', fontSize: '1.1rem' }}>
                  {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                </h3>
                {dateProjects.length === 0 ? (
                  <div style={{ color: '#888', marginTop: 8 }}>No projects for this day.</div>
                ) : (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {dateProjects.map(p => (
                      <li key={p.id} style={{ background: '#f3f3fa', borderRadius: 8, margin: '12px 0', padding: 12 }}>
                        <div style={{ fontWeight: 'bold', color: '#7c3aed' }}>{p.name}</div>
                        <div style={{ fontSize: 13, color: '#555' }}>
                          {p.start_date && isSameDay(selectedDate, new Date(p.start_date)) && 'Project Start'}
                          {p.due_date && isSameDay(selectedDate, new Date(p.due_date)) && 'Project End'}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage; 