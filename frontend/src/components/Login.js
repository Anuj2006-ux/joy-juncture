import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isOTPScreen, setIsOTPScreen] = useState(false);
  const [isSignUpOTP, setIsSignUpOTP] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');
    const urlError = urlParams.get('error');

    if (token && userStr) {
      try {
        const userData = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('userLoggedIn'));
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, '/login');
        
        // Redirect to home
        setTimeout(() => {
          navigate('/');
        }, 500);
      } catch (err) {
        console.error('Error parsing user data:', err);
        setError('Authentication error. Please try again.');
      }
    } else if (urlError) {
      setError('Google authentication failed. Please try again.');
      window.history.replaceState({}, document.title, '/login');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_URL + '/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: emailOrUsername, 
          password 
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('userLoggedIn'));
        navigate('/');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_URL + '/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password 
        }),
      });

      const data = await response.json();
      console.log('Sign up response:', data);

      if (data.success) {
        if (data.requiresOTP) {
          // OTP sent, show OTP screen
          console.log('Setting isSignUpOTP to true');
          setTempToken(data.tempToken);
          setIsSignUpOTP(true);
          setSuccessMessage('OTP sent to ' + email);
        } else {
          // Direct login (shouldn't happen now but keeping for safety)
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('userLoggedIn'));
          navigate('/');
        }
      } else {
        setError(data.message || 'Sign up failed. Please try again.');
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignUpOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_URL + '/api/auth/verify-register-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          otp, 
          tempToken 
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('userLoggedIn'));
        navigate('/');
      } else {
        setError(data.message || 'Verification failed. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendSignUpOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_URL + '/api/auth/resend-register-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tempToken }),
      });

      const data = await response.json();

      if (data.success) {
        setTempToken(data.tempToken);
        setSuccessMessage('OTP resent to your email');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_URL + '/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setTempToken(data.tempToken);
        setIsOTPScreen(true);
        setError('');
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL + '/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          otp, 
          tempToken, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Password reset successful! Please login with your new password.');
        setIsForgotPassword(false);
        setIsOTPScreen(false);
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setEmail('');
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth route
    window.location.href = API_URL + '/api/auth/google';
  };

  const handleAppleLogin = () => {
    // Apple OAuth - would need to set up Apple OAuth in backend
    alert('Apple Sign-In is not yet configured. Please use email/password login or contact support.');
    // In production, this would redirect to:
    // window.location.href = API_URL + '/api/auth/apple';
  };

  return (
    <div className="auth-page">
      <div>
        {/* Left Side - Form */}
        <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-logo">
            <div className="logo-icon">
              <img src="https://joyjuncture.com/cdn/shop/files/JJ_Logo.jpg?v=1735415999&width=150" alt="Joy Juncture Logo" />
            </div>
          </div>

          {!isForgotPassword ? (
            <>
              <h1 className="auth-title">{isSignUpOTP ? 'Verify Email' : isSignUp ? 'Create Account' : 'Welcome Back!'}</h1>
              <p className="auth-subtitle">
                {isSignUpOTP 
                  ? `Enter the 6-digit OTP sent to ${email}` 
                  : isSignUp 
                    ? 'Sign up to start your gaming journey' 
                    : 'Sign in to access your dashboard and continue optimizing your gaming experience.'}
              </p>

              {isSignUpOTP ? (
                // Sign Up OTP Verification Screen
                <form onSubmit={handleVerifySignUpOTP}>
                  <div className="form-group">
                    <label>Enter OTP</label>
                    <div className="input-wrapper">
                      <i className="fa-solid fa-shield-halved input-icon"></i>
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  {successMessage && <div className="success-message">{successMessage}</div>}
                  {error && <div className="error-message">{error}</div>}

                  <button type="submit" className="auth-btn primary" disabled={loading || otp.length !== 6}>
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                  </button>

                  <button 
                    type="button" 
                    className="auth-btn secondary" 
                    onClick={handleResendSignUpOTP}
                    disabled={loading}
                    style={{ marginTop: '10px' }}
                  >
                    <i className="fa-solid fa-rotate-right"></i> Resend OTP
                  </button>

                  <p className="switch-auth">
                    <span onClick={() => { setIsSignUpOTP(false); setOtp(''); setError(''); }}>
                      <i className="fa-solid fa-arrow-left"></i> Back to Sign Up
                    </span>
                  </p>
                </form>
              ) : !isSignUp ? (
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>Email or Username</label>
                    <div className="input-wrapper">
                      <i className="fa-regular fa-envelope input-icon"></i>
                      <input
                        type="text"
                        placeholder="Enter your email or username"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <div className="input-wrapper">
                      <i className="fa-solid fa-lock input-icon"></i>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <i 
                        className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                        onClick={() => setShowPassword(!showPassword)}
                      ></i>
                    </div>
                  </div>

                  <div className="forgot-password">
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); }}>Forgot Password?</a>
                  </div>

                  {error && <div className="error-message">{error}</div>}

                  <button type="submit" className="auth-btn primary" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>

                  <div className="divider">
                    <span>OR</span>
                  </div>

                  <button type="button" className="auth-btn google" onClick={handleGoogleLogin}>
                    <i className="fa-brands fa-google"></i>
                    Continue with Google
                  </button>

                  <button type="button" className="auth-btn apple" onClick={handleAppleLogin}>
                    <i className="fa-brands fa-apple"></i>
                    Continue with Apple
                  </button>

                  <p className="switch-auth">
                    Don't have an Account? <span onClick={() => setIsSignUp(true)}>Sign Up</span>
                  </p>
                </form>
              ) : (
            <form onSubmit={handleSignUp}>
              <div className="form-group">
                <label>Username</label>
                <div className="input-wrapper">
                  <i className="fa-regular fa-user input-icon"></i>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <i className="fa-regular fa-envelope input-icon"></i>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-lock input-icon"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <i 
                    className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                    onClick={() => setShowPassword(!showPassword)}
                  ></i>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="auth-btn primary" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>

              <div className="divider">
                <span>OR</span>
              </div>

              <button type="button" className="auth-btn google" onClick={handleGoogleLogin}>
                <i className="fa-brands fa-google"></i>
                Continue with Google
              </button>

              <button type="button" className="auth-btn apple" onClick={handleAppleLogin}>
                <i className="fa-brands fa-apple"></i>
                Continue with Apple
              </button>

              <p className="switch-auth">
                Don't have an Account? <span onClick={() => setIsSignUp(false)}>Sign In</span>
              </p>
            </form>
          )}
        </>
      ) : (
        // Forgot Password Section
        <>
          <h1 className="auth-title">{isOTPScreen ? 'Reset Password' : 'Forgot Password?'}</h1>
          <p className="auth-subtitle">
            {isOTPScreen ? 'Enter the OTP sent to your email and create a new password' : 'Enter your email address and we\'ll send you an OTP to reset your password.'}
          </p>

          {!isOTPScreen ? (
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <i className="fa-regular fa-envelope input-icon"></i>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="auth-btn primary" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <p className="switch-auth">
                Remember your password? <span onClick={() => setIsForgotPassword(false)}>Sign In</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>OTP</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-key input-icon"></i>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength="6"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-lock input-icon"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <i 
                    className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                    onClick={() => setShowPassword(!showPassword)}
                  ></i>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-lock input-icon"></i>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="auth-btn primary" disabled={loading || otp.length !== 6}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <p className="switch-auth">
                <span onClick={() => { setIsForgotPassword(false); setIsOTPScreen(false); }}>Back to Sign In</span>
              </p>
            </form>
          )}
        </>
      )}
        </div>
      </div>

      {/* Right Side - Testimonial */}
      <div className="auth-testimonial-section">
        <div className="testimonial-content">
          <h2>Revolutionize QA with Smarter Automation</h2>
          <blockquote>
            <i className="fa-solid fa-quote-left"></i>
            <p>
              "JoyJuncture has completely transformed our gaming experience. It's reliable, efficient, and ensures our releases are always top-notch."
            </p>
          </blockquote>
          
          <div className="testimonial-author">
            <div className="author-avatar">
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="author-info">
              <h4>Michael Carter</h4>
              <p>Gaming Enthusiast at DevCore</p>
            </div>
          </div>

          <div className="brand-logos">
            <p>JOIN 1K TEAMS</p>
            <div className="logos-grid">
              <div className="brand-logo">
                <i className="fa-brands fa-discord"></i>
                <span>Discord</span>
              </div>
              <div className="brand-logo">
                <i className="fa-brands fa-mailchimp"></i>
                <span>mailchimp</span>
              </div>
              <div className="brand-logo">
                <i className="fa-solid fa-g"></i>
                <span>grammarly</span>
              </div>
              <div className="brand-logo">
                <i className="fa-solid fa-eye"></i>
                <span>attentive</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Login;
