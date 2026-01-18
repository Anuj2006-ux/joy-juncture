import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './PastEventCard.css';

const PastEventCard = ({ event }) => {
    return (
        <div className="past-event-card">

            {/* Image Overlay */}
            <div className="past-card-image-box">
                <div className="past-card-overlay" />
                <img
                    src={event.images[0]}
                    alt={event.title}
                    className="past-card-image"
                />

                <div className="past-badge-container">
                    <span className="past-badge">
                        Past Event
                    </span>
                </div>
            </div>

            <div className="past-card-content">

                {/* Title */}
                <div className="past-card-title-box">
                    <h3 className="past-card-title">
                        {event.title}
                    </h3>
                </div>

                {/* Date */}
                <div className="past-card-footer">
                    <div className="past-card-date">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>

                    <Link
                        to={`/events/past/${event.id}`}
                        className="past-card-link"
                    >
                        View Gallery
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PastEventCard;
