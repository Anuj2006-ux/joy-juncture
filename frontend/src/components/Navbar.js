import React, { useState, useEffect, useRef } from 'react';
import API_URL from '../config';
import { Link, useLocation } from 'react-router-dom';
import Cart from './Cart';
import ProfilePopup from './ProfilePopup';
import './Navbar.css';
import logo from '../images/Web-log.png';

function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);
  const [currencyDropdown, setCurrencyDropdown] = useState(false);
  const profileRef = useRef(null);
  const currencyRef = useRef(null);
  const searchRef = useRef(null);
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('selectedCurrency') || 'INR';
  });

  const currencies = [
    { code: 'INR', symbol: '₹', name: 'India', rate: 1 },
    { code: 'USD', symbol: '$', name: 'United States', rate: 0.012 },
    { code: 'EUR', symbol: '€', name: 'Europe', rate: 0.011 },
    { code: 'GBP', symbol: '£', name: 'United Kingdom', rate: 0.0095 },
    { code: 'AUD', symbol: 'A$', name: 'Australia', rate: 0.018 },
    { code: 'AED', symbol: 'د.إ', name: 'UAE', rate: 0.044 }
  ];

  const getCurrentCurrency = () => currencies.find(c => c.code === selectedCurrency) || currencies[0];

  const convertPrice = (priceInINR) => {
    const currency = getCurrentCurrency();
    return Math.round(priceInINR * currency.rate);
  };

  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency);
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: selectedCurrency }));
  }, [selectedCurrency]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setCurrencyDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [games, setGames] = useState([]);

  useEffect(() => {
    // Fetch games for search
    const fetchGames = async () => {
      try {
        const res = await fetch(API_URL + '/api/games');
        const data = await res.json();
        if (data.success) {
          setGames(data.games);
        } else {
             // Fallback hardcoded if API fails
            setGames([
                { "id": "jj01", "title": "Dead Man's Deck", "oldPrice": 1038, "price": 518, "image": "https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=2070&auto=format&fit=crop", "tag": "Sale" },
                { "id": "jj02", "title": "Mehfil – Musical Card Game", "oldPrice": 1038, "price": 518, "image": "https://joyjuncture.com/cdn/shop/files/WhatsApp_Image_2025-11-29_at_13.51.05.jpg?v=1764407325&width=713", "tag": "Hot" },
                { "id": "jj03", "title": "Tamasha – Bollywood Bid", "oldPrice": 1038, "price": 518, "image": "https://joyjuncture.com/cdn/shop/files/generated_image2.png?v=1764408944&width=713", "tag": "New" },
                { "id": "jj04", "title": "Murder Mystery Case File", "oldPrice": 2598, "price": 1298, "image": "https://joyjuncture.com/cdn/shop/files/WhatsAppImage2025-11-26at22.26.34.jpg?v=1764311510&width=360", "tag": "Best Seller" },
                { "id": "jj05", "title": "Buzzed – Drinking Game", "oldPrice": 778, "price": 388, "image": "https://joyjuncture.com/cdn/shop/files/generated_image_buzz.png?v=1764409590&width=360", "tag": "18+" },
                { "id": "jj06", "title": "Judge Me & Guess", "oldPrice": 1948.70, "price": 1298.70, "image": "https://joyjuncture.com/cdn/shop/files/WhatsApp_Image_2025-11-29_at_14.45.13.jpg?v=1764407770&width=360", "tag": "Sale" },
                { "id": "jj07", "title": "One More Round | Jigsaw Puzzle", "oldPrice": 843.70, "price": 648.70, "image": "https://joyjuncture.com/cdn/shop/files/IMG_1735.jpg?v=1750756387&width=360", "tag": "Sale" }
            ]);
        }
      } catch (error) {
        console.error('Error fetching games for search:', error);
      }
    };
    fetchGames();
  }, []);

  const filteredGames = searchQuery 
    ? games.filter(game => game.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : games;

  useEffect(() => {
    // Check if user is logged in
    checkUserLogin();

    // Update cart count
    updateCartCount();

    // Listen for cart updates and user login
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('userLoggedIn', checkUserLogin);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('userLoggedIn', checkUserLogin);
    };
  }, [cartOpen]);

  const checkUserLogin = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Fetch fresh user data from backend
        const response = await fetch(API_URL + '/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          // Token invalid, clear data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        // Fallback to localStorage if fetch fails
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (e) {
            setUser(null);
          }
        }
      }
    } else {
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfileDropdown(false);
    window.location.href = '/';
  };

  const updateCartCount = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch from backend
      fetch(API_URL + '/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.cart) {
            const count = data.cart.items.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(count);
          }
        })
        .catch(err => console.error('Error fetching cart:', err));
    } else {
      // Get from localStorage
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const count = guestCart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    }
  };

  const handleAddToCart = async (game) => {
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
          updateCartCount();
          window.dispatchEvent(new Event('cartUpdated'));
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
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
      updateCartCount();
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  if (location.pathname === '/login') {
    return null;
  }

  return (
    <>
      <header>
        <div className="top-bar">
          <div className="social-icons">
            <a href="https://www.instagram.com/joy_juncture/#" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram"></i></a>
            <a href="https://www.youtube.com/@Joy_Juncture" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-youtube"></i></a>
            <a href="#" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-x-twitter"></i></a>
            <a href="https://www.pinterest.com/joy_juncture/" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-pinterest"></i></a>
          </div>
          <div className="top-message">✨ Warning: Entering a joy-packed zone!! ✨</div>
          <div className="currency-selector" ref={currencyRef} onClick={() => setCurrencyDropdown(!currencyDropdown)}>
            {getCurrentCurrency().name} | {getCurrentCurrency().code} {getCurrentCurrency().symbol} <i className="fa-solid fa-chevron-down"></i>
            {currencyDropdown && (
              <div className="currency-dropdown">
                {currencies.map(currency => (
                  <div
                    key={currency.code}
                    className={`currency-option ${selectedCurrency === currency.code ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCurrency(currency.code);
                      setCurrencyDropdown(false);
                    }}
                  >
                    {currency.name} | {currency.code} {currency.symbol}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="main-nav">
          <a href="#" className="logo">
            <img src={logo} alt="Joy Juncture Logo" />
          </a>

          <ul className="nav-links">
            <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}><Link to="/">Home</Link></li>

            <li className="nav-item">
              <a href="/deals/gamepage.html">Shopping</a>
            </li>

            <li className="nav-item">
              <a href="#">Experiences <i className="fa-solid fa-chevron-down"></i></a>
              <ul className="dropdown-menu">
                <li><a href="/corporate.html">Corporate Events <span>👔</span></a></li>
                <li><a href="/weddings.html">Weddings <span>💍</span></a></li>
                <li><a href="/birthdays.html">Birthdays <span>🎂</span></a></li>
                <li><a href="/gamezones.html">Game Zones <span>🕹️</span></a></li>
              </ul>
            </li>

            <li className="nav-item highlight-btn">
              <Link to="/#play-style" style={{ fontWeight: 800 }} onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  document.getElementById('play-style')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}>Play The Showdown 🚀</Link>
            </li>

            <li className="nav-item">
              <a href="#">Events</a>
            </li>

            <li className="nav-item">
              <a href="#">Community <i className="fa-solid fa-chevron-down"></i></a>
              <ul className="dropdown-menu">
                <li><Link to="/blog">Blog <span>✍️</span></Link></li>
                <li><a href="#">Wallet & Points <span>💰</span></a></li>
                <li><Link to="/about-us">About us <span>❤️</span></Link></li>
              </ul>
            </li>
          </ul>

          <div className="nav-icons">
            <div className={`search-box ${searchOpen ? 'active' : ''}`} ref={searchRef}>
              <input
                className="search-txt"
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn" onClick={() => setSearchOpen(!searchOpen)}>
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>

              {searchOpen && (
                <div className="inline-search-results">
                  {filteredGames.length > 0 ? (
                    filteredGames.map(game => (
                      <div key={game.id} className="search-result-item" onClick={() => { setSelectedGame(game); setModalOpen(true); setSearchOpen(false); setSearchQuery(''); }}>
                        <img src={game.image} alt={game.title} />
                        <div className="search-result-info">
                          <h4>{game.title}</h4>
                          <p>{getCurrentCurrency().symbol} {convertPrice(game.price)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results" style={{ color: '#aaa', padding: '10px', fontSize: '0.9rem' }}>No games found</div>
                  )}
                </div>
              )}
            </div>

            <div className="profile-wrapper" ref={profileRef}>
              <button
                className="icon-btn user"
                onClick={() => setProfileDropdown(!profileDropdown)}
              >
                <i className="fa-regular fa-user"></i>
              </button>

              {profileDropdown && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      {user ? (
                        user.profilePicture ? (
                          <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                          (user.name || user.username || 'U').charAt(0).toUpperCase()
                        )
                      ) : (
                        'G'
                      )}
                    </div>
                    <div className="profile-info">
                      <h4>{user ? (user.name || user.username) : 'Guest'}</h4>
                      <p>{user ? user.email : 'Not logged in'}</p>
                    </div>
                  </div>
                  <div className="profile-menu">
                    {user ? (
                      <>
                        {user.role === 'admin' && (
                          <Link to="/admin" onClick={() => setProfileDropdown(false)} className="admin-link">
                            <i className="fa-solid fa-gauge-high"></i> Admin Dashboard
                          </Link>
                        )}
                        <a href="#" onClick={(e) => { e.preventDefault(); setProfileDropdown(false); setProfilePopupOpen(true); }}><i className="fa-solid fa-user"></i> My Profile</a>
                        <a href="#"><i className="fa-solid fa-box"></i> Orders</a>
                        <a href="#"><i className="fa-solid fa-wallet"></i> Wallet</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                          <i className="fa-solid fa-right-from-bracket"></i> Logout
                        </a>
                      </>
                    ) : (
                      <Link to="/login" onClick={() => setProfileDropdown(false)}>
                        <i className="fa-solid fa-right-to-bracket"></i> Login
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button className="icon-btn cart" onClick={() => setCartOpen(true)}>
              <i className="fa-solid fa-bag-shopping"></i>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <div className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <i className="fa-solid fa-bars"></i>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu-header">
            <img src={logo} alt="Joy Juncture Logo" className="mobile-logo" />
            <button className="mobile-close" onClick={() => setMobileMenuOpen(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <ul className="mobile-nav-links">
            <li><Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
            <li><a href="/deals/gamepage.html" onClick={() => setMobileMenuOpen(false)}>Shopping</a></li>
            <li className="mobile-dropdown">
              <span>Experiences <i className="fa-solid fa-chevron-down"></i></span>
              <ul className="mobile-submenu">
                <li><a href="/corporate.html" onClick={() => setMobileMenuOpen(false)}>Corporate Events 👔</a></li>
                <li><a href="/weddings.html" onClick={() => setMobileMenuOpen(false)}>Weddings 💍</a></li>
                <li><a href="/birthdays.html" onClick={() => setMobileMenuOpen(false)}>Birthdays 🎂</a></li>
                <li><a href="/gamezones.html" onClick={() => setMobileMenuOpen(false)}>Game Zones 🕹️</a></li>
              </ul>
            </li>
            <li className="mobile-highlight">
              <Link to="/#play-style" onClick={() => setMobileMenuOpen(false)}>Play The Showdown 🚀</Link>
            </li>
            <li><a href="#" onClick={() => setMobileMenuOpen(false)}>Events</a></li>
            <li className="mobile-dropdown">
              <span>Community <i className="fa-solid fa-chevron-down"></i></span>
              <ul className="mobile-submenu">
                <li><Link to="/blog" onClick={() => setMobileMenuOpen(false)}>Blog ✍️</Link></li>
                <li><a href="#" onClick={() => setMobileMenuOpen(false)}>Wallet & Points 💰</a></li>
                <li><Link to="/about-us" onClick={() => setMobileMenuOpen(false)}>About us ❤️</Link></li>
              </ul>
            </li>
          </ul>
          {user ? (
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <div className="mobile-avatar">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" />
                  ) : (
                    (user.name || user.username || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <span>{user.name || user.username}</span>
              </div>
              <button className="mobile-logout" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                Logout <i className="fa-solid fa-right-from-bracket"></i>
              </button>
            </div>
          ) : (
            <Link to="/login" className="mobile-login-btn" onClick={() => setMobileMenuOpen(false)}>
              Login / Sign Up
            </Link>
          )}
        </div>
        {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>}
      </header>

      {/* Search Modal */}


      {/* Quick View Modal */}
      {modalOpen && selectedGame && (
        <div className={`modal-overlay ${modalOpen ? 'active' : ''}`} onClick={(e) => e.target.className.includes('modal-overlay') && setModalOpen(false)}>
          <div className="modal-content">
            <img src={selectedGame.image} alt={selectedGame.title} className="modal-img" />
            <div className="modal-details">
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
              <span className="modal-tag">{selectedGame.tag}</span>
              <h2 className="modal-title">{selectedGame.title}</h2>
              <div className="modal-price">
                <span style={{ color: '#666', textDecoration: 'line-through', fontWeight: 400, fontSize: '1rem', margin: 0 }}>
                  {getCurrentCurrency().symbol} {convertPrice(selectedGame.oldPrice)}
                </span>
                <span> {getCurrentCurrency().symbol} {convertPrice(selectedGame.price)}.00</span>
              </div>
              <p className="modal-desc">
                This is the ultimate game for your next party. Packed with laughter, strategy, and endless replay value. Grab it while stocks last!
              </p>
              <button className="cta-btn" style={{ width: '100%', border: 'none', cursor: 'pointer' }} onClick={() => { handleAddToCart(selectedGame); setModalOpen(false); }}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Profile Popup */}
      <ProfilePopup isOpen={profilePopupOpen} onClose={() => setProfilePopupOpen(false)} />
    </>
  );
}

export default Navbar;
