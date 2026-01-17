import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config';
import './FreePage.css';

// Import fallback images
import freeChessImg from '../images/free_chess.png';
import freeSudokuImg from '../images/free_sudoku.png';

const FreePage = () => {
  const [freeGames, setFreeGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Fallback free games (Chess and Sudoku)
  const fallbackFreeGames = [
    {
      _id: 'chess-1',
      title: 'Chess',
      description: 'Play the classic game of chess! Challenge your mind with strategic moves.',
      image: freeChessImg,
      gameUrl: '/games/game1/game1.html',
      rating: 4.8,
      isActive: true
    },
    {
      _id: 'sudoku-1',
      title: 'Sudoku',
      description: 'Test your logic skills with this addictive number puzzle game!',
      image: freeSudokuImg,
      gameUrl: '/games/game2/game2.html',
      rating: 4.5,
      isActive: true
    }
  ];

  useEffect(() => {
    fetchFreeGames();
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchFreeGames = async () => {
    try {
      const res = await fetch(API_URL + '/api/games/free');
      const data = await res.json();
      if (data.success && data.freeGames.length > 0) {
        setFreeGames(data.freeGames);
      } else {
        // Use fallback games if API returns empty
        setFreeGames(fallbackFreeGames);
      }
    } catch (error) {
      console.error('Error fetching free games:', error);
      // Use fallback games on error
      setFreeGames(fallbackFreeGames);
    } finally {
      setLoading(false);
    }
  };

  // Filter games based on search
  const filteredGames = searchQuery
    ? freeGames.filter(game => 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : freeGames;

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? "star filled" : "star"}>★</span>
        ))}
      </div>
    );
  };

  const handlePlayGame = (gameUrl) => {
    if (gameUrl) {
      window.location.href = gameUrl;
    }
  };

  if (loading) {
    return (
      <div className="free-page-container">
        <div className="content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <div style={{ textAlign: 'center', color: '#aaa' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎮</div>
            <p>Loading games...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="free-page-container">
      {/* Page Header with Search */}
      <div className="free-page-navbar">
        <div className="nav-left">
          <Link to="/" className="home-btn">
            <i className="fa-solid fa-home"></i> Home
          </Link>
        </div>

        <span className="nav-title">🎮 Free Games</span>

        <div className="nav-icons">
          <div className={`search-container ${searchOpen ? 'active' : ''}`} ref={searchRef}>
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
              />
              <button className="search-btn" onClick={() => setSearchOpen(!searchOpen)}>
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
            {searchOpen && searchQuery && (
              <div className="search-results">
                {filteredGames.length > 0 ? (
                  filteredGames.map(game => (
                    <div
                      key={game._id}
                      className="search-result-item"
                      onClick={() => {
                        if (game.gameUrl) window.location.href = game.gameUrl;
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <img src={game.image} alt={game.title} />
                      <div className="search-result-info">
                        <h4>{game.title}</h4>
                        <p>⭐ {game.rating}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">No games found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="content-area">
        <h1 className="page-title">Free Games</h1>
        {filteredGames.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎮</div>
            <h2 style={{ color: 'white', marginBottom: '10px' }}>No Games Found</h2>
            <p>Try a different search or check back later for free games!</p>
          </div>
        ) : (
          <div className="cards-container">
            {filteredGames.map((game) => (
              <div key={game._id} className="property-card">
                <div className="card-image-container">
                  <img src={game.image} alt={game.title} className="card-image" />
                </div>
                <div className="card-content">
                  <h2 className="card-title">{game.title}</h2>
                  <p className="card-description">{game.description}</p>
                  <div className="card-details">
                    <div className="rating-container">
                      <span className="rating-number">{game.rating}</span>
                      {renderStars(game.rating)}
                    </div>
                  </div>
                  <button 
                    className="reserve-button"
                    onClick={() => handlePlayGame(game.gameUrl)}
                  >
                    Play Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreePage;
