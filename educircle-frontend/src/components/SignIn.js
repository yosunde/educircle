import React, { useState, useEffect } from 'react';
import 'C:/Users/Sude/Desktop/EduCircle/educircle-frontend/src/components/css/SignIn.css'; // SignIn sayfasına özel CSS
import 'C:/Users/Sude/Desktop/EduCircle/educircle-frontend/src/components/css/Homepage.css'; // Homepage'den gelen genel stiller (özellikle header için)
import  axios  from 'axios';

const SignIn = () => {
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

    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:3001/api/auth/login', {
            email,
            password
        });
        const { token, user } = response.data;
        localStorage.setItem('token', token);

        
        if (user.role === 'teacher') {
            window.location.href = '/dashboard/teacher';
        } else if (user.role === 'student') {
            window.location.href = '/dashboard/student';
        } else {
            window.location.href = '/dashboard'; 
        }
    } catch (error) {
        alert(error.response?.data?.error || 'Giriş başarısız!');
    }
};

    return (
        <div className="signin-container">
            {}
            <header className="header">
                <div className="logo-section">
                    <img src="/logo.png" alt="EduCircle Logo" className="logo" />
                </div>
                <nav className="nav-links">
                    <a href="/" className="nav-link">Homepage</a> {}
                    <a href="/signin" className="nav-link active">Sign-in</a> {}
                    <a href="/register" className="nav-link">Register</a>
                    {}
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
            <main className="main-content-signin"> {}
                <div className="signin-hero-section"> {}
                    <img src="/logo.png" alt="EduCircle Icon" className="hero-icon-signin" />
                </div>

                <div className="signin-form-section"> {}
                    <form onSubmit={handleSignIn} className="signin-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Value" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Value" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="signin-button">Sign In</button>
                        <a href="/forgot-password" className="forgot-password-link">Forgot password?</a>
                        <p className="no-account-text">
                            Don't have an account? <a href="/register" className="register-link">Register</a>
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default SignIn;