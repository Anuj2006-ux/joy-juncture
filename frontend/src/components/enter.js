import React, { useState } from 'react';
import API_URL from '../config';
import './enter.css';
import logo from '../images/Web-log.png';

function Enter() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  const handleLoginWithOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_URL + '/api/auth/login-with-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (data.success && data.requiresOTP) {
        setShowOTP(true);
        setTempToken(data.tempToken);
        setMaskedEmail(data.email);
        setError('');
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Login with OTP error:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.requiresOTP) {
        // OTP sent, show OTP input screen
        setShowOTP(true);
        setTempToken(data.tempToken);
        setMaskedEmail(data.email);
        setError('');
      } else if (data.success) {
        // Direct login successful
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert(`🎮 Welcome back, ${data.user.username || data.user.name}! Ready to play games.`);
        // You can redirect to games page here
        // window.location.href = '/games';
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_URL + '/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp, tempToken }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show success message
        alert(`🎮 Welcome ${data.user.name}! You can now play games.`);
        
        // Redirect to games dashboard (you can implement this later)
        // window.location.href = '/games';
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Unable to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_URL + '/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tempToken }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ New OTP sent to your email!');
        setError('');
      } else {
        setError(data.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Logo" className="login-logo" />
        <h1 className="login-title"><b>{showOTP ? 'Verify OTP' : 'Hurry Soldier!'}</b></h1>
        
        {!showOTP ? (
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-group password-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

          <div className="login-otp-option">
              <button
                type="button"
                className="otp-link-button"
                onClick={(e) => {
                  e.preventDefault();
                  if (username) {
                    handleLoginWithOTP(e);
                  } else {
                    setError('Please enter your username first');
                  }
                }}
              >
               <b>   📧 Login with OTP instead </b> 
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : "Login"}
            </button>

            <p className="register-text">
              Don't have an account? <a href="#register" className="register-link">Sign up</a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <p className="otp-instruction">
              📧 We've sent a 6-digit OTP to<br />
              <strong>{maskedEmail}</strong>
            </p>

            <div className="input-group">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                required
                className="otp-input"
              />
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : '🎮 Verify & Play Games'}
            </button>

            <div className="otp-actions">
              <button
                type="button"
                className="resend-otp-button"
                onClick={handleResendOTP}
                disabled={loading}
              >
                📨 Resend OTP
              </button>
              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setShowOTP(false);
                  setOtp('');
                  setError('');
                }}
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Enter;