import React from 'react';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import styles from './TeacherDashboard.module.css';

const StudentDashboard = () => {
    const userName = "Admin"; 

    return (
        <div className={styles.dashboardContainer}>
            <Navbar userName={userName} />
            <div className={styles.bodyArea}>
                <Sidebar role="student" />
                <div className={styles.contentArea}>
                    {}
                    <h1>Dashboard</h1>
                    <p>Hoş geldiniz, {userName}!</p>
                    {}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;