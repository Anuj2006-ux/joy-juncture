import React from 'react';
import './EventToggle.css';

const EventToggle = ({ activeView, onToggle }) => {
    return (
        <div className="event-toggle-container">
            <div className="event-toggle-wrapper">
                <button
                    onClick={() => onToggle('upcoming')}
                    className={`toggle-button ${activeView === 'upcoming' ? 'active' : 'inactive'}`}
                >
                    Upcoming Events
                </button>

                <button
                    onClick={() => onToggle('past')}
                    className={`toggle-button ${activeView === 'past' ? 'active' : 'inactive'}`}
                >
                    Archives
                </button>
            </div>
        </div>
    );
};

export default EventToggle;
