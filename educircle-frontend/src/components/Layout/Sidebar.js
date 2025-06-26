import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Layout.module.css'; 


const Sidebar = ({ role }) => {
    
    return (
        <div className={styles.sidebar}>
            <nav className={styles.sidebarNav}>
                <ul>
                    <li>
                        <Link to={role === "teacher" ? "/dashboard/teacher" : "/dashboard/student"} className={styles.navLink}>
                            {} 🏠 Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to={role === "teacher" ? "/groups/teacher" : "/groups/student"} className={styles.navLink}>
                            {} 👥 Groups
                        </Link>
                    </li>
                    <li>
                        <Link to={role === "teacher" ? "/courses/teacher" : "/courses/student"} className={styles.navLink}>
                            {} 📚 Courses
                        </Link>
                    </li>
                    <li>
                        <Link to={role === "teacher" ? "/projects/teacher" : "/projects/student"} className={styles.navLink}>
                            {} 📂 Projects
                        </Link>
                    </li>
                    <li>
                        <Link to={role === "teacher" ? "/calendar/teacher" : "/calendar/student"} className={styles.navLink}>
                            {} 🗓️ Calendar
                        </Link>
                    </li>
                    <li>
                        <Link to={role === "teacher" ? "/settings/teacher" : "/settings/student"} className={styles.navLink}>
                            {} ⚙️ Settings
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;