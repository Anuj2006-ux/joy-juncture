import React, { useState, useEffect } from 'react';
import { X, ChevronRight, CheckCircle2, Shield, Smartphone, User, AlertTriangle, ArrowLeft, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../config';

import './MissionRegistrationModal.css';

const MissionRegistrationModal = ({ isOpen, onClose, event }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // 0 = auth check, 1 = form, 2 = confirm, 3 = success
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [errors, setErrors] = useState({});
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);

    // Check if user is logged in when modal opens
    useEffect(() => {
        if (isOpen) {
            checkAuthAndRegistration();
        }
    }, [isOpen]);

    const checkAuthAndRegistration = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
            setUser(null);
            setStep(0);
            setLoading(false);
            return;
        }

        try {
            // Check user auth
            const authResponse = await fetch(`${API_URL}/api/auth/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (authResponse.ok) {
                const userData = await authResponse.json();
                setUser(userData.user || userData);
                
                // Pre-fill form with user's name
                setFormData(prev => ({
                    ...prev,
                    name: userData.user?.name || userData.name || ''
                }));

                // Check if already registered for this event
                const regResponse = await fetch(`${API_URL}/api/events/check/${event.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (regResponse.ok) {
                    const regData = await regResponse.json();
                    if (regData.isRegistered) {
                        setAlreadyRegistered(true);
                        setStep(3); // Show success/already registered
                    } else {
                        setStep(1);
                    }
                } else {
                    setStep(1);
                }
            } else {
                setUser(null);
                setStep(0);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
            setStep(0);
        }
        setLoading(false);
    };

    const handleLoginRedirect = () => {
        onClose();
        // Store the event URL to redirect back after login
        sessionStorage.setItem('redirectAfterLogin', `/events/${event.id}`);
        navigate('/login');
    };

    if (!isOpen) return null;

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Operative identification required";
        if (!formData.phone.trim() || formData.phone.length < 10) newErrors.phone = "Valid comms channel required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2) {
            setIsSubmitting(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/events/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        eventId: event.id,
                        eventTitle: event.title,
                        eventDate: event.date,
                        eventTime: event.time,
                        eventLocation: event.location,
                        eventImage: event.image,
                        eventPrice: event.price * 80,
                        pointsEarned: event.pointsEarned || 0,
                        attendeeName: formData.name,
                        attendeePhone: formData.phone
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    setStep(3);
                } else {
                    setErrors({ submit: data.message || 'Registration failed' });
                }
            } catch (error) {
                console.error('Registration error:', error);
                setErrors({ submit: 'Failed to register. Please try again.' });
            }
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (step > 1 && step < 3) setStep(step - 1);
    };

    return (
        <div className="events-modal-overlay">
            <div className="events-modal-container">

                {/* Loading State */}
                {loading && (
                    <div className="events-modal-loading">
                        <div className="events-loading-spinner"></div>
                        <p>Checking status...</p>
                    </div>
                )}

                {!loading && (
                    <>
                        {/* Header */}
                        <div className="events-modal-header">
                            <div>
                                <h2 className="events-modal-step-label">
                                    {step === 0 ? 'Authentication' : `Step 0${step}`}
                                </h2>
                                <div className="events-modal-title">
                                    {step === 0 && "Login Required"}
                                    {step === 1 && "Identify Yourself"}
                                    {step === 2 && "Confirm Details"}
                                    {step === 3 && (alreadyRegistered ? "Already Registered!" : "You're In!")}
                                </div>
                            </div>
                            {step < 3 && (
                                <button onClick={onClose} className="events-close-btn">
                                    <X className="w-6 h-6" />
                                </button>
                            )}
                        </div>

                        {/* Body */}
                        <div className="events-modal-body">

                            {/* STEP 0: LOGIN REQUIRED */}
                            {step === 0 && (
                                <div className="events-auth-required">
                                    <div className="events-auth-icon">
                                        <LogIn className="w-12 h-12" />
                                    </div>
                                    <h3>Sign in to Continue</h3>
                                    <p>You need to be logged in to register for this event.</p>
                                    <button onClick={handleLoginRedirect} className="events-btn-primary">
                                        <LogIn className="w-4 h-4" /> Go to Login
                                    </button>
                                    <button onClick={onClose} className="events-btn-link" style={{ marginTop: '1rem' }}>
                                        Maybe Later
                                    </button>
                                </div>
                            )}

                            {/* STEP 1: FORM */}
                            {step === 1 && (
                                <div className="events-form-group">
                                    {errors.submit && (
                                        <p className="events-error-msg" style={{ marginBottom: '1rem' }}>
                                            <AlertTriangle className="w-3 h-3" /> {errors.submit}
                                        </p>
                                    )}
                                    <div className="events-form-group">
                                        <label className="events-form-label">
                                            <User className="w-3 h-3" /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`events-form-input ${errors.name ? 'error' : ''}`}
                                            placeholder="Enter your full name"
                                            autoFocus
                                        />
                                        {errors.name && <p className="events-error-msg"><AlertTriangle className="w-3 h-3" /> {errors.name}</p>}
                                    </div>

                                    <div className="events-form-group">
                                        <label className="events-form-label">
                                            <Smartphone className="w-3 h-3" /> Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                            className={`events-form-input ${errors.phone ? 'error' : ''}`}
                                            placeholder="Mobile Number"
                                            maxLength={10}
                                        />
                                        {errors.phone && <p className="events-error-msg"><AlertTriangle className="w-3 h-3" /> {errors.phone}</p>}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: SUMMARY */}
                            {step === 2 && (
                                <div className="events-summary-box">
                                    {errors.submit && (
                                        <p className="events-error-msg" style={{ marginBottom: '1rem' }}>
                                            <AlertTriangle className="w-3 h-3" /> {errors.submit}
                                        </p>
                                    )}
                                    <div className="events-summary-row">
                                        <span className="events-summary-label">Event</span>
                                        <span className="events-summary-value">{event.title}</span>
                                    </div>
                                    <div className="events-summary-row">
                                        <span className="events-summary-label">Attendee</span>
                                        <span className="events-summary-value highlight">{formData.name}</span>
                                    </div>
                                    <div className="events-summary-row">
                                        <span className="events-summary-label">Entry Fee</span>
                                        <span className="events-summary-value" style={{ fontSize: '1.25rem' }}>₹{event.price * 80}</span>
                                    </div>
                                    <div className="events-summary-row">
                                        <span className="events-summary-label">Reward</span>
                                        <span className="events-summary-value">
                                            +{event.pointsEarned} XP
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: SUCCESS */}
                            {step === 3 && (
                                <div className="events-success-container">
                                    <div className="events-success-icon-box">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <h3 className="events-success-title">
                                            {alreadyRegistered ? "Already Registered!" : "Confirmed!"}
                                        </h3>
                                        <p className="events-success-text">
                                            {alreadyRegistered 
                                                ? "You are already registered for this event."
                                                : "You are officially listed for this event."
                                            }
                                        </p>
                                    </div>
                                    {!alreadyRegistered && formData.phone && (
                                        <div className="events-credentials-box">
                                            <p className="events-form-label" style={{ justifyContent: 'center', marginBottom: '0.25rem' }}>Confirmation Sent To</p>
                                            <p className="events-summary-value" style={{ textAlign: 'center' }}>{formData.phone}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>

                        {/* Footer Actions */}
                        <div className="events-modal-footer">
                            {step === 1 && (
                                <button
                                    onClick={handleNext}
                                    className="events-btn-primary"
                                    disabled={isSubmitting}
                                >
                                    Next Step <ChevronRight className="w-4 h-4" />
                                </button>
                            )}

                            {step === 2 && (
                                <>
                                    <button
                                        onClick={handleBack}
                                        className="events-btn-secondary"
                                        disabled={isSubmitting}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="events-btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Registering...' : 'Confirm Entry'} <Shield className="w-4 h-4" />
                                    </button>
                                </>
                            )}

                            {step === 3 && (
                                <div style={{ width: '100%', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                    <button
                                        onClick={() => navigate('/your-events')}
                                        className="events-btn-primary"
                                        style={{ backgroundColor: 'var(--events-secondary)' }}
                                    >
                                        View My Events
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="events-btn-link"
                                    >
                                        <ArrowLeft className="w-3 h-3" /> Return to Events
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default MissionRegistrationModal;
