import React, { useState, useEffect, useRef } from 'react';
import API_URL from '../config';
import './ProfilePopup.css';

function ProfilePopup({ isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Delete account states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteOTP, setShowDeleteOTP] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL + '/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setNewName(data.user.name || data.user.username || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitial = () => {
    const name = user?.name || user?.username || '';
    return name.charAt(0).toUpperCase() || 'U';
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.slice(0, 2) + '****' + localPart.slice(-1);
    return `${maskedLocal}@${domain}`;
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 2MB' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      await uploadProfilePicture(base64);
    };
    reader.readAsDataURL(file);
  };

  const uploadProfilePicture = async (base64) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL + '/api/auth/profile/update-picture', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profilePicture: base64 })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error:', errorText);
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUser({ ...user, profilePicture: data.profilePicture });
        setMessage({ type: 'success', text: 'Profile picture updated!' });
        
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.profilePicture = data.profilePicture;
        localStorage.setItem('user', JSON.stringify(storedUser));
        window.dispatchEvent(new Event('userLoggedIn'));
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update picture' });
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload picture. Try a smaller image.' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const removeProfilePicture = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL + '/api/auth/profile/update-picture', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profilePicture: null })
      });
      const data = await response.json();
      
      if (data.success) {
        setUser({ ...user, profilePicture: null });
        setMessage({ type: 'success', text: 'Profile picture removed!' });
        
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.profilePicture = null;
        localStorage.setItem('user', JSON.stringify(storedUser));
        window.dispatchEvent(new Event('userLoggedIn'));
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove picture' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim() || newName.trim().length < 2) {
      setMessage({ type: 'error', text: 'Name must be at least 2 characters' });
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL + '/api/auth/profile/update-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName.trim() })
      });
      const data = await response.json();
      
      if (data.success) {
        setUser({ ...user, name: data.user.name, username: data.user.username });
        setEditingName(false);
        setMessage({ type: 'success', text: 'Name updated successfully!' });
        
        // Update localStorage user
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.name = data.user.name;
        storedUser.username = data.user.username;
        localStorage.setItem('user', JSON.stringify(storedUser));
        window.dispatchEvent(new Event('userLoggedIn'));
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update name' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleSendOTP = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL + '/api/auth/profile/send-password-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setOtpSent(true);
        setMessage({ type: 'success', text: 'OTP sent to your email!' });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send OTP' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    if (otp.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter valid 6-digit OTP' });
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL + '/api/auth/profile/verify-password-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp, newPassword })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setShowPasswordReset(false);
        setOtpSent(false);
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reset password' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  // Delete Account Functions
  const handleDeleteAccountClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL + '/api/auth/profile/send-delete-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setShowDeleteConfirm(false);
        setShowDeleteOTP(true);
        setMessage({ type: 'success', text: 'OTP sent to your email' });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send OTP' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyDeleteOTP = async () => {
    if (deleteOtp.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter valid 6-digit OTP' });
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL + '/api/auth/profile/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp: deleteOtp })
      });
      const data = await response.json();
      
      if (data.success) {
        // Clear all user data and redirect to home
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('userLoggedIn'));
        alert('Your account has been deleted successfully.');
        window.location.href = '/';
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete account' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = () => {
    setEditingName(false);
    setShowPasswordReset(false);
    setOtpSent(false);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage({ type: '', text: '' });
    setShowDeleteConfirm(false);
    setShowDeleteOTP(false);
    setDeleteOtp('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="profile-popup-overlay" onClick={handleClose}>
      <div className="profile-popup" onClick={(e) => e.stopPropagation()}>
        <button className="profile-popup-close" onClick={handleClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        {loading ? (
          <div className="profile-popup-loading">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        ) : (
          <>
            <div className="profile-popup-header">
              <div className="profile-popup-avatar-container">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <div 
                  className={`profile-popup-avatar ${user?.profilePicture ? 'has-image' : ''}`}
                  onClick={handleProfilePictureClick}
                >
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" />
                  ) : (
                    getInitial()
                  )}
                  <div className="avatar-overlay">
                    <i className="fa-solid fa-camera"></i>
                  </div>
                </div>
                {user?.profilePicture && (
                  <button className="remove-picture-btn" onClick={removeProfilePicture} title="Remove picture">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                )}
              </div>
              <h2>My Profile</h2>
            </div>

            {message.text && (
              <div className={`profile-message ${message.type}`}>
                <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                {message.text}
              </div>
            )}

            {!showPasswordReset ? (
              <div className="profile-popup-content">
                <div className="profile-field">
                  <label><i className="fa-solid fa-user"></i> Name</label>
                  {editingName ? (
                    <div className="edit-name-field">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter your name"
                        autoFocus
                      />
                      <div className="edit-name-actions">
                        <button 
                          className="save-btn" 
                          onClick={handleUpdateName}
                          disabled={actionLoading}
                        >
                          {actionLoading ? <span className="btn-spinner"></span> : <i className="fa-solid fa-check"></i>}
                        </button>
                        <button 
                          className="cancel-btn" 
                          onClick={() => { setEditingName(false); setNewName(user?.name || user?.username || ''); }}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="field-value">
                      <span>{user?.name || user?.username || 'Not set'}</span>
                      <button className="edit-btn" onClick={() => setEditingName(true)}>
                        <i className="fa-solid fa-pen"></i>
                      </button>
                    </div>
                  )}
                </div>

                <div className="profile-field">
                  <label><i className="fa-solid fa-envelope"></i> Email</label>
                  <div className="field-value">
                    <span>{maskEmail(user?.email)}</span>
                    <i className="fa-solid fa-lock" title="Email cannot be changed"></i>
                  </div>
                </div>

                <div className="profile-field">
                  <label><i className="fa-solid fa-coins"></i> Joy Points</label>
                  <div className="field-value points">
                    <span>{user?.points || 0} Points</span>
                    <span className="points-badge">🎮</span>
                  </div>
                </div>

                <div className="profile-field">
                  <label><i className="fa-solid fa-calendar"></i> Member Since</label>
                  <div className="field-value">
                    <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</span>
                  </div>
                </div>

                <button 
                  className="reset-password-btn" 
                  onClick={() => setShowPasswordReset(true)}
                >
                  <i className="fa-solid fa-key"></i> Change Password
                </button>

                <button 
                  className="delete-account-btn" 
                  onClick={handleDeleteAccountClick}
                >
                  <i className="fa-solid fa-trash"></i> Delete My Account
                </button>
              </div>
            ) : (
              <div className="password-reset-content">
                <button className="back-btn" onClick={() => { setShowPasswordReset(false); setOtpSent(false); setOtp(''); }}>
                  <i className="fa-solid fa-arrow-left"></i> Back to Profile
                </button>

                <h3><i className="fa-solid fa-shield-halved"></i> Change Password</h3>

                {!otpSent ? (
                  <div className="otp-request">
                    <p>We'll send a verification code to your registered email:</p>
                    <p className="masked-email">{maskEmail(user?.email)}</p>
                    <button 
                      className="send-otp-btn" 
                      onClick={handleSendOTP}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <><span className="btn-spinner"></span> Sending...</>
                      ) : (
                        <><i className="fa-solid fa-paper-plane"></i> Send OTP</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="otp-verify">
                    <div className="input-group">
                      <label>Enter OTP</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit OTP"
                        maxLength={6}
                      />
                    </div>

                    <div className="input-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                      />
                    </div>

                    <div className="input-group">
                      <label>Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                      />
                    </div>

                    <button 
                      className="confirm-reset-btn" 
                      onClick={handleResetPassword}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <><span className="btn-spinner"></span> Updating...</>
                      ) : (
                        <><i className="fa-solid fa-check"></i> Update Password</>
                      )}
                    </button>

                    <button className="resend-otp-btn" onClick={handleSendOTP} disabled={actionLoading}>
                      <i className="fa-solid fa-rotate-right"></i> Resend OTP
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Account Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="delete-confirm-popup" onClick={(e) => e.stopPropagation()}>
            <div className="delete-confirm-icon">
              <i className="fa-solid fa-exclamation-triangle"></i>
            </div>
            <h3>Delete Account?</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.</p>
            {message.text && (
              <div className={`profile-message ${message.type}`}>
                {message.text}
              </div>
            )}
            <div className="delete-confirm-buttons">
              <button 
                className="cancel-btn" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn" 
                onClick={handleConfirmDelete}
                disabled={actionLoading}
              >
                {actionLoading ? 'Sending OTP...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account OTP Verification Popup */}
      {showDeleteOTP && (
        <div className="delete-confirm-overlay" onClick={() => { setShowDeleteOTP(false); setDeleteOtp(''); }}>
          <div className="delete-confirm-popup" onClick={(e) => e.stopPropagation()}>
            <div className="delete-confirm-icon otp-icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3>Verify OTP</h3>
            <p>Enter the 6-digit OTP sent to your registered email to confirm account deletion.</p>
            {message.text && (
              <div className={`profile-message ${message.type}`}>
                {message.text}
              </div>
            )}
            <div className="otp-input-container">
              <input
                type="text"
                value={deleteOtp}
                onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="delete-otp-input"
              />
            </div>
            <div className="delete-confirm-buttons">
              <button 
                className="cancel-btn" 
                onClick={() => { setShowDeleteOTP(false); setDeleteOtp(''); }}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn" 
                onClick={handleVerifyDeleteOTP}
                disabled={actionLoading || deleteOtp.length !== 6}
              >
                {actionLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePopup;

