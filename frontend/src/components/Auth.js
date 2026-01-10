import React, { useState } from 'react';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import logo from '../images/Web-log.png';

function Auth() {
    const navigate = useNavigate();
    // Views: 'login', 'signup', 'forgot-password', 'verify-otp', 'reset-password'
    const [view, setView] = useState('login');
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '', // Using name field logic from backend
        lastName: ''
    });

    const [otp, setOtp] = useState('');
    const [tempToken, setTempToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    // Handle Google Login Callback
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const user = params.get('user');

        if (token && user) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', decodeURIComponent(user));
            window.dispatchEvent(new Event('userLoggedIn'));
            navigate('/');
        }
    }, [navigate]);

    const handleGoogleLogin = () => {
        window.location.href = API_URL + '/api/auth/google';
    };

    // Handle Input Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    // 1. LOGIN LOGIC
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(API_URL + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.email, // Backend accepts email/username in 'username' field
                    password: formData.password
                }),
            });
            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.dispatchEvent(new Event('userLoggedIn'));
                navigate('/');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // 2. SIGNUP LOGIC - Step 1: Send OTP
    const handleSignup = async (e) => {
        e.preventDefault();
        if (!agreeToTerms) {
            setError('You must agree to the terms and policy.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch(API_URL + '/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.firstName, // Mapping Name to username for simplicity
                    email: formData.email,
                    password: formData.password
                }),
            });
            const data = await response.json();

            if (data.success) {
                if (data.requiresOTP) {
                    // OTP sent, show OTP verification screen
                    setTempToken(data.tempToken);
                    setView('verify-signup-otp');
                } else {
                    // Direct login (shouldn't happen with new flow)
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.dispatchEvent(new Event('userLoggedIn'));
                    navigate('/');
                }
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // 2b. SIGNUP OTP VERIFICATION - Step 2: Verify OTP and complete registration
    const handleVerifySignupOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch(API_URL + '/api/auth/verify-register-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    otp: otp,
                    tempToken: tempToken
                }),
            });
            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.dispatchEvent(new Event('userLoggedIn'));
                navigate('/');
            } else {
                setError(data.message || 'OTP verification failed');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // 2c. RESEND SIGNUP OTP
    const handleResendSignupOtp = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(API_URL + '/api/auth/resend-register-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempToken }),
            });
            const data = await response.json();

            if (data.success) {
                setTempToken(data.tempToken);
                setError('');
                alert('OTP resent to your email!');
            } else {
                setError(data.message || 'Failed to resend OTP');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // 3. FORGOT PASSWORD (SEND OTP)
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(API_URL + '/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });
            const data = await response.json();

            if (data.success) {
                setTempToken(data.tempToken);
                setView('verify-otp');
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // 4. VERIFY OTP (For Password Reset)
    // Note: Backend has /verify-otp for Login and /reset-password which takes OTP.
    // We'll use this step to transition to reset password view, carrying the OTP.
    const handleVerifyOtpStep = (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }
        // We will verify the OTP along with the new password in the next step
        setView('reset-password');
        setError('');
    };

    // 5. RESET PASSWORD
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(API_URL + '/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    otp: otp,
                    tempToken: tempToken,
                    newPassword: formData.password
                }),
            });
            const data = await response.json();

            if (data.success) {
                alert('Password reset successfully! Please login.');
                setView('login');
                setFormData({ ...formData, password: '' });
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* LEFT SIDE - FORM */}
            <div className="auth-form-container">

                {/* LOGIN VIEW */}
                {view === 'login' && (
                    <>
                        <div className="auth-header">
                            <h1>Welcome Back 👋</h1>
                            <p>Today is a new day. It's your day. You shape it.</p>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label>Email or Username</label>
                                <input
                                    type="text"
                                    name="email"
                                    placeholder="Example@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="At least 8 characters"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <i 
                                        className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ cursor: 'pointer' }}
                                    ></i>
                                </div>
                            </div>
                            <div className="form-options">
                                <span className="forgot-password" onClick={() => setView('forgot-password')} style={{ cursor: 'pointer' }}>
                                    Forgot Password?
                                </span>
                            </div>
                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>
                        <div className="divider"><span>Or</span></div>
                        <div className="social-login">
                            <button className="social-btn" onClick={handleGoogleLogin} type="button">
                                <i className="fa-brands fa-google" style={{ color: '#DB4437' }}></i> Sign in with Google
                            </button>
                            <button className="social-btn" type="button">
                                <i className="fa-brands fa-apple" style={{ color: 'black' }}></i> Sign in with Apple
                            </button>
                        </div>
                        <div className="auth-footer">
                            Don't have an account?
                            <span className="auth-link" onClick={() => setView('signup')} style={{ cursor: 'pointer' }}>Sign up</span>
                        </div>
                    </>
                )}

                {/* SIGNUP VIEW */}
                {view === 'signup' && (
                    <>
                        <div className="auth-header">
                            <h1>Get Started Now</h1>
                            <p>Create an account to start your journey.</p>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSignup}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="Enter your name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-options">
                                <label className="remember-me">
                                    <input
                                        type="checkbox"
                                        checked={agreeToTerms}
                                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    />
                                    <span>I agree to the terms & policy</span>
                                </label>
                            </div>
                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? 'Creating account...' : 'Signup'}
                            </button>
                        </form>
                        <div className="divider"><span>Or</span></div>
                        <div className="social-login">
                            <button className="social-btn" onClick={handleGoogleLogin} type="button">
                                <i className="fa-brands fa-google" style={{ color: '#DB4437' }}></i> Sign in with Google
                            </button>
                            <button className="social-btn" type="button">
                                <i className="fa-brands fa-apple" style={{ color: 'black' }}></i> Sign in with Apple
                            </button>
                        </div>
                        <div className="auth-footer">
                            Have an account?
                            <span className="auth-link" onClick={() => setView('login')} style={{ cursor: 'pointer' }}>Sign In</span>
                        </div>
                    </>
                )}

                {/* SIGNUP OTP VERIFICATION VIEW */}
                {view === 'verify-signup-otp' && (
                    <>
                        <div className="auth-header">
                            <h1>Verify Your Email</h1>
                            <p>Enter the 6-digit OTP sent to {formData.email}</p>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleVerifySignupOtp}>
                            <div className="form-group">
                                <label>Enter OTP</label>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                                />
                            </div>
                            <button type="submit" className="auth-submit-btn" disabled={loading || otp.length !== 6}>
                                {loading ? 'Verifying...' : 'Verify & Create Account'}
                            </button>
                        </form>
                        <button 
                            type="button" 
                            className="auth-submit-btn" 
                            onClick={handleResendSignupOtp}
                            disabled={loading}
                            style={{ marginTop: '10px', background: 'transparent', color: '#1a3b2f', border: '1px solid #1a3b2f' }}
                        >
                            Resend OTP
                        </button>
                        <div className="auth-footer">
                            <span className="auth-link" onClick={() => { setView('signup'); setOtp(''); setError(''); }} style={{ cursor: 'pointer' }}>
                                ← Back to Sign Up
                            </span>
                        </div>
                    </>
                )}

                {/* FORGOT PASSWORD VIEW */}
                {view === 'forgot-password' && (
                    <>
                        <div className="auth-header">
                            <h1>Forgot Password?</h1>
                            <p>Enter your email to receive a recovery OTP.</p>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleForgotPassword}>
                            <div className="form-group">
                                <label>Email address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                        <div className="auth-footer">
                            Remembered?
                            <span className="auth-link" onClick={() => setView('login')} style={{ cursor: 'pointer' }}>Back to Login</span>
                        </div>
                    </>
                )}

                {/* VERIFY OTP VIEW */}
                {view === 'verify-otp' && (
                    <>
                        <div className="auth-header">
                            <h1>Verify OTP</h1>
                            <p>Enter the 6-digit code sent to {formData.email}</p>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleVerifyOtpStep}>
                            <div className="form-group">
                                <label>One Time Password</label>
                                <input
                                    type="text"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength="6"
                                    required
                                    style={{ letterSpacing: '5px', textAlign: 'center', fontSize: '1.2rem' }}
                                />
                            </div>
                            <button type="submit" className="auth-submit-btn">
                                Verify OTP
                            </button>
                        </form>
                        <div className="auth-footer">
                            <span className="auth-link" onClick={() => setView('forgot-password')} style={{ cursor: 'pointer' }}>Resend OTP</span>
                        </div>
                    </>
                )}

                {/* RESET PASSWORD VIEW */}
                {view === 'reset-password' && (
                    <>
                        <div className="auth-header">
                            <h1>Reset Password</h1>
                            <p>Create a new strong password.</p>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="New Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm New Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>

            {/* RIGHT SIDE - IMAGE */}
            <div className="auth-image-container">
                <img src={logo} alt="Joy Juncture Logo" className="auth-corner-logo" />
                <a href="/" className="back-to-home"><i className="fa-solid fa-arrow-left"></i> Home</a>
                <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" alt="Gaming Setup" />
                <div className="auth-content-overlay">
                    <h2>Joy Juncture</h2>
                    <p>Enter the ultimate gaming zone. Level up your life.</p>
                </div>
            </div>
        </div>
    );
}

export default Auth;
