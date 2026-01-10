import React from 'react';
import './FreePage.css';

const FreePage = () => {
  const properties = [
    {
      id: 1,
      title: "Crossy road  game",
      description: "pass the road avoiding cars and trucks and reach your destination fully okay",
      image: "https://images8.alphacoders.com/112/thumb-1920-1127402.png",
      rating: 4.5,
      gameUrl: "/games/game1/game1.html"
    },
    {
      id: 2,
      title: "Flappy Bird Game",
      description: "Classic flappy bird game - tap to fly and avoid the pipes. Challenge your reflexes!",
      image: "https://www.shutterstock.com/shutterstock/videos/1100879921/thumb/1.jpg?ip=x480",
      rating: 4.8,
      gameUrl: "/games/game2/game2.html"
    },
    {
      id: 3,
      title: "Beachfront Paradise",
      description: "Modern beachfront property with direct access to pristine white sand beaches and crystal clear waters.",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
      rating: 4.7,
      duration: "4 Night Stay",
      category: "beach"
    },
    {
      id: 4,
      title: "Urban Luxury Loft",
      description: "Contemporary loft in the heart of the city, featuring floor-to-ceiling windows and premium furnishings.",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      rating: 4.6,
      duration: "1 Night Stay",
      category: "apartment"
    },
    {
      id: 5,
      title: "Countryside Estate",
      description: "Spacious estate surrounded by rolling hills and vineyards, ideal for family gatherings and celebrations.",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      rating: 4.9,
      duration: "5 Night Stay",
      category: "estate"
    },
    {
      id: 6,
      title: "Tropical Bungalow",
      description: "Exotic bungalow in a tropical paradise with private garden, outdoor shower, and panoramic ocean views.",
      image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop",
      rating: 4.4,
      duration: "3 Night Stay",
      category: "bungalow"
    }
  ];

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

  return (
    <div className="free-page-container">
      <div className="content-area">
        <h1 className="page-title">Available games</h1>
        <div className="cards-container">
          {properties.map((property) => (
            <div key={property.id} className="property-card">
              <div className="card-image-container">
                <img src={property.image} alt={property.title} className="card-image" />
              </div>
              <div className="card-content">
                <h2 className="card-title">{property.title}</h2>
                <p className="card-description">{property.description}</p>
                <div className="card-details">
                  <div className="rating-container">
                    <span className="rating-number">{property.rating}</span>
                    {renderStars(property.rating)}
                  </div>
                </div>
                <button 
                  className="reserve-button"
                  onClick={() => handlePlayGame(property.gameUrl)}
                >
                  Play Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FreePage;
