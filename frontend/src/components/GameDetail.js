import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import './GameDetail.css';

function GameDetail() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const games = [
    { 
      "id": "jj01", 
      "title": "Dead Man's Deck", 
      "oldPrice": 1038, 
      "price": 518, 
      "image": "https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=2070&auto=format&fit=crop", 
      "tag": "Sale",
      "players": "2-8 players",
      "time": "Av. 15 min.",
      "age": "Age 14+",
      "description": "Meet Dead Man's Deck, the card game that combines strategy, memory, and a chilling zombie theme to keep you on your toes!",
      "fullDescription": "With every flip of the card, you're one step closer to survival... or succumbing to the undead. But here's the twist: Want to turn up the party? Dead Man's Deck easily transforms into a zombie-themed drinking game",
      "images": [
        "https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1596728147020-f9eb05eb5a24?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571113919002-86f7e06d8186?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611195974059-4e3c6e6d28e6?q=80&w=2070&auto=format&fit=crop"
      ],
      "features": [
        {
          "title": "Dual Gameplay",
          "description": "A thrilling strategy game that doubles as a party drinking game with optional Challenge Cards. Perfect for both intense game nights and lighthearted gatherings"
        },
        {
          "title": "Fast-Paced Speed",
          "description": "Timing is key—beat your opponents to discard Phase and Power Cards or risk being stuck with them!"
        },
        {
          "title": "Epic Showdown Ending",
          "description": "Either discard all your cards first or declare 'NO MORE A ZOMBIE!' and reveal your hand to claim the win. But watch out—if you're wrong, double penalties await"
        },
        {
          "title": "Zombie Memory Showdown",
          "description": "Challenge your memory as you keep track of Phase and Power Cards, adding a level of skill that's unique among party games"
        }
      ]
    },
    { 
      "id": "jj02", 
      "title": "Mehfil – Musical Card Game", 
      "oldPrice": 1038, 
      "price": 518, 
      "image": "https://joyjuncture.com/cdn/shop/files/WhatsApp_Image_2025-11-29_at_13.51.05.jpg?v=1764407325&width=713", 
      "tag": "Hot",
      "players": "3-8 players",
      "time": "Av. 30 min.",
      "age": "Age 12+",
      "description": "Mehfil brings the magic of music to your game nights! Test your Bollywood knowledge and singing skills.",
      "fullDescription": "Challenge your friends to remember lyrics, hum tunes, and compete in musical rounds that will have everyone laughing and singing along.",
      "images": [
        "https://joyjuncture.com/cdn/shop/files/WhatsApp_Image_2025-11-29_at_13.51.05.jpg?v=1764407325&width=713"
      ],
      "features": [
        {
          "title": "Musical Challenge",
          "description": "Test your knowledge of Bollywood songs and melodies in this exciting musical card game"
        },
        {
          "title": "Group Entertainment",
          "description": "Perfect for parties with 3-8 players who love music and fun"
        },
        {
          "title": "Sing & Win",
          "description": "Showcase your singing skills and compete with friends in various musical challenges"
        },
        {
          "title": "Party Favorite",
          "description": "Guaranteed to bring energy and laughter to any gathering"
        }
      ]
    },
    { 
      "id": "jj03", 
      "title": "Tamasha – Bollywood Bid", 
      "oldPrice": 1038, 
      "price": 518, 
      "image": "https://joyjuncture.com/cdn/shop/files/generated_image2.png?v=1764408944&width=713", 
      "tag": "New",
      "players": "4-10 players",
      "time": "Av. 45 min.",
      "age": "Age 16+",
      "description": "The ultimate Bollywood bidding game! Guess the movies, bid on dialogues, and prove you're the ultimate Bollywood fan.",
      "fullDescription": "From classic dialogues to iconic songs, Tamasha tests your Bollywood IQ in the most entertaining way possible.",
      "images": [
        "https://joyjuncture.com/cdn/shop/files/generated_image2.png?v=1764408944&width=713"
      ],
      "features": [
        {
          "title": "Bollywood Trivia",
          "description": "Challenge your knowledge of Hindi cinema with exciting bidding mechanics"
        },
        {
          "title": "Large Group Fun",
          "description": "Perfect for bigger gatherings with 4-10 players"
        },
        {
          "title": "Iconic Moments",
          "description": "Relive the best dialogues and songs from Bollywood classics"
        },
        {
          "title": "Strategic Bidding",
          "description": "Outbid your opponents and prove your Bollywood expertise"
        }
      ]
    },
    { 
      "id": "jj04", 
      "title": "Murder Mystery Case File", 
      "oldPrice": 2598, 
      "price": 1298, 
      "image": "https://joyjuncture.com/cdn/shop/files/WhatsAppImage2025-11-26at22.26.34.jpg?v=1764311510&width=360", 
      "tag": "Best Seller",
      "players": "1-6 players",
      "time": "Av. 90 min.",
      "age": "Age 18+",
      "description": "Solve the mystery! Dive deep into crime scenes, analyze evidence, and catch the killer.",
      "fullDescription": "This immersive murder mystery game features real case files, evidence photos, and detective work that will challenge your investigative skills.",
      "images": [
        "https://joyjuncture.com/cdn/shop/files/WhatsAppImage2025-11-26at22.26.34.jpg?v=1764311510&width=360"
      ],
      "features": [
        {
          "title": "Immersive Investigation",
          "description": "Real case files, evidence photos, and detective work create an authentic mystery experience"
        },
        {
          "title": "Solo or Group",
          "description": "Play alone or with up to 6 players to solve the case together"
        },
        {
          "title": "Extended Gameplay",
          "description": "90 minutes of intense investigation and deduction"
        },
        {
          "title": "Critical Thinking",
          "description": "Test your analytical skills as you piece together clues to identify the killer"
        }
      ]
    },
    { 
      "id": "jj05", 
      "title": "Buzzed – Drinking Game", 
      "oldPrice": 778, 
      "price": 388, 
      "image": "https://joyjuncture.com/cdn/shop/files/generated_image_buzz.png?v=1764409590&width=360", 
      "tag": "18+",
      "players": "3-12 players",
      "time": "Av. 20 min.",
      "age": "Age 18+",
      "description": "Get the party started with Buzzed! The wildest drinking game with hilarious challenges and dares.",
      "fullDescription": "Perfect for adult parties, this game guarantees non-stop laughter with outrageous tasks and drinking rules.",
      "images": [
        "https://joyjuncture.com/cdn/shop/files/generated_image_buzz.png?v=1764409590&width=360"
      ],
      "features": [
        {
          "title": "Party Starter",
          "description": "Get the party going with hilarious challenges and drinking rules"
        },
        {
          "title": "Large Groups",
          "description": "Supports 3-12 players for bigger parties"
        },
        {
          "title": "Quick Rounds",
          "description": "Fast-paced 20-minute sessions keep the energy high"
        },
        {
          "title": "Adults Only",
          "description": "Designed specifically for 18+ audiences with mature content"
        }
      ]
    },
    { 
      "id": "jj06", 
      "title": "Judge Me & Guess", 
      "oldPrice": 1948.70, 
      "price": 1298.70, 
      "image": "https://joyjuncture.com/cdn/shop/files/WhatsApp_Image_2025-11-29_at_14.45.13.jpg?v=1764407770&width=360", 
      "tag": "Sale",
      "players": "4-8 players",
      "time": "Av. 25 min.",
      "age": "Age 14+",
      "description": "How well do you know your friends? Judge their choices and guess their answers in this hilarious party game.",
      "fullDescription": "A game that reveals personalities and creates unforgettable moments as you predict your friends' responses to quirky questions.",
      "images": [
        "https://joyjuncture.com/cdn/shop/files/WhatsApp_Image_2025-11-29_at_14.45.13.jpg?v=1764407770&width=360"
      ],
      "features": [
        {
          "title": "Know Your Friends",
          "description": "Test how well you really know your friends by predicting their answers"
        },
        {
          "title": "Personality Reveal",
          "description": "Discover surprising things about each other through quirky questions"
        },
        {
          "title": "Medium Groups",
          "description": "Perfect for 4-8 players in intimate gatherings"
        },
        {
          "title": "Quick Fun",
          "description": "25-minute sessions that create unforgettable moments"
        }
      ]
    },
    { 
      "id": "jj07", 
      "title": "One More Round | Jigsaw Puzzle", 
      "oldPrice": 843.70, 
      "price": 648.70, 
      "image": "https://joyjuncture.com/cdn/shop/files/IMG_1735.jpg?v=1750756387&width=360", 
      "tag": "Sale",
      "players": "1-4 players",
      "time": "Av. 60 min.",
      "age": "Age 8+",
      "description": "Relax and unwind with this beautiful jigsaw puzzle. Perfect for solo or family puzzle time.",
      "fullDescription": "A challenging yet rewarding puzzle experience featuring stunning artwork that's perfect for relaxation or family bonding.",
      "images": [
        "https://joyjuncture.com/cdn/shop/files/IMG_1735.jpg?v=1750756387&width=360"
      ],
      "features": [
        {
          "title": "Relaxing Activity",
          "description": "Perfect for unwinding and de-stressing with beautiful artwork"
        },
        {
          "title": "Solo or Family",
          "description": "Enjoy alone or with family members for quality bonding time"
        },
        {
          "title": "Challenging Fun",
          "description": "60 minutes of engaging puzzle-solving entertainment"
        },
        {
          "title": "All Ages",
          "description": "Suitable for ages 8+ making it perfect for the whole family"
        }
      ]
    }
  ];

  useEffect(() => {
    const foundGame = games.find(g => g.id === gameId);
    if (foundGame) {
      setGame(foundGame);
    }
  }, [gameId]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    
    const gameData = {
      gameId: game.id,
      title: game.title,
      price: game.price,
      oldPrice: game.oldPrice,
      image: game.image,
      tag: game.tag,
      quantity: quantity
    };
    
    if (token) {
      // Add to backend
      try {
        const response = await fetch(API_URL + '/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(gameData)
        });
        const data = await response.json();
        if (data.success) {
          window.dispatchEvent(new Event('cartUpdated'));
          showToast(`${game.title} added to cart!`);
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    } else {
      // Add to localStorage
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const existingItem = guestCart.find(item => item.gameId === game.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        guestCart.push(gameData);
      }
      
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      window.dispatchEvent(new Event('cartUpdated'));
      showToast(`${game.title} added to cart!`);
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

  if (!game) {
    return <div className="loading">Loading...</div>;
  }

  const displayImages = game.images && game.images.length > 0 ? game.images : [game.image];

  return (
    <div className="game-detail-page">
      <div id="toast-container"></div>
      
      <div className="product-container">
        {/* Left Side - Images */}
        <div className="product-gallery">
          <div className="main-image">
            <img src={displayImages[selectedImage]} alt={game.title} />
          </div>
          <div className="thumbnail-gallery">
            {displayImages.map((img, index) => (
              <div 
                key={index} 
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={img} alt={`${game.title} ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Details */}
        <div className="product-info">
          <h1 className="product-title">{game.title}</h1>
          
          <div className="product-price">
            <span className="old-price">Rs. {game.oldPrice.toFixed(2)}</span>
            <span className="current-price">Rs. {game.price.toFixed(2)}</span>
            <span className="sale-badge">{game.tag}</span>
          </div>

          <p className="product-description">
            {game.description} <strong>{game.fullDescription}</strong>
          </p>

          <div className="quantity-section">
            <label>Quantity</label>
            <div className="quantity-control">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <input type="number" value={quantity} readOnly />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <div className="product-actions">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              Add to cart
            </button>
            <button className="buy-now-btn">
              Buy it now
            </button>
          </div>

          <div className="pickup-info">
            <i className="fa-solid fa-check"></i>
            <div>
              <p><strong>Pickup available at Rajhans Royalton Vesu Canal Road Vesu</strong></p>
              <p className="pickup-time">Usually ready in 1 hour</p>
              <a href="#" className="view-store">View store information</a>
            </div>
          </div>

          {/* Game Specs */}
          <div className="game-specs">
            <div className="spec">
              <i className="fa-solid fa-user-group"></i>
              <span>{game.players}</span>
            </div>
            <div className="spec">
              <i className="fa-regular fa-clock"></i>
              <span>{game.time}</span>
            </div>
            <div className="spec">
              <i className="fa-solid fa-circle-question"></i>
              <span>{game.age}</span>
            </div>
          </div>

          <button className="share-btn">
            <i className="fa-solid fa-share-nodes"></i> Share
          </button>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="key-features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          {game.features.map((feature, index) => (
            <div key={index} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              {index === 0 && <a href="#" className="reviews-link">Reviews →</a>}
            </div>
          ))}
        </div>
        <button className="know-how-btn">Know how to play</button>
      </div>
    </div>
  );
}

export default GameDetail;
