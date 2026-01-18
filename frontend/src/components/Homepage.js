import React, { useEffect, useState, useRef } from 'react';
import API_URL from '../config';
import { useNavigate, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import ParticleSystem from './ParticleSystem';
import './Homepage.css';
import playHomeImg from '../images/play_home.png';
import playLiveImg from '../images/play_live.png';
import playOccasionsImg from '../images/play_occasions.png';
import playEarnImg from '../images/play_earn.png';
import freeChessImg from '../images/free_chess.png';
import freeSudokuImg from '../images/free_sudoku.png';

function Homepage() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const heroRef = useRef(null);
  const heroContentRef = useRef(null);
  const heroBgRef = useRef(null);

  const currencies = {
    'INR': { symbol: '₹', rate: 1 },
    'USD': { symbol: '$', rate: 0.012 },
    'EUR': { symbol: '€', rate: 0.011 },
    'GBP': { symbol: '£', rate: 0.0095 },
    'AUD': { symbol: 'A$', rate: 0.018 },
    'AED': { symbol: 'د.إ', rate: 0.044 }
  };

  const convertPrice = (priceInINR) => {
    const currency = currencies[selectedCurrency] || currencies['INR'];
    return Math.round(priceInINR * currency.rate);
  };

  const getCurrencySymbol = () => {
    return currencies[selectedCurrency]?.symbol || '₹';
  };

  useEffect(() => {
    const storedCurrency = localStorage.getItem('selectedCurrency') || 'INR';
    setSelectedCurrency(storedCurrency);

    const handleCurrencyChange = (e) => {
      setSelectedCurrency(e.detail);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
  }, []);

  const fallbackGames = [
    { "id": "jj01", "title": "Dead Man's Deck", "oldPrice": 1038, "price": 518, "image": "https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=2070&auto=format&fit=crop", "tag": "Sale" },
    { "id": "jj02", "title": "Mehfil – Musical Card Game", "oldPrice": 1038, "price": 518, "image": "https://joyjuncture.com/cdn/shop/files/WhatsApp_Image_2025-11-29_at_13.51.05.jpg?v=1764407325&width=713", "tag": "Hot" },
    { "id": "jj03", "title": "Tamasha – Bollywood Bid", "oldPrice": 1038, "price": 518, "image": "https://joyjuncture.com/cdn/shop/files/generated_image2.png?v=1764408944&width=713", "tag": "New" },
    { "id": "jj04", "title": "Murder Mystery Case File", "oldPrice": 2598, "price": 1298, "image": "https://joyjuncture.com/cdn/shop/files/WhatsAppImage2025-11-26at22.26.34.jpg?v=1764311510&width=360", "tag": "Best Seller" },
    { "id": "jj05", "title": "Buzzed – Drinking Game", "oldPrice": 778, "price": 388, "image": "https://joyjuncture.com/cdn/shop/files/generated_image_buzz.png?v=1764409590&width=360", "tag": "18+" },
    { "id": "jj06", "title": "Judge Me & Guess", "oldPrice": 1948.70, "price": 1298.70, "image": "https://joyjuncture.com/cdn/shop/files/WhatsApp_Image_2025-11-29_at_14.45.13.jpg?v=1764407770&width=360", "tag": "Sale" },
    { "id": "jj07", "title": "One More Round | Jigsaw Puzzle", "oldPrice": 843.70, "price": 648.70, "image": "https://joyjuncture.com/cdn/shop/files/IMG_1735.jpg?v=1750756387&width=360", "tag": "Sale" }
  ];

  useEffect(() => {
    // Load games from API with timeout
    const fetchGames = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        console.log('Fetching games from API...');
        const res = await fetch(API_URL + '/api/games', { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await res.json();
        console.log('Games fetched:', data);
        if (data.success && data.games.length > 0) {
          setGames(data.games);
          console.log('Games set from API:', data.games.length);
        } else {
          setGames(fallbackGames);
          console.log('Using fallback games');
        }
      } catch (error) {
        console.error('Error fetching games:', error);
        setGames(fallbackGames); // Use fallback on error
      }
    };
    fetchGames();

    // Create particles (HTML particles for general bg - keeping this separate from 3D hero)
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
      for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        if (Math.random() > 0.5) p.classList.add('square');
        const size = Math.random() * 40 + 10;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.animationDuration = `${Math.random() * 20 + 10}s`;
        p.style.animationDelay = `-${Math.random() * 10}s`;
        particlesContainer.appendChild(p);
      }
    }

    // Optimized Smooth Parallax Effect
    let scrollY = window.scrollY;
    let mouseX = 0;
    let mouseY = 0;

    let currentScrollY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleMouseMove = (e) => {
      // Calculate mouse position relative to center
      mouseX = (window.innerWidth / 2 - e.pageX) / 50;
      mouseY = (window.innerHeight / 2 - e.pageY) / 50;
    };

    let animationFrameId;

    const animateParams = () => {
      // Linear interpolation for smoothness (ease-out effect)
      currentScrollY += (scrollY - currentScrollY) * 0.1;
      currentMouseX += (mouseX - currentMouseX) * 0.1;
      currentMouseY += (mouseY - currentMouseY) * 0.1;

      if (heroContentRef.current) {
        // Content moves opposite to mouse for depth
        heroContentRef.current.style.transform = `translate3d(${-currentMouseX * 1.5}px, ${-currentMouseY * 1.5}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(animateParams);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    // Start animation loop
    animationFrameId = requestAnimationFrame(animateParams);

    // Intersection Observer for scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    setTimeout(() => {
      document.querySelectorAll('.style-card, .game-card, .footer-col').forEach((el, index) => {
        el.classList.add('reveal-element');
        el.style.transitionDelay = `${index % 4 * 0.1}s`;
        observer.observe(el);
      });
    }, 100);

    // Scroll effect for featured projects
    const handleFeaturedScroll = () => {
      const chessImage = document.getElementById('chessImage');
      const sudokuImage = document.getElementById('sudokuImage');

      if (chessImage && sudokuImage) {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const featuredSection = document.querySelector('.featured-projects-section');

        if (featuredSection) {
          const sectionTop = featuredSection.offsetTop;
          const sectionHeight = featuredSection.offsetHeight;

          // Calculate progress through the section (0 to 1)
          const progress = Math.max(0, Math.min(1, (scrollPosition - sectionTop + windowHeight) / (sectionHeight + windowHeight)));

          // Chess gets smaller, Sudoku gets larger
          const chessScale = 1.2 - (progress * 0.5); // 1.2 to 0.7
          const sudokuScale = 0.7 + (progress * 0.5); // 0.7 to 1.2

          chessImage.style.transform = `scale(${chessScale})`;
          sudokuImage.style.transform = `scale(${sudokuScale})`;
        }
      }
    };

    window.addEventListener('scroll', handleFeaturedScroll);
    handleFeaturedScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleFeaturedScroll);
    };
  }, []);

  const triggerConfetti = (x, y) => {
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: y / window.innerHeight, x: x / window.innerWidth },
        colors: ['#39FF14', '#ffffff', '#000000']
      });
    }
  };

  const showToast = (msg) => {
    const container = document.getElementById('toast-container');
    if (container) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${msg}`;
      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 400);
      }, 3000);
    }
  };

  const handleAddToCart = async (game, event) => {
    const rect = event.target.getBoundingClientRect();
    triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);

    const token = localStorage.getItem('token');

    if (token) {
      // Add to backend
      try {
        const response = await fetch(API_URL + '/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            gameId: game.id,
            title: game.title,
            price: game.price,
            oldPrice: game.oldPrice,
            image: game.image,
            tag: game.tag
          })
        });
        const data = await response.json();
        if (data.success) {
          showToast(`${game.title} added to cart!`);
          window.dispatchEvent(new Event('cartUpdated'));
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Failed to add to cart');
      }
    } else {
      // Add to localStorage
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const existingItem = guestCart.find(item => item.gameId === game.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        guestCart.push({
          gameId: game.id,
          title: game.title,
          price: game.price,
          oldPrice: game.oldPrice,
          image: game.image,
          tag: game.tag,
          quantity: 1
        });
      }

      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      showToast(`${game.title} added to cart!`);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const handleConfettiClick = (event) => {
    const rect = event.target.getBoundingClientRect();
    triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  const openQuickView = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  const closeQuickView = () => {
    setModalOpen(false);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <>
      <div className="particles-container" id="particles"></div>
      <div id="toast-container"></div>

      {/* Quick View Modal */}
      <div className={`modal-overlay ${modalOpen ? 'active' : ''}`} onClick={(e) => e.target.className.includes('modal-overlay') && closeQuickView()}>
        <div className="modal-content">
          {selectedGame && (
            <>
              <img src={selectedGame.image} alt={selectedGame.title} className="modal-img" />
              <div className="modal-details">
                <button className="modal-close" onClick={closeQuickView}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
                <span className="modal-tag">{selectedGame.tag}</span>
                <h2 className="modal-title">{selectedGame.title}</h2>
                <div className="modal-price">
                  <span style={{ color: '#666', textDecoration: 'line-through', fontWeight: 400, fontSize: '1rem', margin: 0 }}>
                    {getCurrencySymbol()} {convertPrice(selectedGame.oldPrice)}
                  </span>
                  <span> {getCurrencySymbol()} {convertPrice(selectedGame.price)}.00</span>
                </div>
                <p className="modal-desc">
                  This is the ultimate game for your next party. Packed with laughter, strategy, and endless replay value. Grab it while stocks last!
                </p>
                <button className="cta-btn confetti-btn" style={{ width: '100%', border: 'none', cursor: 'pointer' }} onClick={(e) => { handleAddToCart(selectedGame, e); closeQuickView(); }}>
                  Add to Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero" id="heroSection" ref={heroRef}>
        <div className="hero-bg" id="heroBg" ref={heroBgRef}>
          <Canvas camera={{ position: [0, 0, 10], fov: 45 }} style={{ width: '100%', height: '100%' }}>
            <color attach="background" args={['#e8f5e9']} />
            <ParticleSystem />
          </Canvas>
        </div>
        <div className="hero-content" id="heroContent" ref={heroContentRef}>
          <h1>Life's Best Moments<br />Are Played Together</h1>
          <p>From icebreakers to brain-benders, discover the ultimate collection of games designed to create laughter, strategy, and connection.</p>
          <a href="#games" className="cta-btn confetti-btn" onClick={handleConfettiClick}>Shop The Collection</a>
        </div>
      </section>

      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker">
          <div className="ticker-item"><i className="fa-solid fa-bolt"></i> BLACK FRIDAY LIVE NOW</div>
          <div className="ticker-item"><i className="fa-solid fa-truck-fast"></i> FREE SHIPPING ON ORDERS ₹999+</div>
          <div className="ticker-item"><i className="fa-solid fa-people-group"></i> JOIN 10,000+ PLAYERS</div>
          <div className="ticker-item"><i className="fa-solid fa-gift"></i> GIFT WRAPPING AVAILABLE</div>
          <div className="ticker-item"><i className="fa-solid fa-bolt"></i> BLACK FRIDAY LIVE NOW</div>
          <div className="ticker-item"><i className="fa-solid fa-truck-fast"></i> FREE SHIPPING ON ORDERS ₹999+</div>
          <div className="ticker-item"><i className="fa-solid fa-people-group"></i> JOIN 10,000+ PLAYERS</div>
          <div className="ticker-item"><i className="fa-solid fa-gift"></i> GIFT WRAPPING AVAILABLE</div>
        </div>
      </div>

      {/* Play Style Section */}
      <section className="section-padding" id="play-style">
        <div className="section-title">
          <h2>Choose Your Play Style</h2>
          <span></span>
        </div>
        <div className="play-style-grid">
          <div className="style-card" tabIndex="0">
            <span className="badge">Popular</span>
            <div className="card-image-wrapper">
              <img src={playHomeImg} alt="Play at Home" className="card-image" />
            </div>
            <h3>Play at Home</h3>
            <p>Card games for family & friends. Cozy, social and endlessly replayable.</p>
            <button className="card-cta confetti-btn" onClick={(e) => {
              handleConfettiClick(e);
              const playFreeSection = document.querySelector('.free-games-section');
              if (playFreeSection) {
                const y = playFreeSection.getBoundingClientRect().top + window.pageYOffset - 40;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}>Explore</button>
          </div>
          <div className="style-card" tabIndex="0">
            <span className="badge">Live</span>
            <div className="card-image-wrapper">
              <img src={playLiveImg} alt="Play Together" className="card-image" />
            </div>
            <h3>Play Together (Live)</h3>
            <p>Join our exclusive game nights — laughter guaranteed.</p>
            <button className="card-cta confetti-btn" onClick={(e) => { handleConfettiClick(e); navigate('/events'); }}>Join Now</button>
          </div>
          <div className="style-card" tabIndex="0">
            <span className="badge">Events</span>
            <div className="card-image-wrapper">
              <img src={playOccasionsImg} alt="Occasions" className="card-image" />
            </div>
            <h3>Play for Occasions</h3>
            <p>Perfect for weddings, parties & special celebrations.</p>
            <button className="card-cta confetti-btn" onClick={(e) => { handleConfettiClick(e); navigate('/events'); }}>Plan an Event</button>
          </div>
          <div className="style-card" tabIndex="0">
            <span className="badge">Top Pick</span>
            <div className="card-image-wrapper">
              <img src={playEarnImg} alt="Play & Earn" className="card-image" />
            </div>
            <h3>Play & Earn</h3>
            <p>Win points, unlock rewards and climb the leaderboard.</p>
            <button className="card-cta confetti-btn" onClick={(e) => { handleConfettiClick(e); navigate('/enter'); }}>Start Earning</button>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="section-padding dark-section" id="games">
        <div className="section-title">
          <h2>Black Friday Sale is Live 🔥</h2>
          <span></span>
        </div>
        <div className="game-grid">
          {games.slice(0, 3).map((game) => (
            <div className="game-card" key={game.id}>
              <div className="card-img-container">
                <span className="sale-badge">{game.tag}</span>
                <div className="card-overlay"></div>
                <img src={game.image} alt={game.title} />
                <div className="card-actions">
                  <button className="action-btn primary" onClick={(e) => handleAddToCart(game, e)}>
                    <i className="fa-solid fa-cart-shopping"></i> Add
                  </button>
                  <button className="action-btn" onClick={() => {
                    const detailPages = { 'jj01': '/deals/g1.html', 'jj02': '/deals/g2.html', 'jj03': '/deals/g3.html' };
                    window.location.href = detailPages[game.id] || '#';
                  }}>
                    <i className="fa-regular fa-eye"></i> View Details
                  </button>
                </div>
              </div>
              <div className="card-info">
                <h3>{game.title}</h3>
                <div className="price-block">
                  <span className="old-price">{getCurrencySymbol()} {convertPrice(game.oldPrice)}</span>
                  <span className="new-price">{getCurrencySymbol()} {convertPrice(game.price)}.00</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="view-more-container">
          <button className="view-more-btn" onClick={() => window.location.href = '/deals/gamepage.html'}>View All Deals</button>
        </div>
      </section>

      {/* Orange Strip */}
      <div className="orange-strip">
        <h2>Life's best moments are born from laughter, strategy, and a little friendly competition. Ready to play?</h2>
      </div>

      {/* Free Games Section */}
      <section className="free-games-section" id="free-games">
        <div className="section-title">
          <h2>Play For Free</h2>
          <span></span>
        </div>
        <div className="free-games-grid">
          <div className="free-game-card">
            <div className="free-game-image">
              <img src={freeChessImg} alt="Chess" />
            </div>
            <div className="free-game-info">
              <h3>Chess</h3>
              <button className="free-game-play-btn" onClick={() => window.location.href = '/games/game1/game1.html'}>Play Now</button>
            </div>
          </div>
          <div className="free-game-card">
            <div className="free-game-image">
              <img src={freeSudokuImg} alt="Sudoku" />
            </div>
            <div className="free-game-info">
              <h3>Sudoku</h3>
              <button className="free-game-play-btn" onClick={() => window.location.href = '/games/game2/game2.html'}>Play Now</button>
            </div>
          </div>
        </div>
        <div className="view-more-container">
          <button className="view-more-btn" onClick={() => navigate('/freegames')}>View All Free Games</button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding faq-section">
        <div className="section-title">
          <h2 style={{ color: 'white' }}>MOST ASKED... or shall we say.. MOST DOUBTED</h2>
          <span></span>
        </div>
        <div className="faq-container">
          <div className={`faq-item ${activeFaq === 0 ? 'active' : ''}`} onClick={() => toggleFaq(0)}>
            <div className="faq-question">Why the name "Joy Juncture"? <i className="fa-solid fa-chevron-down"></i></div>
            <div className="faq-answer" style={{ maxHeight: activeFaq === 0 ? '500px' : '0', overflow: 'hidden' }}>
              <div className="faq-answer-inner">
                Because we believe in the intersection of joy, people, and play! It's where fun meets strategy.
              </div>
            </div>
          </div>
          <div className={`faq-item ${activeFaq === 1 ? 'active' : ''}`} onClick={() => toggleFaq(1)}>
            <div className="faq-question">Do you host game nights? <i className="fa-solid fa-chevron-down"></i></div>
            <div className="faq-answer" style={{ maxHeight: activeFaq === 1 ? '500px' : '0', overflow: 'hidden' }}>
              <div className="faq-answer-inner">
                Yes! We host weekly events in major cities. Check our Events tab for tickets.
              </div>
            </div>
          </div>
          <div className={`faq-item ${activeFaq === 2 ? 'active' : ''}`} onClick={() => toggleFaq(2)}>
            <div className="faq-question">Can I play these games with strangers? <i className="fa-solid fa-chevron-down"></i></div>
            <div className="faq-answer" style={{ maxHeight: activeFaq === 2 ? '500px' : '0', overflow: 'hidden' }}>
              <div className="faq-answer-inner">
                Absolutely. Our games are designed to be the ultimate icebreakers.
              </div>
            </div>
          </div>
          <div className={`faq-item ${activeFaq === 3 ? 'active' : ''}`} onClick={() => toggleFaq(3)}>
            <div className="faq-question">What age group are these games for? <i className="fa-solid fa-chevron-down"></i></div>
            <div className="faq-answer" style={{ maxHeight: activeFaq === 3 ? '500px' : '0', overflow: 'hidden' }}>
              <div className="faq-answer-inner">
                Most of our games are perfect for ages 12+. We also have adult-exclusive games (18+) clearly marked in our collection.
              </div>
            </div>
          </div>
          <div className={`faq-item ${activeFaq === 4 ? 'active' : ''}`} onClick={() => toggleFaq(4)}>
            <div className="faq-question">Do you offer international shipping? <i className="fa-solid fa-chevron-down"></i></div>
            <div className="faq-answer" style={{ maxHeight: activeFaq === 4 ? '500px' : '0', overflow: 'hidden' }}>
              <div className="faq-answer-inner">
                Currently, we ship within India. International shipping is coming soon! Stay tuned for updates.
              </div>
            </div>
          </div>
          <div className={`faq-item ${activeFaq === 5 ? 'active' : ''}`} onClick={() => toggleFaq(5)}>
            <div className="faq-question">Can I return a game if I don't like it? <i className="fa-solid fa-chevron-down"></i></div>
            <div className="faq-answer" style={{ maxHeight: activeFaq === 5 ? '500px' : '0', overflow: 'hidden' }}>
              <div className="faq-answer-inner">
                Yes! We offer a 7-day return policy for unopened games. Check our Refund Policy page for complete details.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer is now in App.js */}
    </>
  );
}

export default Homepage;
