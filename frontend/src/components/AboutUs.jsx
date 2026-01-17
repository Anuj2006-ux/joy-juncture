import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutUs.css';
import ContactSection from './ContactSection';

// NOTE: To add actual profile photos:
// 1. Place images in: frontend/public/images/
// 2. Name them: khushi-poddar.jpg and muskan-poddar.jpg
// 3. Update the image src below to use: /images/khushi-poddar.jpg and /images/muskan-poddar.jpg

const AboutUs = () => {
    const observerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optional: Stop observing once visible to run animation only once
                    observerRef.current.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1, // Trigger when 10% of element is visible
            rootMargin: "0px 0px -50px 0px" // Slight offset
        });

        const hiddenElements = document.querySelectorAll('.animate-on-scroll');
        hiddenElements.forEach((el) => observerRef.current.observe(el));

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, []);

    return (
        <div className="about-us-container">
            {/* 1. Our Story Section (Hero) */}
            <section className="hero-section animate-on-scroll">
                <div className="hero-content">
                    <h1>Our (Accidentally Awesome) Story</h1>
                    <div className="story-text">
                        <p>
                            Honestly? There’s no dramatic “lifelong passion” backstory here—just two people who figured out they’re pretty good at creating chaos, laughter, and the kind of competitive tension that turns friends into frenemies.
                        </p>
                        <p>
                            Instead of sticking with the family business (textiles and electricals—thrilling, right?), we thought, why not channel our inner entrepreneurs? Spoiler: we have no idea what we’re doing, but we’ve got some big dreams for a fancy office, preferably with a sea view and a foosball table.
                        </p>
                        <p>
                            Now here we are, turning what started as random ideas into something real, fun, and (fingers crossed) successful.
                        </p>
                    </div>
                </div>
            </section>

            {/* 2. Our Goal & Mission Section */}
            <section className="mission-section animate-on-scroll">
                <div className="section-container">
                    <h2>Our Goal & Mission</h2>
                    <div className="mission-content">
                        <div className="mission-block">
                            <h3>The Goal</h3>
                            <p>
                                Our goal is simple: to make games that bring people together—because let’s be honest, nothing bonds people like arguing over rules or laughing at someone’s questionable strategy.
                            </p>
                        </div>
                        <div className="mission-block">
                            <h3>The Mission</h3>
                            <p>
                                Our mission is to spread the magic of tabletop games wherever we go and build a culture that’s all about fun.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Our Philosophy Section */}
            <section className="philosophy-section animate-on-scroll">
                <div className="section-container">
                    <h2>Our Philosophy</h2>
                    <div className="cards-grid">
                        <div className="card animate-on-scroll">
                            <div className="card-icon">🤝</div>
                            <h3>Connection over competition</h3>
                            <p>Our games are designed to bring people closer, no matter the outcome.</p>
                        </div>
                        <div className="card animate-on-scroll">
                            <div className="card-icon">✨</div>
                            <h3>Quality and creativity</h3>
                            <p>From striking illustrations to innovative game mechanics, every detail is thoughtfully crafted.</p>
                        </div>
                        <div className="card animate-on-scroll">
                            <div className="card-icon">😄</div>
                            <h3>Fun for all</h3>
                            <p>Whether you're 10 or 100, there’s a Joy Juncture game for you.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Meet the Minds Section */}
            <section className="founders-section animate-on-scroll">
                <div className="section-container">
                    <h2>Meet the Minds Behind the Madness</h2>
                    <div className="profile-cards">
                        <div className="card profile-card animate-on-scroll">
                            <div className="profile-image-container">
                                <img 
                                    src={require('./about-us-images/founder.png')} 
                                    alt="Khushi Poddar" 
                                    className="profile-image" 
                                />
                            </div>
                            <h3>Khushi Poddar</h3>
                            <p className="role-description">“The Dreamer-in-Chief, with a knack for bringing ideas to life.”</p>
                        </div>
                        <div className="card profile-card animate-on-scroll">
                            <div className="profile-image-container">
                                <img 
                                    src={require('./about-us-images/founder.png')} 
                                    alt="Muskan Poddar" 
                                    className="profile-image" 
                                />
                            </div>
                            <h3>Muskan Poddar</h3>
                            <p className="role-description">“The Design Whiz, making sure every card, board, and token looks as amazing as it feels.”</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Contact Section */}
            <div className="animate-on-scroll">
                <ContactSection />
            </div>

            {/* 5. Closing Section */}
            <section className="closing-section animate-on-scroll">
                <div className="closing-content">
                    <h2>Why Choose Joy Juncture?</h2>
                    <blockquote className="closing-quote">“Because life is too short for boring evenings.”</blockquote>
                    <button 
                        className="cta-button"
                        onClick={() => {
                            navigate('/');
                            setTimeout(() => {
                                document.getElementById('play-style')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                        }}
                    >
                        Join the Fun
                    </button>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
