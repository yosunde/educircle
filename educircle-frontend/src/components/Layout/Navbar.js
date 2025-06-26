import React from 'react';
import styles from './Layout.module.css'; 



const Navbar = ({ userName, theme, toggleTheme }) => {

    const handleLogout = () => {
        
        window.location.href = "/signin"; 
    };

    return (
        <div className={styles.navbar}>
            <div className={styles.navbarLeft}>
                {}
                <img src="/logo.png" alt="Logo" className={styles.navbarLogo} />
            </div>
            <div className={styles.navbarRight}>

                {}
                <div className={styles.notificationIcon}>
                    {} {}
                    🔔 <span className={styles.notificationBadge}>3</span> {}
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
                <button className={styles.logoutButton} onClick={handleLogout}>Çıkış Yap</button>
            </div>
        </div>
    );
};

export default Navbar;