import React from 'react';
import { Link } from 'react-router-dom';
import './Blog.css';
import blogGeneral from './blog-images/bloggeneral.webp';
import tripToUdaipur from './blog-images/triptoudaipur.webp';
import creativeWays from './blog-images/creativewaytoplay.webp';
import gameplayQuestions from './blog-images/gameplayquestionindeadmansdeck.webp';
import howToPlay from './blog-images/howtoplaydeadmandeck.webp';
import powerCards from './blog-images/powercardindeadmansdeck.webp';

function Blog() {
  return (
    <div className="blog-page">
      {/* Blog Page Header */}
      <header className="blog-header">
        <h1 className="journal-title">The JJ Blog Journal</h1>
        <p className="journal-subtitle">Stories from our game nights, play trips, and Dead Man's Deck adventures</p>
      </header>

      {/* Main Content */}
      <main className="blog-container">
        {/* Featured Blog Story */}
        <article className="featured-story">
          <div className="featured-image-wrapper">
            <img src={blogGeneral} alt="Murder Mystery Game Night at Primarc Pecan HQ Mumbai" className="featured-image" />
          </div>
          <div className="featured-content">
            <h2 className="featured-title">Murder Mystery Game Night at Primarc Pecan HQ, Mumbai</h2>
            <p className="featured-excerpt">
              When Primarc Pecan's Head Office in Mumbai wanted to break the monotony of a regular workday and
              bring their teams together, they called Joy Juncture... your go-to creators of unforgettable
              experiences. We transformed an ordinary office evening into a thrilling murder mystery game night
              that had everyone on the edge of their seats.
            </p>
            <a href="/blogs/murder-mystery.html" className="read-more">Read Full Story</a>
          </div>
        </article>

        {/* Blog Grid Section */}
        <section className="blog-grid">
          {/* Blog Card 1 */}
          <article className="blog-card">
            <div className="card-image-wrapper">
              <img src={tripToUdaipur} alt="Haus of Joy: A play-trip to Udaipur" className="card-image" />
            </div>
            <div className="card-content">
              <h3 className="card-title">Haus of Joy: A play-trip to Udaipur</h3>
              <p className="card-description">
                Joy Juncture x Pickle Haus curated Haus of Joy; a 3-day play trip to Udaipur with 30 strangers,
                JJ original card games, pickleball tournaments, late-night dancing, and unforgettable bonding.
                Read about this epic adventure.
              </p>
              <a href="/blogs/haus-of-joy.html" className="card-link">Read Story</a>
            </div>
          </article>

          {/* Blog Card 2 */}
          <article className="blog-card">
            <div className="card-image-wrapper">
              <img src={creativeWays} alt="Creative Ways to Play Dead Man's Deck" className="card-image" />
            </div>
            <div className="card-content">
              <h3 className="card-title">Creative Ways to Play Dead Man's Deck</h3>
              <p className="card-description">
                Explore exciting twists to Dead Man's Deck! From party modes to money pots, food dares, and new
                scoring twists, here are alternate ways to keep the game fresh, competitive, and absolutely
                thrilling.
              </p>
              <a href="/blogs/creative-ways.html" className="card-link">Read Story</a>
            </div>
          </article>

          {/* Blog Card 3 */}
          <article className="blog-card">
            <div className="card-image-wrapper">
              <img src={gameplayQuestions} alt="Gameplay Questions in Dead Man's Deck" className="card-image" />
            </div>
            <div className="card-content">
              <h3 className="card-title">Gameplay Questions Answered - Dead Man's Deck FAQs</h3>
              <p className="card-description">
                Get answers to common gameplay doubts in Dead Man's Deck. Learn about discard rules, Power Card
                effects, game ending conditions, and scoring tie-breakers. Your complete FAQ guide.
              </p>
              <a href="/blogs/faqs.html" className="card-link">Read Story</a>
            </div>
          </article>

          {/* Blog Card 4 */}
          <article className="blog-card">
            <div className="card-image-wrapper">
              <img src={howToPlay} alt="How to Play Dead Man's Deck" className="card-image" />
            </div>
            <div className="card-content">
              <h3 className="card-title">How to Play Dead Man's Deck?</h3>
              <p className="card-description">
                Learn how to play Dead Man's Deck, a memory-based strategy card game by Joy Juncture. Understand
                the rules, setup, scoring, and special actions in this simple guide for first-time players.
              </p>
              <a href="/blogs/how-to-play.html" className="card-link">Read Story</a>
            </div>
          </article>

          {/* Blog Card 5 */}
          <article className="blog-card">
            <div className="card-image-wrapper">
              <img src={powerCards} alt="Power Cards in Dead Man's Deck" className="card-image" />
            </div>
            <div className="card-content">
              <h3 className="card-title">Power Cards in Dead Man's Deck</h3>
              <p className="card-description">
                Learn the meaning and effects of each Power Card in Dead Man's Deck. Use this guide to play
                smarter, confuse opponents, and lower your score strategically. Master the power cards!
              </p>
              <a href="/blogs/power-cards.html" className="card-link">Read Story</a>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default Blog;
