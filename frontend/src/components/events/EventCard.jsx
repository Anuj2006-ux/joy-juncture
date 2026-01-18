import React from 'react';
import { Calendar, Clock, MapPin, Ticket, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import './EventCard.css';

const EventCard = ({ event }) => {
    const navigate = useNavigate();
    const spotsLeft = event.capacity - event.registered;
    const isCritical = spotsLeft <= 5;

    return (
        <div
            onClick={() => navigate(`/events/${event.id}`)}
            className="event-card"
        >
            {/* Image Section */}
            <div className="card-image-container">
                <div className="card-overlay" />
                <img
                    src={event.images[0]}
                    alt={event.title}
                    className="card-image"
                />

                {/* Badges */}
                <div className="card-badges">
                    <div className="badge">
                        {event.category || 'Event'}
                    </div>
                </div>

                {isCritical && (
                    <div className="critical-badge">
                        <span className="badge-red">
                            Few Spots Left!
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="card-content">
                {/* Header */}
                <div className="mb-4">
                    <h3 className="card-title">
                        {event.title}
                    </h3>
                </div>

                {/* Details */}
                <div className="card-details">
                    <div className="detail-row">
                        <Calendar className="detail-icon" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {event.time}</span>
                    </div>
                    <div className="detail-row">
                        <MapPin className="detail-icon" />
                        <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="detail-row">
                        <Ticket className="detail-icon" />
                        <span>₹{event.price * 80}</span>
                    </div>
                </div>

                {/* Action */}
                <div className="card-action">
                    <button className="action-button">
                        <span>Join Event</span>
                        <div className="arrow-circle">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
