import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:5000/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'processing': return 'Processing - We are packing your order';
            case 'shipped': return 'Shipped - Expected soon';
            case 'delivered': return 'Delivered - Enjoy!';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="orders-container">
                <div className="loading">Loading your orders...</div>
            </div>
        );
    }

    return (
        <div className="orders-container">
            <div className="orders-header">
                <h1>My Orders</h1>
                <p>View and track all your orders</p>
            </div>

            {orders.length === 0 ? (
                <div className="no-orders">
                    <div className="no-orders-icon">📦</div>
                    <h2>No Orders Yet</h2>
                    <p>You haven't placed any orders yet.</p>
                    <button 
                        className="shop-now-btn"
                        onClick={() => navigate('/games')}
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div 
                            key={order._id} 
                            className={`order-card ${selectedOrder?._id === order._id ? 'expanded' : ''}`}
                            onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                        >
                            <div className="order-header">
                                <div className="order-info">
                                    <h3>Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}</h3>
                                    <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                                </div>
                                <div className={`order-status-badge ${order.orderStatus}`}>
                                    {order.orderStatus}
                                </div>
                            </div>

                            <p className="status-message" style={{color: 'var(--joy-green)', fontSize: '0.9rem', marginBottom: '15px' }}>
                                <i className="fas fa-truck"></i> {getStatusText(order.orderStatus)}
                            </p>

                            <div className="order-items-preview">
                                <div className="items-images">
                                    {order.items.slice(0, 3).map((item, idx) => (
                                        <img 
                                            key={idx}
                                            src={item.image || 'https://via.placeholder.com/60'} 
                                            alt={item.title}
                                            className="item-preview-image"
                                        />
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className="more-items">+{order.items.length - 3}</div>
                                    )}
                                </div>
                                <div className="items-count">
                                    {order.items.reduce((acc, item) => acc + item.quantity, 0)} Item(s)
                                </div>
                            </div>

                            <div className="order-summary">
                                <div className="summary-row">
                                    <span>Total Amount</span>
                                    <span className="amount">₹{order.totalAmount}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="summary-row discount">
                                        <span>Discount</span>
                                        <span className="amount">- ₹{order.discount}</span>
                                    </div>
                                )}
                                <div className="summary-row total">
                                    <span>Final Paid</span>
                                    <span className="amount">₹{order.finalAmount}</span>
                                </div>
                            </div>

                            {selectedOrder?._id === order._id && (
                                <div className="order-details">
                                    <div className="details-section">
                                        <h4>Items in Order</h4>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item">
                                                <img src={item.image || 'https://via.placeholder.com/80'} alt={item.title} />
                                                <div className="item-info">
                                                    <h5>{item.title}</h5>
                                                    <p>Qty: {item.quantity}</p>
                                                    <p className="item-price">₹{item.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="details-section">
                                        <h4>Shipping Details</h4>
                                        <div className="address-details">
                                            <p><strong>{order.shippingAddress?.name || order.shippingAddress?.fullName}</strong></p>
                                            <p>{order.shippingAddress?.address || order.shippingAddress?.addressLine1}</p>
                                            <p>
                                                {order.shippingAddress?.city}, {order.shippingAddress?.state} - 
                                                {order.shippingAddress?.pincode || order.shippingAddress?.zipCode}
                                            </p>
                                            <p>Phone: {order.shippingAddress?.phone}</p>
                                        </div>
                                    </div>

                                    {order.pointsEarned > 0 && (
                                        <div className="points-earned-badge">
                                            🎉 You earned <strong>{order.pointsEarned} Points</strong> from this order!
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
