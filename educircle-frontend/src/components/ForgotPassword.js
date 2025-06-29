import React, { useState, useEffect } from 'react';
import 'C:/Users/Sude/Desktop/EduCircle/educircle-frontend/src/components/css/ForgotPassword.css';
import 'C:/Users/Sude/Desktop/EduCircle/educircle-frontend/src/components/css/Homepage.css';
import axios from 'axios';

const ForgotPassword = () => {
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

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [loading, setLoading] = useState(false);

    const sendResetCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        try {
            const response = await axios.post('http://localhost:3001/api/auth/forgot-password', { email });
            setMessage(response.data.message || 'Password reset code has been sent to your email address.');
            setMessageType('success');
            setStep(2);
        } catch (error) {
            setMessage(error.response?.data?.error || 'An error occurred. Please try again.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match.');
            setMessageType('error');
            return;
        }

        if (newPassword.length < 6) {
            setMessage('Password must be at least 6 characters.');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage('');
        
        try {
            const response = await axios.post('http://localhost:3001/api/auth/reset-password', {
                email,
                code: resetCode,
                new_password: newPassword
            });
            setMessage(response.data.message || 'Your password has been reset successfully. Redirecting to sign in page...');
            setMessageType('success');
            
            setTimeout(() => {
                window.location.href = '/signin';
            }, 3000);
        } catch (error) {
            setMessage(error.response?.data?.error || 'An error occurred. Please try again.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <form onSubmit={sendResetCode} className="forgot-password-form">
            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <button 
                type="submit" 
                className="forgot-password-button"
                disabled={loading}
            >
                {loading ? 'Sending...' : 'Send Password Reset Code'}
            </button>
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={resetPassword} className="forgot-password-form">
            <div className="form-group">
                <label htmlFor="resetCode">Reset Code</label>
                <input
                    type="text"
                    id="resetCode"
                    name="resetCode"
                    placeholder="Enter the code from your email" 
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    placeholder="Enter your new password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Re-enter your password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
            <button 
                type="submit" 
                className="forgot-password-button"
                disabled={loading}
            >
                {loading ? 'Resetting...' : 'Reset Password'}
            </button>
        </form>
    );

    return (
        <div className="forgot-password-container">
            <header className="header">
                <div className="logo-section">
                    <img src="/logo.png" alt="EduCircle Logo" className="logo" />
                </div>
                <nav className="nav-links">
                    <a href="/" className="nav-link">Homepage</a>
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

            <main className="main-content-forgot-password">
                <div className="forgot-password-hero-section">
                    <img src="/logo.png" alt="EduCircle Icon" className="hero-icon-forgot-password" />
                </div>

                <div className="forgot-password-form-section">
                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-color)' }}>
                        Password Reset
                    </h2>
                    
                    <div className="step-indicator">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
                    </div>

                    {message && (
                        <div className={`message ${messageType}-message`}>
                            {message}
                        </div>
                    )}

                    {step === 1 ? renderStep1() : renderStep2()}
                    
                    <a href="/signin" className="back-to-signin-link">
                        Back to sign in page
                    </a>
                </div>
            </main>
        </div>
    );
};

export default ForgotPassword; 