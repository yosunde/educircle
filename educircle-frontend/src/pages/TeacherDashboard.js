import React from 'react';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import styles from './TeacherDashboard.module.css';

const TeacherDashboard = ({ theme, toggleTheme }) => {
    const userSchool = "EduCircle";

    const actions = [
        {
            icon: "📚",
            title: "Add a new course",
            desc: "Create a new course to organize your students and assignments. Courses help you manage projects, groups, and materials efficiently."
        },
        {
            icon: "📝",
            title: "Create a project",
            desc: "Design a new project for your course. Projects allow students to collaborate in groups and submit their work."
        },
        {
            icon: "📢",
            title: "Send an announcement",
            desc: "Share important updates or reminders with your students. Announcements appear instantly on their dashboards."
        }
    ];

    return (
        <div className={styles.dashboardContainer}>
            <Navbar theme={theme} toggleTheme={toggleTheme} />
            <div className={styles.bodyArea}>
                <Sidebar role="teacher" theme={theme} />
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

export default TeacherDashboard;