import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Layout.module.css'; 
import '../css/NotificationDropdown.css';



const Navbar = ({ userName, theme, toggleTheme }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        axios.get('/api/notifications/unread-count', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setUnreadCount(res.data.unreadCount || 0);
        });
    }, []);

    const fetchNotifications = () => {
        const token = localStorage.getItem('token');
        axios.get('/api/notifications', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setNotifications(res.data.notifications || []));
    };

    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) fetchNotifications();
    };

    const handleLogout = () => {
        
        window.location.href = "/signin"; 
    };

    const markAsRead = (id) => {
        const token = localStorage.getItem('token');
        axios.put(`/api/notifications/${id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(() => fetchNotifications());
    };

    const deleteNotification = (id) => {
        const token = localStorage.getItem('token');
        axios.delete(`/api/notifications/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(() => fetchNotifications());
    };

    return (
        <div className={styles.navbar}>
            <div className={styles.navbarLeft}>
                {}
                <img src="/logo.png" alt="Logo" className={styles.navbarLogo} />
            </div>
            <div className={styles.navbarRight}>

                {}
                <div className={styles.notificationIcon} style={{ position: 'relative', cursor: 'pointer' }} onClick={handleNotificationClick}>
                    🔔
                    {unreadCount > 0 && (
                        <span className={styles.notificationBadge}>{unreadCount}</span>
                    )}
                    {showNotifications && (
                        <div className="notification-dropdown">
                            {notifications.length === 0 ? (
                                <div style={{ padding: 10 }}>No notifications.</div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} style={{ padding: 10, borderBottom: '1px solid #eee', background: n.is_read ? '#fff' : '#e6f4ea' }}>
                                        <b>{n.type === 'grade' ? 'Grade' : n.type === 'announcement' ? 'Announcement' : 'Notification'}</b>: {n.message}
                                        <br />
                                        <small>{new Date(n.created_at).toLocaleString()}</small>
                                        {!n.is_read && (
                                            <button onClick={() => markAsRead(n.id)} style={{ marginLeft: 8 }}>Read</button>
                                        )}
                                        <button onClick={() => deleteNotification(n.id)} style={{ marginLeft: 8, color: 'red' }}>Delete</button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {}
                <div className="toggle-switch">
                    <input
                        type="checkbox"
                        id="theme-toggle-navbar"
                        className="toggle-input"
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                    />
                    <label htmlFor="theme-toggle-navbar" className="toggle-label"></label>
                </div>

                {}
                <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
};

export default Navbar;