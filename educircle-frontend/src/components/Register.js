import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'C:/Users/Sude/Desktop/EduCircle/educircle-frontend/src/components/css/Register.css'; // Register sayfasına özel CSS
import 'C:/Users/Sude/Desktop/EduCircle/educircle-frontend/src/components/css/Homepage.css'; // Homepage'den gelen genel stiller ve tema

const Register = () => {
    
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
    const [password_hash, setPassword] = useState('');
    const [studentNumber, setStudentNumber] = useState('');
    const [userType, setUserType] = useState('student'); 
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleRegister = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:3001/api/auth/register', {
            username,
            email,
            password_hash,
            role: userType,
            school_number: studentNumber,
            first_name: firstName,
            last_name: lastName
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
        alert(error.response?.data?.error || 'Kayıt başarısız!');
    }
};

    return (
        <div className="register-container">
            {}
            <header className="header">
                <div className="logo-section">
                    <img src="/logo.png" alt="EduCircle Logo" className="logo" /> {/* Küçük logo */}
                </div>
                <nav className="nav-links">
                    <a href="/" className="nav-link">Homepage</a>
                    <a href="/signin" className="nav-link">Sign-in</a>
                    <a href="/register" className="nav-link active">Register</a> {/* Bu sayfa aktif */}
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
            <main className="main-content-register">
                <div className="register-hero-section">
                    <img src="/logo.png" alt="EduCircle Icon" className="hero-icon-register" /> {}
                </div>

                <div className="register-form-section">
                    <form onSubmit={handleRegister} className="register-form">
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
                                value={password_hash}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                                 type="text"
                                 id="username"
                                 name="username"
                                 placeholder="Value"
                                 value={username}
                                 onChange={(e) => setUsername(e.target.value)}
                                required
                                  />
                               </div>
                        <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                                 type="text"
                                  id="firstName"
                                 name="firstName"
                                 placeholder="Value"
                                 value={firstName}
                                 onChange={(e) => setFirstName(e.target.value)}
                                 required
                                   />
                                </div>
                        <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                         <input
                          type="text"
                          id="lastName"
                         name="lastName"
                         placeholder="Value"
                         value={lastName}
                         onChange={(e) => setLastName(e.target.value)}
                           required
                              />
                        </div>
                        <div className="form-group">
                            <label htmlFor="studentNumber">Student Number</label>
                            <input
                                type="text"
                                id="studentNumber"
                                name="studentNumber"
                                placeholder="Value"
                                value={studentNumber}
                                onChange={(e) => setStudentNumber(e.target.value)}
                                required
                            />
                        </div>

                        {}
                        <div className="form-group user-type-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="userType"
                                    value="student"
                                    checked={userType === 'student'}
                                    onChange={(e) => setUserType(e.target.value)}
                                />
                                Student
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="userType"
                                    value="teacher"
                                    checked={userType === 'teacher'}
                                    onChange={(e) => setUserType(e.target.value)}
                                />
                                Teacher
                            </label>
                        </div>

                        <button type="submit" className="register-button">Register</button>
                        <p className="has-account-text">
                            Already have an account? <a href="/signin" className="signin-link">Sign In</a>
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Register;