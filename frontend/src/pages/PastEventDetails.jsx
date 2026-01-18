import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../data/eventsData';
import { Calendar, MapPin, Users, ArrowLeft, Image as ImageIcon } from 'lucide-react';

import './PastEventDetails.css';

const PastEventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const event = getEventById(id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!event) {
        return (
            <div className="events-archive-not-found">
                Archive Not Found
            </div>
        );
    }

    return (
        <div className="events-past-event-container">

            {/* --- LEFT VISUAL PANEL (FIXED/STICKY) --- */}
            <div className="events-visual-panel">
                <img
                    src={event.images[0]}
                    alt={event.title}
                    className="events-visual-image"
                />

                {/* Overlay Gradient */}
                <div className="events-visual-overlay" />

                {/* Back Button */}
                <button
                    onClick={() => navigate('/events')}
                    className="events-back-button"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Events
                </button>

                {/* Mobile Title Overlay */}
                <div className="events-mobile-title-overlay">
                    <h1 className="events-mobile-title">
                        {event.title}
                    </h1>
                </div>
            </div>

            {/* --- RIGHT DATA PANEL (SCROLLABLE) --- */}
            <div className="events-data-panel">

                {/* Header (Desktop) */}
                <header className="events-desktop-header">
                    <h1 className="events-event-title-desktop">
                        {event.title}
                    </h1>

                    <div className="events-meta-row">
                        <div className="events-meta-item">
                            <Calendar className="events-meta-icon" />
                            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="events-meta-item">
                            <MapPin className="events-meta-icon" />
                            {event.location}
                        </div>
                    </div>
                </header>

                {/* The Vibe / Description */}
                <section>
                    <div className="events-vibe-tag">
                        The Vibe
                    </div>
                    <blockquote className="events-vibe-quote">
                        "{event.description}"
                    </blockquote>
                </section>

                {/* About the Event */}
                <section className="events-text-prose">
                    <h3 className="events-section-title">About the Event</h3>
                    <p>
                        {event.fullDescription || event.description}
                    </p>
                    {event.highlights && (
                        <div className="events-highlights-block">
                            <h4 className="events-highlights-block-title">
                                <Users className="w-5 h-5" style={{ color: 'var(--events-primary)' }} />
                                Community Highlights
                            </h4>
                            <p style={{ fontSize: '0.875rem' }}>{event.highlights}</p>
                        </div>
                    )}
                </section>

                {/* Stats Grid */}
                <section>
                    <div className="events-stats-grid">
                        <div>
                            <span className="events-stat-label">Total Attendees</span>
                            <span className="events-stat-value">{event.registered}</span>
                        </div>
                        <div>
                            <span className="events-stat-label">Moments Captured</span>
                            <span className="events-stat-value">{event.images?.length || 0}</span>
                        </div>
                    </div>
                </section>

                {/* Photo Gallery */}
                {event.images && event.images.length > 0 && (
                    <section>
                        <h3 className="events-gallery-section-title">
                            <ImageIcon className="w-6 h-6" style={{ color: 'var(--events-primary)' }} />
                            Photo Gallery
                        </h3>
                        <div className="events-gallery-grid">
                            {event.images.map((img, index) => (
                                <div key={index} className="events-gallery-item">
                                    <img
                                        src={img}
                                        alt={`Gallery ${index + 1}`}
                                        className="events-gallery-img"
                                    />
                                    <div className="events-gallery-hover-overlay" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer */}
                <div className="events-past-footer">
                    <p className="events-past-footer-text">
                        Looking for more? <span onClick={() => navigate('/events')} className="events-past-footer-link">Browse upcoming events</span>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default PastEventDetails;
