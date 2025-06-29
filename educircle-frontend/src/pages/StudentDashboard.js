import React from 'react';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import styles from './TeacherDashboard.module.css';

const StudentDashboard = ({ theme, toggleTheme }) => {
    const userSchool = "EduCircle";

    const actions = [
        {
            icon: "🔑",
            title: "Join a course",
            desc: "Enter a course code to join your class. Access assignments, materials, and group projects easily."
        },
        {
            icon: "👥",
            title: "View your groups",
            desc: "See which project groups you are a part of. Collaborate with your teammates and track your progress."
        },
        {
            icon: "⏰",
            title: "Check upcoming deadlines",
            desc: "Stay on top of your assignments and project deadlines. Never miss an important date!"
        }
    ];

    return (
        <div className={styles.dashboardContainer}>
            <Navbar theme={theme} toggleTheme={toggleTheme} />
            <div className={styles.bodyArea}>
                <Sidebar role="student" theme={theme} />
                <div className={styles.contentArea} style={{ textAlign: 'center', marginTop: 40 }}>
                    <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 12 }}>
                        Welcome to your dashboard, {userSchool}
                    </h1>
                    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'left' }}>
                        {actions.map((a, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 32 }}>
                                <div style={{
                                    fontSize: 28,
                                    background: '#f4f7fa',
                                    borderRadius: 12,
                                    width: 48,
                                    height: 48,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>{a.icon}</div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{a.title}</div>
                                    <div style={{ color: '#666', fontSize: 15 }}>{a.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;