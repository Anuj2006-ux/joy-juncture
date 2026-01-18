import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config';
import './FreePage.css';

// Import fallback images
import gameMemoryImg from '../images/game_memory.svg';
import gameSweeperImg from '../images/game_sweeper.svg';
import gamePuzzleImg from '../images/game_puzzle.svg';
import gameTicTacToeImg from '../images/game_tictactoe.svg';
import gameSnakeImg from '../images/game_snake.svg';
import gameColorushImg from '../images/game_colorush.svg';

const FreePage = () => {
  const [freeGames, setFreeGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Fallback free games
  const fallbackFreeGames = [
    {
      _id: 'memory-1',
      title: 'Memory Match',
      description: 'Match pairs of cards to test your memory! Find all matching pairs to win.',
      image: gameMemoryImg,
      gameUrl: '/games/memory-match/index.html',
      rating: 4.8,
      isActive: true
    },
    {
      _id: 'sweeper-1',
      title: 'Gem Sweeper',
      description: 'Find all the gems without hitting the bombs! A classic puzzle challenge.',
      image: gameSweeperImg,
      gameUrl: '/games/gem-sweeper/index.html',
      rating: 4.7,
      isActive: true
    },
    {
      _id: 'puzzle-1',
      title: 'Puzzle Slider',
      description: 'Slide the tiles to arrange numbers in order. How fast can you solve it?',
      image: gamePuzzleImg,
      gameUrl: '/games/puzzle-slider/index.html',
      rating: 4.6,
      isActive: true
    },
    {
      _id: 'tictactoe-1',
      title: 'Tic Tac Toe',
      description: 'The classic X and O game! Play against AI or challenge a friend.',
      image: gameTicTacToeImg,
      gameUrl: '/games/tic-tac-toe/index.html',
      rating: 4.5,
      isActive: true
    },
    {
      _id: 'snake-1',
      title: 'Snake Game',
      description: 'Control the snake and eat food to grow! Avoid hitting walls and yourself.',
      image: gameSnakeImg,
      gameUrl: '/games/snake-game/index.html',
      rating: 4.9,
      isActive: true
    },
    {
      _id: 'colorush-1',
      title: 'Color Rush',
      description: 'Test your brain! Match the COLOR of the word, not what it says.',
      image: gameColorushImg,
      gameUrl: '/games/color-rush/index.html',
      rating: 4.7,
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
        <div className="content-area">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading games...</p>
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
        <p className="page-subtitle">Play these fun games for free - no purchase required!</p>
        {filteredGames.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-gamepad"></i>
            <h3>No Games Found</h3>
            <p>Try a different search or check back later for more games!</p>
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
