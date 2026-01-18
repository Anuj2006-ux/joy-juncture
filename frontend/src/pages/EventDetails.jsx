import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../data/eventsData';
import { Calendar, Clock, MapPin, Ticket, Users, ArrowLeft, Star, Heart, Share2, CheckCircle } from 'lucide-react';
import MissionRegistrationModal from '../components/events/MissionRegistrationModal';
import './EventDetails.css';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const event = getEventById(id);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!event) {
        return (
            <div className="events-not-found-state">
                <div className="events-nf-icon-box">
                    <Star className="w-12 h-12" style={{ color: 'var(--events-muted-foreground)' }} />
                </div>
                <h1 className="events-nf-title">Event Not Found</h1>
                <p className="events-nf-text">Looks like this event has moved or doesn't exist.</p>
                <button
                    onClick={() => navigate('/events')}
                    className="events-nf-button"
                >
                    Browse All Events
                </button>
            </div>
        );
    }

    const spotsLeft = event.capacity - event.registered;
    const capacityPercentage = (event.registered / event.capacity) * 100;

    return (
        <div className="events-details-container">

            {/* --- Navigation Bar --- */}
            <nav className="events-details-nav">
                <div className="events-container events-details-nav-content">
                    <button
                        onClick={() => navigate('/events')}
                        className="events-back-link-button"
                    >
                        <div className="events-back-circle">
                            <ArrowLeft className="w-4 h-4" style={{ color: 'var(--events-secondary)' }} />
                        </div>
                        Back to Events
                    </button>
                    <div className="events-nav-actions">
                        <button className="events-nav-action-btn">
                            <Heart className="w-6 h-6" />
                        </button>
                        <button className="events-nav-action-btn">
                            <Share2 className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="events-container events-event-main">
                <div className="events-event-grid">

                    {/* --- Left Column: Images & Content --- */}
                    <div className="events-left-col">

                        {/* Hero Image */}
                        <div className="events-hero-image-box">
                            <img
                                src={event.images[0]}
                                alt={event.title}
                                className="events-hero-image"
                            />
                            <div className="events-image-badges">
                                <span className="events-category-badge">
                                    {event.category || 'Special Event'}
                                </span>
                                {spotsLeft < 10 && spotsLeft > 0 && (
                                    <span className="events-urgent-badge">
                                        Almost Full!
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="events-about-header">About This Event</h2>
                            <div className="events-about-text">
                                <p>{event.fullDescription || event.description}</p>
                            </div>
                        </div>

                        {/* Highlights/Loadout */}
                        <div className="events-highlights-box">
                            <h3 className="events-highlights-header">
                                <Star className="w-6 h-6" style={{ color: '#FFD700' }} />
                                What's Included
                            </h3>
                            <div className="events-highlights-grid">
                                {['Game Master Guidance', 'All Equipment Provided', 'Snacks & Drinks', `Earn ${event.pointsEarned} Joy Points`].map((item, i) => (
                                    <div key={i} className="events-highlight-item">
                                        <CheckCircle className="w-5 h-5" style={{ color: 'var(--events-secondary)', flexShrink: 0 }} />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- Right Column: Sidebar --- */}
                    <div className="events-right-col">
                        <div className="events-sidebar-sticky">

                            {/* Title & Stats */}
                            <div>
                                <h1 className="events-event-main-title">
                                    {event.title}
                                </h1>
                                <div className="events-host-wrapper">
                                    <span className="events-host-tag">
                                        Hosted by Joy Juncture
                                    </span>
                                </div>
                            </div>

                            {/* Booking Card */}
                            <div className="events-booking-card">
                                <div className="events-booking-info">
                                    {/* Date */}
                                    <div className="events-info-row">
                                        <div className="events-info-icon-box">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="events-info-label">Date</div>
                                            <div className="events-info-value">
                                                {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time */}
                                    <div className="events-info-row">
                                        <div className="events-info-icon-box">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="events-info-label">Time</div>
                                            <div className="events-info-value">{event.time}</div>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="events-info-row">
                                        <div className="events-info-icon-box">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="events-info-label">Location</div>
                                            <div className="events-info-value">{event.location}</div>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="events-info-row">
                                        <div className="events-info-icon-box">
                                            <Ticket className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="events-info-label">Entry Fee</div>
                                            <div className="events-price-value">
                                                ₹{event.price * 80} <span className="events-price-unit">/ person</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Capacity Bar */}
                                <div className="events-capacity-section">
                                    <div className="events-capacity-header">
                                        <span style={{ color: 'var(--events-muted-foreground)' }}>Capacity</span>
                                        <span style={{ color: spotsLeft < 5 ? '#EF4444' : 'var(--events-secondary)' }}>
                                            {spotsLeft} spots left
                                        </span>
                                    </div>
                                    <div className="events-capacity-bar-bg">
                                        <div
                                            className="events-capacity-bar-fill"
                                            style={{ width: `${capacityPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="events-register-button"
                                >
                                    Register Now
                                </button>
                                <p className="events-secure-text">
                                    Instant confirmation • Secure booking
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {/* --- Registration Modal --- */}
            <MissionRegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                event={event}
            />
        </div>
    );
};

export default EventDetails;
