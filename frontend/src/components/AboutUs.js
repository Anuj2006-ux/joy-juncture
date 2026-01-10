import React, { useEffect } from 'react';
import './AboutUs.css';
import deadMansCard from './about-us-images/dead_mans_deck_card.png';
import zombieHanging from './about-us-images/zombie-hanging.png';
import zombieLeaning from './about-us-images/zombie-leaning.png';
import founder from './about-us-images/founder.png';
import user from './about-us-images/user.png';
import bloodSplatter from './about-us-images/blood.png';

function AboutUs() {
  useEffect(() => {
    // Scroll reveal animation
    const revealElements = document.querySelectorAll('.timeline-item');
    
    const revealOnScroll = () => {
      revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          el.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    return () => window.removeEventListener('scroll', revealOnScroll);
  }, []);

  return (
    <div className="about-us-page">
      {/* Section 1: Hero (25% Height) */}
      <section className="hero-section">
        <div className="fog-overlay"></div>
        <h1 className="drip-text">
          <span>A</span><span>B</span><span>O</span><span>U</span><span>T</span>
          <span className="spacer"></span>
          <span>U</span><span>S</span>
        </h1>
      </section>

      {/* Section 2: About + Vision (Dark/Green) */}
      <section className="about-section">
        <div className="container grid-2-col">
          <div className="about-image-wrapper">
            <img src={deadMansCard} alt="Dead Man's Deck Card" className="horror-art" />
            <div className="green-glow"></div>
          </div>
          <div className="about-content">
            <h2>The Apocalypse Begins</h2>
            <p>Joy Juncture isn't just a gaming studio. It's a survival bunker. We build worlds where every card
              drawn could be your last breath. "Dead Man's Deck" was born from our obsession with the macabre and
              the thrill of the unknown.</p>
            <p>We believe games are shared nightmares. Our community doesn't just play; they survive together. Join
              us in the shadows.</p>
          </div>
        </div>
      </section>

      {/* Section 3: Vision Transition */}
      <section className="vision-transition">
        <div className="vision-content">
          <h2>THE QUEST LOG</h2>
          <p>"Leveling Up Since 2020"</p>
        </div>
      </section>

      {/* Section 4: Vertical Timeline */}
      <section className="timeline-section">
        <div className="container">
          <div className="timeline">
            <div className="timeline-line"></div>

            <div className="timeline-item reveal">
              <div className="year">2000</div>
              <div className="description">The Infection Starts. The idea was born in a basement.</div>
            </div>

            <div className="timeline-item reveal">
              <div className="year">2020</div>
              <div className="description">The World Changed. Reality became a horror game.</div>
            </div>

            <div className="timeline-item reveal">
              <div className="year">2025</div>
              <div className="description">Dead Man's Deck Rises. The ultimate survival experience.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4.5: Philosophy (Why Games?) */}
      <section className="philosophy-section">
        <div className="container">
          <h2 className="section-title">Why Games?</h2>
          <p className="section-subtitle">Our goal? To make games that bring people together, because let's be
            honest—nothing bonds people like arguing over rules or laughing at someone's questionable strategy.</p>

          <div className="philosophy-grid">
            <div className="philosophy-item" data-rank="A">
              <div className="icon">♦</div>
              <h3>Connection Over Competition</h3>
              <p>Our games are designed to bring people closer, no matter the outcome.</p>
            </div>
            <div className="philosophy-item" data-rank="K">
              <div className="icon">♦</div>
              <h3>Quality and Creativity</h3>
              <p>From striking illustrations to innovative game mechanics, every detail is meticulously crafted.</p>
            </div>
            <div className="philosophy-item" data-rank="Q">
              <div className="icon">♦</div>
              <h3>Fun For All</h3>
              <p>Whether you're 10 or 100, there's a Joy Juncture game for you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Founder Card (White BG) */}
      <section className="story-section white-bg">
        <div className="container grid-2-col reverse-mobile">
          {/* Founder Card: Khushi */}
          <div className="card-wrapper">
            {/* Hanging Zombie overlay */}
            <img src={zombieHanging} alt="Zombie" className="zombie-hanging" />

            <div className="profile-card founder-card">
              <div className="card-image">
                <img src={founder} alt="Khushi Poddar" />
              </div>
              <div className="card-info">
                <h3>Khushi Poddar</h3>
                <span>The Dreamer-in-Chief</span>
                <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>With a knack for bringing ideas to life.</p>
              </div>
            </div>
          </div>

          {/* Handwritten Text: Origin Story */}
          <div className="handwritten-content">
            <h3 className="blood-title">Our (Accidentally Awesome) Story</h3>
            <p className="blood-text">
              "Honestly? There's no dramatic "lifelong passion" backstory here—just two people who figured out
              they're pretty good at creating chaos and laughter.
              Instead of sticking with the family business (textiles and electricals), we channeled our inner
              entrepreneurs.
              Spoiler: we have no idea what we're doing, but we've got big dreams for a fancy office with a sea
              view and a foosball table."
            </p>
            <img src={bloodSplatter} className="blood-splatter" alt="" />
          </div>
        </div>
      </section>

      {/* Section 6: User Story (White BG) */}
      <section className="story-section white-bg">
        <div className="container grid-2-col">
          {/* Handwritten Text: The Future */}
          <div className="handwritten-content">
            <h3 className="blood-title">Our Mission</h3>
            <p className="blood-text">
              "Spread table-top games' magic wherever we go and build a culture that's all about fun!
              So, hop on board this wild ride—no family legacy here, just two accidental game-makers with a knack
              for turning spontaneous ideas into epic fun!!"
            </p>
          </div>

          {/* Founder Card: Muskan */}
          <div className="card-wrapper">
            {/* Leaning Zombie overlay */}
            <img src={zombieLeaning} alt="Zombie" className="zombie-leaning" />

            <div className="profile-card user-card">
              <div className="card-image">
                <img src={user} alt="Muskan Poddar" />
              </div>
              <div className="card-info">
                <h3>Muskan Poddar</h3>
                <span>The Design Whiz</span>
                <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>Making sure every card looks as amazing as it
                  feels.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Got Questions (Contact) */}
      <section className="contact-section">
        <div className="container">
          <h2 className="contact-title">Got questions?</h2>

          <div className="contact-grid">
            <div className="contact-info">
              <h3>We'd Love to Hear from You</h3>
              <p>Whether you have a question about a game, need help with your order, or just want to share your
                game-night experience, we're here for you!</p>

              <div className="contact-details">
                <p><strong>Email:</strong> <a href="mailto:carejuncture@gmail.com"
                  className="contact-link">carejuncture@gmail.com</a></p>
                <p><strong>DM us on Instagram:</strong> <a href="https://www.instagram.com/joy_juncture/"
                  target="_blank" rel="noopener noreferrer" className="contact-link">@joy_juncture</a></p>
              </div>
            </div>

            <form className="contact-form">
              <div className="form-row">
                <input type="text" name="name" placeholder="Name" required />
                <input type="email" name="email" placeholder="Email *" required />
              </div>
              <div className="form-row">
                <input type="tel" name="phone" placeholder="Phone number" />
              </div>
              <div className="form-row">
                <textarea name="comment" placeholder="Comment" rows="5"></textarea>
              </div>
              <button type="submit" className="submit-btn">Send</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
