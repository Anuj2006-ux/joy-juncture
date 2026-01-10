import React, { useState } from 'react';
import './Checkout.css';

const Checkout = () => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cvv: '',
    expiryDate: '',
    cardHolder: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Payment processing logic would go here!');
  };

  return (
    <div className="checkout-container">
      <div className="checkout-box">
        <h1>Secure Checkout</h1>
        <div className="payment-icons">
          <i className="fa-brands fa-cc-visa"></i>
          <i className="fa-brands fa-cc-mastercard"></i>
          <i className="fa-brands fa-cc-amex"></i>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Card Holder Name</label>
            <input 
              type="text" 
              name="cardHolder" 
              placeholder="John Doe" 
              value={formData.cardHolder}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label>Card Number</label>
            <input 
              type="text" 
              name="cardNumber" 
              placeholder="0000 0000 0000 0000" 
              value={formData.cardNumber}
              onChange={handleChange}
              maxLength="19"
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <input 
                type="text" 
                name="expiryDate" 
                placeholder="MM/YY" 
                value={formData.expiryDate}
                onChange={handleChange}
                maxLength="5"
                required 
              />
            </div>
            
            <div className="form-group">
              <label>CVV</label>
              <input 
                type="password" 
                name="cvv" 
                placeholder="123" 
                value={formData.cvv}
                onChange={handleChange}
                maxLength="3"
                required 
              />
            </div>
          </div>

          <button type="submit" className="pay-btn">
            Pay Securely <i className="fa-solid fa-lock"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
