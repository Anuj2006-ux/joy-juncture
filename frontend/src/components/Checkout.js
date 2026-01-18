import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [wallet, setWallet] = useState(null);
    const [usePoints, setUsePoints] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Popup State
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [orderSuccessData, setOrderSuccessData] = useState(null);

    // Address State
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: '',
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: false
    });
    const [savingAddress, setSavingAddress] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState('card');

    // Payment Modal States
    const [showCardModal, setShowCardModal] = useState(false);
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: ''
    });
    const [upiId, setUpiId] = useState('');
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch all data in parallel for faster loading
                const fetchPromises = [
                    fetch(API_URL + '/api/cart', {
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                    })
                ];

                if (token) {
                    fetchPromises.push(
                        fetch(API_URL + '/api/wallet', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }),
                        fetch(API_URL + '/api/address', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                    );
                }

                const responses = await Promise.all(fetchPromises);
                const [cartRes, walletRes, addressRes] = responses;

                // Process cart
                const cartData = await cartRes.json();
                if (cartData.success) {
                    setCart(cartData.cart);
                }

                // Process wallet and addresses (only if logged in)
                if (token && walletRes && addressRes) {
                    const [walletData, addressData] = await Promise.all([
                        walletRes.json(),
                        addressRes.json()
                    ]);

                    if (walletData.success) {
                        setWallet(walletData.wallet);
                    }

                    if (addressData.success) {
                        setSavedAddresses(addressData.addresses);
                        // Auto-select default address
                        const defaultAddr = addressData.addresses.find(a => a.isDefault);
                        if (defaultAddr) {
                            setSelectedAddressId(defaultAddr._id);
                        } else if (addressData.addresses.length > 0) {
                            setSelectedAddressId(addressData.addresses[0]._id);
                        }
                    }
                }
            } catch (error) {
                console.error('Checkout data fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleNewAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAddress(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveNewAddress = async () => {
        // Validate required fields before sending
        if (!newAddress.name || !newAddress.fullName || !newAddress.phone ||
            !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
            alert('Please fill all required fields');
            return;
        }

        setSavingAddress(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/api/address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newAddress)
            });
            const data = await response.json();

            if (data.success) {
                // Refetch addresses to get updated list
                const addressRes = await fetch(API_URL + '/api/address', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const addressData = await addressRes.json();
                if (addressData.success) {
                    setSavedAddresses(addressData.addresses);
                    // Select the newly added address
                    setSelectedAddressId(data.address._id);
                }
                setShowNewAddressForm(false);
                setNewAddress({
                    name: '',
                    fullName: '',
                    phone: '',
                    addressLine1: '',
                    addressLine2: '',
                    city: '',
                    state: '',
                    pincode: '',
                    country: 'India',
                    isDefault: false
                });
            } else {
                alert(data.message || 'Failed to save address');
            }
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Network error. Please check your connection and try again.');
        } finally {
            setSavingAddress(false);
        }
    };

    // Calculation Logic
    const calculateTotals = () => {
        if (!cart || !cart.items) return { subtotal: 0, discount: 0, total: 0, pointsUsed: 0 };

        const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        let discount = 0;
        let pointsToRedeem = 0;

        if (usePoints && wallet) {
            // Max discount rule: 50% of subtotal
            const maxDiscount = Math.floor(subtotal * 0.5);
            // Available points
            const availablePoints = wallet.currentPoints;

            // Actual points to use is the lesser of available points or max discount
            pointsToRedeem = Math.min(availablePoints, maxDiscount);

            // 1 Point = ₹1 Discount
            discount = pointsToRedeem;
        }

        return {
            subtotal,
            discount,
            pointsUsed: pointsToRedeem,
            total: subtotal - discount
        };
    };

    const totals = calculateTotals();

    // Handle initial Place Order click - shows payment modal if needed
    const handlePlaceOrder = async () => {
        console.log('handlePlaceOrder called');
        console.log('Payment Method:', paymentMethod);
        console.log('Cart:', cart);
        console.log('Selected Address ID:', selectedAddressId);

        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);

        if (!token) {
            alert('Please login to place an order');
            navigate('/login?redirect=checkout');
            return;
        }

        // Check if address is selected
        if (!selectedAddressId) {
            alert('Please select a delivery address');
            return;
        }

        console.log('About to show modal or process order');
        // Show payment modal based on payment method
        if (paymentMethod === 'card') {
            console.log('Setting showCardModal to true');
            setShowCardModal(true);
        } else if (paymentMethod === 'upi') {
            console.log('Setting showUpiModal to true');
            setShowUpiModal(true);
        } else {
            console.log('Processing COD order directly');
            // COD - proceed directly
            await processOrder();
        }
    };

    // Process the actual order after payment details are entered
    const processOrder = async () => {
        setIsProcessing(true);

        try {
            const token = localStorage.getItem('token');

            // Get selected address
            const selectedAddress = savedAddresses.find(a => a._id === selectedAddressId);
            if (!selectedAddress) {
                alert('Selected address not found');
                setIsProcessing(false);
                return;
            }

            const orderItems = cart.items.map(item => ({
                gameId: item.gameId,
                title: item.title,
                price: item.price,
                image: item.image,
                quantity: item.quantity
            }));

            // Map address to backend schema
            const backendShippingAddress = {
                name: selectedAddress.fullName,
                address: selectedAddress.addressLine1 + (selectedAddress.addressLine2 ? ', ' + selectedAddress.addressLine2 : ''),
                city: selectedAddress.city,
                state: selectedAddress.state,
                pincode: selectedAddress.pincode,
                country: selectedAddress.country,
                phone: selectedAddress.phone
            };

            const response = await fetch(API_URL + '/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: orderItems,
                    shippingAddress: backendShippingAddress,
                    paymentMethod,
                    pointsUsed: totals.pointsUsed
                })
            });

            const data = await response.json();

            if (data.success) {
                // Clear cart immediately in the UI
                setCart({ items: [] });

                // Close payment modals
                setShowCardModal(false);
                setShowUpiModal(false);

                // Reset payment details
                setCardDetails({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
                setUpiId('');

                // Show Success Popup instead of redirect
                setOrderSuccessData({
                    orderId: data.order.orderNumber || data.order._id.slice(-6).toUpperCase(),
                    pointsEarned: data.pointsEarned
                });
                setShowSuccessPopup(true);
            } else {
                alert(data.message || 'Failed to place order');
            }

        } catch (error) {
            console.error('Order placement error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsProcessing(false);
            setPaymentProcessing(false);
        }
    };

    // Handle Card Payment
    const handleCardPayment = async (e) => {
        e.preventDefault();

        // Validate card details
        if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiry || !cardDetails.cvv) {
            alert('Please fill all card details');
            return;
        }

        if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
            alert('Please enter a valid 16-digit card number');
            return;
        }

        if (cardDetails.cvv.length < 3) {
            alert('Please enter a valid CVV');
            return;
        }

        setPaymentProcessing(true);

        // Simulate payment processing
        setTimeout(async () => {
            await processOrder();
        }, 1500);
    };

    // Handle UPI Payment
    const handleUpiPayment = async (e) => {
        e.preventDefault();

        // Validate UPI ID
        if (!upiId || !upiId.includes('@')) {
            alert('Please enter a valid UPI ID (e.g., yourname@upi)');
            return;
        }

        setPaymentProcessing(true);

        // Simulate payment processing
        setTimeout(async () => {
            await processOrder();
        }, 1500);
    };

    // Format card number with spaces
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : value;
    };

    // Format expiry date
    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    if (loading) return <div className="checkout-container"><div className="loading-container">Loading checkout...</div></div>;

    // Don't show empty cart if popup is visible (order just completed) or payment modal is open
    if ((!cart || !cart.items || cart.items.length === 0) && !showSuccessPopup && !showCardModal && !showUpiModal) {
        return (
            <div className="checkout-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="empty-cart-message" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '25px' }}>🛒</div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Your cart is empty</h2>
                    <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '30px' }}>Looks like you haven't added anything yet</p>
                    <a href="/deals/gamepage.html" className="continue-shopping-btn" style={{ fontSize: '1.1rem', padding: '15px 40px', display: 'inline-block', textDecoration: 'none' }}>Browse Games</a>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            {console.log('Rendering - showCardModal:', showCardModal, 'showUpiModal:', showUpiModal)}
            {/* Success Modal Popup - Shows after order placed */}
            {showSuccessPopup && (
                <div className="modal-overlay" style={{ zIndex: 99999 }}>
                    <div className="success-modal">
                        <div className="success-icon">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h2>Order Placed Successfully!</h2>
                        <p className="order-message">
                            Thank you for your purchase! We have received your order <strong>#{orderSuccessData?.orderId}</strong>.
                        </p>
                        <p className="delivery-time">
                            <i className="fas fa-clock"></i> We will reach you in <strong>3-5 business days</strong>.
                        </p>
                        {orderSuccessData?.pointsEarned > 0 && (
                            <div className="modal-points-badge">
                                +{orderSuccessData.pointsEarned} Points Earned
                            </div>
                        )}
                        <button
                            className="modal-close-btn"
                            onClick={() => setShowSuccessPopup(false)}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* Card Payment Modal */}
            {showCardModal && (
                <div
                    onClick={() => setShowCardModal(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 999999
                    }}
                >
                    <div onClick={(e) => e.stopPropagation()} style={{
                        background: 'white',
                        padding: '40px',
                        borderRadius: '20px',
                        maxWidth: '420px',
                        width: '90%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <button
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer'
                            }}
                            onClick={() => setShowCardModal(false)}
                        >
                            ✕
                        </button>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#2d4a3e' }}>
                            💳 Card Payment
                        </h2>
                        <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '25px' }}>
                            Amount: <strong style={{ color: '#FF8C00' }}>₹{totals.total}</strong>
                        </p>

                        <form onSubmit={handleCardPayment}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Card Number</label>
                                <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    maxLength="19"
                                    value={cardDetails.cardNumber}
                                    onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: formatCardNumber(e.target.value) })}
                                    style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Cardholder Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={cardDetails.cardName}
                                    onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Expiry</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        maxLength="5"
                                        value={cardDetails.expiry}
                                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                                        style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>CVV</label>
                                    <input
                                        type="password"
                                        placeholder="•••"
                                        maxLength="4"
                                        value={cardDetails.cvv}
                                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                                        style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={paymentProcessing}
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    background: '#2d4a3e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {paymentProcessing ? '⏳ Processing...' : `🔒 Pay ₹${totals.total}`}
                            </button>
                        </form>
                        <p style={{ textAlign: 'center', marginTop: '15px', color: '#888', fontSize: '0.85rem' }}>
                            🔐 Your payment is secure & encrypted
                        </p>
                    </div>
                </div>
            )}

            {/* UPI Payment Modal */}
            {showUpiModal && (
                <div
                    onClick={() => setShowUpiModal(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 999999
                    }}
                >
                    <div onClick={(e) => e.stopPropagation()} style={{
                        background: 'white',
                        padding: '40px',
                        borderRadius: '20px',
                        maxWidth: '420px',
                        width: '90%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <button
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer'
                            }}
                            onClick={() => setShowUpiModal(false)}
                        >
                            ✕
                        </button>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#5f259f' }}>
                            📱 UPI Payment
                        </h2>
                        <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '25px' }}>
                            Amount: <strong style={{ color: '#FF8C00' }}>₹{totals.total}</strong>
                        </p>

                        <form onSubmit={handleUpiPayment}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>UPI ID</label>
                                <input
                                    type="text"
                                    placeholder="yourname@upi"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    style={{ width: '100%', padding: '14px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                                <span style={{ color: '#666', fontSize: '0.9rem' }}>Popular UPI Apps: </span>
                                <span style={{ display: 'inline-flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <span style={{ background: '#f0f0f0', padding: '5px 12px', borderRadius: '15px', fontSize: '0.85rem' }}>GPay</span>
                                    <span style={{ background: '#f0f0f0', padding: '5px 12px', borderRadius: '15px', fontSize: '0.85rem' }}>PhonePe</span>
                                    <span style={{ background: '#f0f0f0', padding: '5px 12px', borderRadius: '15px', fontSize: '0.85rem' }}>Paytm</span>
                                </span>
                            </div>
                            <button
                                type="submit"
                                disabled={paymentProcessing}
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    background: '#5f259f',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {paymentProcessing ? '⏳ Processing...' : `✓ Pay ₹${totals.total}`}
                            </button>
                        </form>
                        <p style={{ textAlign: 'center', marginTop: '15px', color: '#888', fontSize: '0.85rem' }}>
                            🔐 Your payment is secure & encrypted
                        </p>
                    </div>
                </div>
            )}

            {/* Show empty cart or checkout form */}
            {(!cart || !cart.items || cart.items.length === 0) ? (
                <div className="empty-cart-message" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '100px 40px' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '25px' }}>✓</div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Order Complete!</h2>
                    <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '30px' }}>Your cart is now empty</p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="/deals/gamepage.html" className="continue-shopping-btn" style={{ fontSize: '1.1rem', padding: '15px 40px', display: 'inline-block', textDecoration: 'none' }}>Continue Shopping</a>
                        <button onClick={() => navigate('/orders')} className="continue-shopping-btn" style={{ fontSize: '1.1rem', padding: '15px 40px', background: '#2d4a3e', border: 'none', cursor: 'pointer', borderRadius: '50px', color: 'white' }}>Track Your Order</button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Left Column: Form */}
                    <div className="checkout-main">
                        <div>
                            <div className="checkout-card">
                                <h2><i className="fas fa-truck"></i> Delivery Address</h2>

                                {/* Saved Addresses */}
                                {savedAddresses.length > 0 && !showNewAddressForm && (
                                    <div className="saved-addresses-list">
                                        {savedAddresses.map(addr => (
                                            <div
                                                key={addr._id}
                                                className={`saved-address-option ${selectedAddressId === addr._id ? 'selected' : ''}`}
                                                onClick={() => setSelectedAddressId(addr._id)}
                                            >
                                                <div className="address-radio">
                                                    <input
                                                        type="radio"
                                                        name="deliveryAddress"
                                                        checked={selectedAddressId === addr._id}
                                                        onChange={() => setSelectedAddressId(addr._id)}
                                                    />
                                                </div>
                                                <div className="address-content">
                                                    <div className="address-label-row">
                                                        <span className="address-label">{addr.name}</span>
                                                        {addr.isDefault && <span className="default-tag">Default</span>}
                                                    </div>
                                                    <p className="address-name">{addr.fullName}</p>
                                                    <p>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                                                    <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                                    <p className="address-phone"><i className="fas fa-phone"></i> {addr.phone}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add New Address Button/Form */}
                                {!showNewAddressForm ? (
                                    <button
                                        type="button"
                                        className="add-new-address-btn"
                                        onClick={() => setShowNewAddressForm(true)}
                                    >
                                        <i className="fas fa-plus"></i> Add New Address
                                    </button>
                                ) : (
                                    <div className="new-address-form">
                                        <div className="new-address-header">
                                            <h3>Add New Address</h3>
                                            <button
                                                type="button"
                                                className="cancel-btn"
                                                onClick={() => setShowNewAddressForm(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        <div className="form-grid">
                                            <div className="form-group full-width">
                                                <label>Address Label *</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={newAddress.name}
                                                    onChange={handleNewAddressChange}
                                                    placeholder="e.g., Home, Office"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Full Name *</label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={newAddress.fullName}
                                                    onChange={handleNewAddressChange}
                                                    placeholder="Receiver's name"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Phone *</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={newAddress.phone}
                                                    onChange={handleNewAddressChange}
                                                    placeholder="10-digit number"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group full-width">
                                                <label>Address Line 1 *</label>
                                                <input
                                                    type="text"
                                                    name="addressLine1"
                                                    value={newAddress.addressLine1}
                                                    onChange={handleNewAddressChange}
                                                    placeholder="House No, Building, Street"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group full-width">
                                                <label>Address Line 2</label>
                                                <input
                                                    type="text"
                                                    name="addressLine2"
                                                    value={newAddress.addressLine2}
                                                    onChange={handleNewAddressChange}
                                                    placeholder="Landmark (optional)"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>City *</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={newAddress.city}
                                                    onChange={handleNewAddressChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>State *</label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={newAddress.state}
                                                    onChange={handleNewAddressChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Pincode *</label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    value={newAddress.pincode}
                                                    onChange={handleNewAddressChange}
                                                    placeholder="6-digit"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Country</label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    value={newAddress.country}
                                                    disabled
                                                />
                                            </div>
                                        </div>

                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="isDefault"
                                                checked={newAddress.isDefault}
                                                onChange={handleNewAddressChange}
                                            />
                                            Set as default address
                                        </label>

                                        <button
                                            type="button"
                                            className="save-new-address-btn"
                                            onClick={handleSaveNewAddress}
                                            disabled={savingAddress}
                                        >
                                            {savingAddress ? 'Saving...' : 'Save Address'}
                                        </button>
                                    </div>
                                )}

                                {/* No addresses message */}
                                {savedAddresses.length === 0 && !showNewAddressForm && (
                                    <p className="no-address-msg">
                                        No saved addresses. Please add a delivery address.
                                    </p>
                                )}
                            </div>

                            <div className="checkout-card" style={{ marginTop: '30px' }}>
                                <h2><i className="fas fa-credit-card"></i> Payment Method</h2>
                                <div className="payment-methods">
                                    <div
                                        className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <i className="fas fa-credit-card"></i>
                                        <div>Card</div>
                                    </div>
                                    <div
                                        className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('upi')}
                                    >
                                        <i className="fas fa-mobile-alt"></i>
                                        <div>UPI</div>
                                    </div>
                                    <div
                                        className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('cod')}
                                    >
                                        <i className="fas fa-money-bill-wave"></i>
                                        <div>Cash on Delivery</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="checkout-sidebar">
                        <div className="checkout-card">
                            <h2>Order Summary</h2>

                            <div className="order-items-preview">
                                {cart.items.map((item, index) => (
                                    <div key={index} className="preview-item">
                                        <img src={item.image || 'https://via.placeholder.com/60'} alt={item.title} />
                                        <div className="preview-details">
                                            <h4>{item.title}</h4>
                                            <span>Qty: {item.quantity} x ₹{item.price}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Points Redemption Section */}
                            {wallet && wallet.currentPoints > 0 && (
                                <div className="points-redemption">
                                    <div className="points-header">
                                        <h3><i className="fas fa-gem"></i> Joy Points</h3>
                                        <span className="available-points">{wallet.currentPoints} Available</span>
                                    </div>
                                    <label className="points-toggle">
                                        <input
                                            type="checkbox"
                                            className="toggle-checkbox"
                                            checked={usePoints}
                                            onChange={(e) => setUsePoints(e.target.checked)}
                                        />
                                        <span>Redeem Points for Discount</span>
                                    </label>
                                    {usePoints && (
                                        <p className="points-info">
                                            Using {totals.pointsUsed} points for ₹{totals.pointsUsed} off
                                            (Max 50% of order value)
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{totals.subtotal}</span>
                            </div>
                            {totals.discount > 0 && (
                                <div className="summary-row discount">
                                    <span>Points Discount</span>
                                    <span>- ₹{totals.discount}</span>
                                </div>
                            )}
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₹{totals.total}</span>
                            </div>

                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px', textAlign: 'center' }}>
                                You will earn {Math.floor(totals.total * 0.01)} points with this order!
                            </p>

                            <button
                                type="button"
                                className="place-order-btn"
                                disabled={isProcessing}
                                onClick={handlePlaceOrder}
                            >
                                {isProcessing ? 'Processing...' : `Place Order • ₹${totals.total}`}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                                <a
                                    href="/"
                                    style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Store flag to open cart on homepage
                                        sessionStorage.setItem('openCart', 'true');
                                        navigate('/');
                                    }}
                                >
                                    ← Return to Cart
                                </a>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Checkout;
