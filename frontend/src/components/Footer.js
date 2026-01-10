import React from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css'; // Importing styles directly for now.

const Footer = () => {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-col footer-logo">
          <img src="https://joyjuncture.com/cdn/shop/files/JJ_Logo.jpg?v=1735415999&width=150" alt="JJ Logo" />
          <p>At Joy Juncture, we believe the best moments in life happen around a table... laughing, bonding, and competing.</p>
        </div>
        <div className="footer-col">
          <h4>Policies</h4>
          <ul>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/refund-policy">Refund Policy</Link></li>
            <li><Link to="/shipping-policy">Shipping Policy</Link></li>
            <li><Link to="/cancellation-policy">Cancellation Policy</Link></li>
            <li><Link to="/terms-conditions">Terms & Conditions</Link></li>
            <li><Link to="/cookie-policy">Cookie Policy</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Programs</h4>
          <ul>
            <li><Link to="/partner-with-us">Partner With Us</Link></li>
            <li><a href="#">Leaderboard</a></li>
            <li><Link to="/amplified-program">Amplified Program</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>JJ Web-App</h4>
          <ul>
            <li>
              <Link to="/#play-style" onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  document.getElementById('play-style')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}>Play 'The Showdown'</Link>
            </li>
            <li><a href="#">My Wallet & Points</a></li>
            <li>
              <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">&copy; 2025 Joy Juncture. All rights reserved.</div>
    </footer>
  );
};

export default Footer;
