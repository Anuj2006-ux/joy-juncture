import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

function Cart({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useEffect(() => {
    loadCart();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [isOpen]);

  const loadCart = () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      // Fetch cart from backend for logged-in users
      fetchCartFromBackend(token);
      setShowWarning(false);
    } else {
      // Load cart from localStorage for guest users
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      setCartItems(guestCart);
      // Always show warning for guest users
      setShowWarning(true);
    }
  };

  const fetchCartFromBackend = async (token) => {
    try {
      const response = await fetch(API_URL + '/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && data.cart) {
        setCartItems(data.cart.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const updateQuantity = async (gameId, newQuantity) => {
    if (newQuantity < 1) return;

    if (isLoggedIn) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL + `/api/cart/update/${gameId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity: newQuantity })
        });
        const data = await response.json();
        if (data.success) {
          setCartItems(data.cart.items || []);
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    } else {
      // Update guest cart
      const updatedCart = cartItems.map(item =>
        item.gameId === gameId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedCart);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
    }
  };

  const removeItem = async (gameId) => {
    if (isLoggedIn) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL + `/api/cart/remove/${gameId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setCartItems(data.cart.items || []);
        }
      } catch (error) {
        console.error('Error removing item:', error);
      }
    } else {
      // Remove from guest cart
      const updatedCart = cartItems.filter(item => item.gameId !== gameId);
      setCartItems(updatedCart);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Your cart</h2>
          <button className="cart-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {!isLoggedIn && (
          <div className="cart-warning">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <p>You're not logged in. Cart items will be lost after leaving the website.</p>
          </div>
        )}

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <i className="fa-solid fa-cart-shopping"></i>
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="cart-items-header">
                <span>PRODUCT</span>
                <span>TOTAL</span>
              </div>
              
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.gameId} className="cart-item">
                    <img src={item.image} alt={item.title} />
                    <div className="cart-item-details">
                      <div className="cart-item-info">
                        <p className="cart-item-vendor">JOY JUNCTURE</p>
                        <h4>{item.title}</h4>
                        <p className="cart-item-price">Rs. {item.price}</p>
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item.gameId, item.quantity - 1)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.gameId, item.quantity + 1)}>+</button>
                        </div>
                        <button className="remove-item" onClick={() => removeItem(item.gameId)}>
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-total">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-footer">
                <div className="cart-total">
                  <span>Estimated total</span>
                  <span className="total-price">Rs. {calculateTotal()}</span>
                </div>
                <p className="cart-note">Taxes, discounts and shipping calculated at checkout.</p>
                <button className="checkout-btn" onClick={() => { onClose(); navigate('/checkout'); }}>Check out</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Cart;
