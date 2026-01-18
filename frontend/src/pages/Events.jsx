import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Gamepad2, Sparkles, Heart, Send, Puzzle, Ghost } from 'lucide-react';
import EventToggle from '../components/events/EventToggle';
import EventCard from '../components/events/EventCard';
import PastEventCard from '../components/events/PastEventCard';
import { getUpcomingEvents, getPastEvents } from '../data/eventsData';
import './Events.css';

const Events = () => {
    const location = useLocation();
    const [activeView, setActiveView] = useState('upcoming');
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterError, setNewsletterError] = useState('');
    const [newsletterSuccess, setNewsletterSuccess] = useState(false);

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        setNewsletterError('');
        
        if (!newsletterEmail.includes('@')) {
            setNewsletterError('Please enter a valid email address');
            return;
        }
        
        // Here you would typically send to backend
        setNewsletterSuccess(true);
        setNewsletterEmail('');
        setTimeout(() => setNewsletterSuccess(false), 3000);
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get('tab');
        if (tab === 'past' || tab === 'upcoming') {
            setActiveView(tab);
        }
    }, [location]);

    const upcomingEvents = getUpcomingEvents();
    const pastEvents = getPastEvents();

    return (
        <div className="events-index-page">

            {/* --- Hero Section --- */}
            <header className="events-hero-section">
                <div className="events-container events-relative events-z-10">
                    <div className="events-hero-badge">
                        <Sparkles className="w-4 h-4" style={{ color: '#FFD700' }} />
                        <span className="events-hero-badge-text">Where Play Meets Community</span>
                    </div>

                    <h1 className="events-hero-title">
                        We Keep It <span className="events-fresh-text">Fresh</span>.<br />
                        We Keep It <span className="events-fun-text">Fun!</span>
                    </h1>

                    <p className="events-hero-subtitle">
                        Join the most vibrant board game community in town. Weekly events, friendly faces, and endless fun awaits.
                    </p>
                </div>

                {/* Floating Icons */}
                <div className="events-floating-icon events-icon-puzzle">
                    <Puzzle className="w-16 h-16" />
                </div>
                <div className="events-floating-icon events-icon-ghost">
                    <Ghost className="w-20 h-20" />
                </div>

                {/* Decorative Blobs */}
                <div className="events-blob-top" />
                <div className="events-blob-bottom" />

                {/* Wave Divider Bottom */}
                <div className="events-wave-divider">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="events-wave-svg">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                    </svg>
                </div>
            </header>

            {/* --- Events Section --- */}
            <main className="events-container events-main-content">
                <div className="events-toggle-wrapper">
                    <EventToggle activeView={activeView} onToggle={setActiveView} />
                </div>

                <div style={{ minHeight: '400px' }}>
                    {activeView === 'upcoming' && (
                        <div className="events-grid">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))
                            ) : (
                                <div className="events-empty-state">
                                    <p className="events-empty-text">
                                        No upcoming events announced yet. Stay tuned!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === 'past' && (
                        <div className="events-grid">
                            {pastEvents.length > 0 ? (
                                pastEvents.map((event) => (
                                    <PastEventCard key={event.id} event={event} />
                                ))
                            ) : (
                                <div className="events-empty-state">
                                    <p className="events-empty-text">
                                        No past events to show.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* --- Newsletter / Community Section --- */}
            <section className="events-newsletter-section">
                {/* Top Wave */}
                <div className="events-top-wave">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="events-wave-svg-rotated">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                    </svg>
                </div>

                <div className="events-container">
                    <div className="events-newsletter-content">
                        <div className="events-newsletter-badge">
                            <span className="events-pulse-dot" />
                            <span className="events-newsletter-badge-text">Join the inner circle</span>
                        </div>

                        <h2 className="events-newsletter-title">
                            Never Miss a <span className="events-underline-wavy">Game Night</span>
                        </h2>
                        <p className="events-newsletter-text">
                            Get exclusive invites to secret events, early access to tournaments, and special community rewards delivered to your inbox.
                        </p>

                        <form className="events-newsletter-form" onSubmit={handleNewsletterSubmit}>
                            <div className="events-email-wrapper">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className={`events-email-input ${newsletterError ? 'error' : ''}`}
                                    value={newsletterEmail}
                                    onChange={(e) => {
                                        setNewsletterEmail(e.target.value);
                                        setNewsletterError('');
                                    }}
                                    required
                                />
                                {newsletterError && <span className="events-email-error">{newsletterError}</span>}
                                {newsletterSuccess && <span className="events-email-success">Thanks for subscribing! ✓</span>}
                            </div>
                            <button type="submit" className="events-subscribe-button">
                                Subscribe
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                        <p className="events-newsletter-disclaimer">
                            No spam, just pure joy. Unsubscribe anytime.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Events;
