import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ScrollToTop from './components/ScrollToTop';
import Enter from './components/enter';
import FreePage from './components/FreePage';
import Homepage from './components/Homepage';
import Navbar from './components/Navbar';
import AboutUs from './components/AboutUs';
import Blog from './components/Blog';
import Auth from './components/Auth';
import AmplifiedProgram from './components/AmplifiedProgram';
import CancellationPolicy from './components/CancellationPolicy';
import CookiePolicy from './components/CookiePolicy';
import PartnerWithUs from './components/PartnerWithUs';
import PrivacyPolicy from './components/PrivacyPolicy';
import RefundPolicy from './components/RefundPolicy';
import TermsConditions from './components/TermsConditions';
import ShippingPolicy from './components/ShippingPolicy';
import Checkout from './components/Checkout';
import AdminDashboard from './components/AdminDashboard';
import Orders from './components/Orders';
import Wallet from './components/Wallet';
import Addresses from './components/Addresses';
import Footer from './components/Footer';
import { initializePointsTracking } from './utils/pointsTracker';

function App() {
  useEffect(() => {
    // Initialize points tracking when app loads
    initializePointsTracking();
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/enter" element={<Enter />} />
          <Route path="/freegames" element={<FreePage />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/amplified-program" element={<AmplifiedProgram />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/partner-with-us" element={<PartnerWithUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/addresses" element={<Addresses />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
