import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Ticket, AlertCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import API_URL from '../config';
import './YourEvents.css';

const YourEvents = () => {
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/events/my-registrations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setRegistrations(data.data || []);
            } else if (response.status === 401) {
                navigate('/login');
            } else {
                setError('Failed to load your events');
            }
        } catch (err) {
            console.error('Error fetching registrations:', err);
            setError('Failed to load your events. Please try again.');
        }
        setLoading(false);
    };

    const handleCancelRegistration = async (registrationId) => {
        if (!window.confirm('Are you sure you want to cancel this registration?')) {
            return;
        }

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_URL}/api/events/cancel/${registrationId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Refresh the list
                fetchRegistrations();
            } else {
                alert('Failed to cancel registration');
            }
        } catch (err) {
            console.error('Error cancelling registration:', err);
            alert('Failed to cancel registration');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'registered':
                return <span className="your-events-status registered">Registered</span>;
            case 'attended':
                return <span className="your-events-status attended">Attended</span>;
            case 'cancelled':
                return <span className="your-events-status cancelled">Cancelled</span>;
            default:
                return <span className="your-events-status">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="your-events-page">
                <div className="your-events-loading">
                    <div className="your-events-spinner"></div>
                    <p>Loading your events...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="your-events-page">
            <div className="your-events-container">
                {/* Header */}
                <div className="your-events-header">
                    <button className="your-events-back" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1>Your Events</h1>
                        <p>Manage your event registrations</p>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="your-events-error">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Empty State */}
                {!error && registrations.length === 0 && (
                    <div className="your-events-empty">
                        <div className="your-events-empty-icon">
                            <Ticket className="w-12 h-12" />
                        </div>
                        <h2>No Events Yet</h2>
                        <p>You haven't registered for any events yet. Explore our upcoming events and join the fun!</p>
                        <Link to="/events" className="your-events-cta">
                            Explore Events <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {/* Events List */}
                {registrations.length > 0 && (
                    <div className="your-events-list">
                        {registrations.map((reg) => (
                            <div key={reg._id} className={`your-events-card ${reg.status === 'cancelled' ? 'cancelled' : ''}`}>
                                <div className="your-events-card-image">
                                    <img 
                                        src={reg.eventImage || '/images/events/event_placeholder.png'} 
                                        alt={reg.eventTitle}
                                        onError={(e) => { e.target.src = '/images/events/event_placeholder.png'; }}
                                    />
                                    {getStatusBadge(reg.status)}
                                </div>
                                <div className="your-events-card-content">
                                    <h3>{reg.eventTitle}</h3>
                                    <div className="your-events-card-details">
                                        <div className="your-events-detail">
                                            <Calendar className="w-4 h-4" />
                                            <span>{reg.eventDate}</span>
                                        </div>
                                        <div className="your-events-detail">
                                            <Clock className="w-4 h-4" />
                                            <span>{reg.eventTime}</span>
                                        </div>
                                        <div className="your-events-detail">
                                            <MapPin className="w-4 h-4" />
                                            <span>{reg.eventLocation}</span>
                                        </div>
                                    </div>
                                    <div className="your-events-card-footer">
                                        <div className="your-events-price">
                                            <span className="label">Entry Fee</span>
                                            <span className="value">₹{reg.eventPrice}</span>
                                        </div>
                                        {reg.pointsEarned > 0 && (
                                            <div className="your-events-points">
                                                <span className="label">Rewards</span>
                                                <span className="value">+{reg.pointsEarned} XP</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="your-events-card-actions">
                                        <span className="your-events-registered-date">
                                            Registered on {new Date(reg.registeredAt).toLocaleDateString()}
                                        </span>
                                        {reg.status === 'registered' && (
                                            <button 
                                                className="your-events-cancel-btn"
                                                onClick={() => handleCancelRegistration(reg._id)}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Browse More Events */}
                {registrations.length > 0 && (
                    <div className="your-events-browse">
                        <Link to="/events" className="your-events-browse-link">
                            Browse More Events <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default YourEvents;
