import React, { useState, useEffect } from 'react'; 
import '../components/css/Homepage.css';

const Homepage = () => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme : 'light';
    });

    useEffect(() => {
        document.body.className = ''; 
        document.body.classList.add(theme + '-theme'); 
        localStorage.setItem('theme', theme); 
    }, [theme]); 

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <div className="homepage-container">
            <header className="header">
                <div className="logo-section">
                    <img src="/logo.png" alt="EduCircle Logo" className="logo" />
                </div>
                <nav className="nav-links">
                    <a href="/" className="nav-link active">Homepage</a>
                    <a href="/signin" className="nav-link">Sign-in</a>
                    <a href="/register" className="nav-link">Register</a>
                    <div className="toggle-switch">
                        <input
                            type="checkbox"
                            id="theme-toggle"
                            className="toggle-input"
                            checked={theme === 'dark'} 
                            onChange={toggleTheme} 
                        />
                        <label htmlFor="theme-toggle" className="toggle-label"></label>
                    </div>
                </nav>
            </header>

            {}
            <main className="main-content">
                <div className="hero-section">
                    <img src="/logo.png" alt="EduCircle Icon" className="hero-icon" />
                    <p className="tagline">Easy access to homework design and collaborative study with groups</p>

                    {}
                    <div className="role-selection">
                        <button className="role-button student active">Student</button>
                        <button className="role-button teacher">Teacher</button>
                    </div>
                </div>

                {}
                <section className="description-section">
                    <p className="description-text">
                        "EduCircle" is a platform designed to improve students' academic success.
                        Users can easily access assignments and create study groups. The platform
                        facilitates knowledge sharing by encouraging collaboration among students
                        and provides an effective learning environment. With features such as a
                        modern calendar system, resource sharing and event management, it enables
                        users to work in an organized and productive manner.
                    </p>
                </section>
            </main>
        </div>
    );
};

export default Homepage;