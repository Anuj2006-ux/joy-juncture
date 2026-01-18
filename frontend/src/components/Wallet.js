import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config';
import './Wallet.css';

const Wallet = () => {
    const [wallet, setWallet] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claimingBonus, setClaimingBonus] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [referralCopied, setReferralCopied] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            fetchWalletData();
            fetchPointsHistory();
        } else {
            setIsLoggedIn(false);
            setLoading(false);
        }
    }, []);

    const fetchWalletData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/api/wallet', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setWallet(data.wallet);
            }
        } catch (error) {
            console.error('Error fetching wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPointsHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/api/wallet/history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setHistory(data.history);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const claimDailyGameBonus = async () => {
        setClaimingBonus(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/api/wallet/daily-game-bonus', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: data.message });
                fetchWalletData();
                fetchPointsHistory();
            } else if (data.alreadyClaimed) {
                setMessage({ type: 'info', text: data.message });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to claim bonus' });
        } finally {
            setClaimingBonus(false);
        }
    };

    const copyReferralCode = async () => {
        if (wallet?.referralCode) {
            try {
                await navigator.clipboard.writeText(wallet.referralCode);
                setReferralCopied(true);
                setTimeout(() => setReferralCopied(false), 2000);
            } catch (err) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = wallet.referralCode;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setReferralCopied(true);
                setTimeout(() => setReferralCopied(false), 2000);
            }
        }
    };

    const getWhatsAppShareLink = () => {
        const message = `🎮 Join Joy Juncture and get 20 bonus points! 

Use my referral code: *${wallet?.referralCode}*

Sign up now and start playing amazing games!
👉 https://joyjuncture.com`;
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getSourceIcon = (source) => {
        const icons = {
            login: '🎁',
            game_time: '⏰',
            game_play: '🎮',
            purchase: '🛒',
            bonus: '⭐',
            discount_redemption: '💰'
        };
        return icons[source] || '📌';
    };

    const calculateDiscount = (points) => {
        return points; // 1 point = ₹1
    };

    if (loading) {
        return (
            <div className="wallet-container">
                <div className="loading">Loading wallet...</div>
            </div>
        );
    }

    // Guest view - not logged in
    if (!isLoggedIn) {
        return (
            <div className="wallet-container">
                <div className="wallet-header">
                    <h1>💎 Wallet & Points</h1>
                    <p>Earn points and get discounts on your favorite games!</p>
                </div>

                {/* Guest Points Overview */}
                <div className="points-overview">
                    <div className="points-card main-points guest">
                        <div className="points-icon">💎</div>
                        <div className="points-content">
                            <h2>000</h2>
                            <p>Available Points</p>
                            <div className="discount-preview">
                                = ₹0 Discount
                            </div>
                        </div>
                    </div>

                    <div className="points-stats">
                        <div className="stat-card">
                            <div className="stat-icon">📈</div>
                            <div className="stat-content">
                                <h3>0</h3>
                                <p>Total Earned</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">💸</div>
                            <div className="stat-content">
                                <h3>0</h3>
                                <p>Total Used</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-content">
                                <h3>0</h3>
                                <p>Referrals</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Prompt */}
                <div className="login-prompt-section">
                    <div className="login-prompt-card">
                        <div className="login-prompt-icon">🔐</div>
                        <h3>Login to Access Your Wallet</h3>
                        <p>Sign in to view your points, claim daily bonuses, and get your referral code!</p>
                        <div className="login-prompt-buttons">
                            <Link to="/login" className="login-prompt-btn primary">
                                Sign In
                            </Link>
                            <Link to="/login" className="login-prompt-btn secondary">
                                Create Account
                            </Link>
                        </div>
                        <p className="signup-bonus-hint">🎁 Get <strong>20 bonus points</strong> when you sign up!</p>
                    </div>
                </div>

                {/* How to Earn Points - Rules Section (Read Only) */}
                <div className="rules-section">
                    <h3>📜 How to Earn Points</h3>
                    <div className="rules-grid">
                        <div className="rule-card signup">
                            <div className="rule-icon">🎉</div>
                            <div className="rule-content">
                                <h4>Sign Up Bonus</h4>
                                <p className="points-value">+20 Points</p>
                                <p className="rule-desc">One-time bonus when you create an account</p>
                            </div>
                        </div>

                        <div className="rule-card daily">
                            <div className="rule-icon">🎮</div>
                            <div className="rule-content">
                                <h4>Daily Game Play</h4>
                                <p className="points-value">+10 Points/Day</p>
                                <p className="rule-desc">Play any game on our website daily</p>
                            </div>
                        </div>

                        <div className="rule-card referral">
                            <div className="rule-icon">🤝</div>
                            <div className="rule-content">
                                <h4>Refer a Friend</h4>
                                <p className="points-value">+200 Points</p>
                                <p className="rule-desc">When they sign up using your code</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* How to Use Points */}
                <div className="usage-section">
                    <h3>🛒 How to Use Your Points</h3>
                    <div className="usage-cards">
                        <div className="usage-card">
                            <span className="usage-icon">💰</span>
                            <div>
                                <h4>1 Point = ₹1 Discount</h4>
                                <p>Use your points directly as discount on game purchases</p>
                            </div>
                        </div>
                        <div className="usage-card">
                            <span className="usage-icon">🎯</span>
                            <div>
                                <h4>Up to 50% Off</h4>
                                <p>Maximum discount of 50% on any order using points</p>
                            </div>
                        </div>
                        <div className="usage-card">
                            <span className="usage-icon">⚡</span>
                            <div>
                                <h4>Apply at Checkout</h4>
                                <p>Points can be applied during the checkout process</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Logged in view
    return (
        <div className="wallet-container">
            <div className="wallet-header">
                <h1>💎 Wallet & Points</h1>
                <p>Earn points and get discounts on your favorite games!</p>
            </div>

            {/* Points Overview Card */}
            <div className="points-overview">
                <div className="points-card main-points">
                    <div className="points-icon">💎</div>
                    <div className="points-content">
                        <h2>{wallet?.currentPoints || 0}</h2>
                        <p>Available Points</p>
                        <div className="discount-preview">
                            = ₹{calculateDiscount(wallet?.currentPoints || 0)} Discount
                        </div>
                    </div>
                </div>

                <div className="points-stats">
                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-content">
                            <h3>{wallet?.totalEarned || 0}</h3>
                            <p>Total Earned</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💸</div>
                        <div className="stat-content">
                            <h3>{wallet?.totalRedeemed || 0}</h3>
                            <p>Total Used</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>{wallet?.referralCount || 0}</h3>
                            <p>Referrals</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How to Earn Points - Rules Section */}
            <div className="rules-section">
                <h3>📜 How to Earn Points</h3>
                <div className="rules-grid">
                    <div className="rule-card signup">
                        <div className="rule-icon">🎉</div>
                        <div className="rule-content">
                            <h4>Sign Up Bonus</h4>
                            <p className="points-value">+20 Points</p>
                            <p className="rule-desc">One-time bonus when you create an account</p>
                        </div>
                    </div>

                    <div className="rule-card daily">
                        <div className="rule-icon">🎮</div>
                        <div className="rule-content">
                            <h4>Daily Game Play</h4>
                            <p className="points-value">+10 Points/Day</p>
                            <p className="rule-desc">Play any game on our website daily</p>
                        </div>
                        <button
                            className="claim-btn"
                            onClick={claimDailyGameBonus}
                            disabled={claimingBonus}
                        >
                            {claimingBonus ? 'Claiming...' : 'Claim Today'}
                        </button>
                    </div>

                    <div className="rule-card referral">
                        <div className="rule-icon">🤝</div>
                        <div className="rule-content">
                            <h4>Refer a Friend</h4>
                            <p className="points-value">+200 Points</p>
                            <p className="rule-desc">When they sign up using your code</p>
                        </div>
                    </div>
                </div>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </div>

            {/* Referral Section */}
            <div className="referral-section">
                <h3>🔗 Your Referral Code</h3>
                <p className="referral-desc">Share your code with friends. When they sign up, you get <strong>200 points</strong>!</p>

                <div className="referral-code-box">
                    <span className="referral-code">
                        {loading ? 'Loading...' : (wallet?.referralCode || 'Not available')}
                    </span>
                    <button
                        className="copy-btn"
                        onClick={copyReferralCode}
                        disabled={!wallet?.referralCode}
                    >
                        {referralCopied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                </div>

                <div className="share-buttons">
                    <a
                        href={getWhatsAppShareLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="share-btn whatsapp"
                        onClick={(e) => !wallet?.referralCode && e.preventDefault()}
                    >
                        <i className="fab fa-whatsapp"></i> Share on WhatsApp
                    </a>
                </div>
            </div>

            {/* How to Use Points */}
            <div className="usage-section">
                <h3>🛒 How to Use Your Points</h3>
                <div className="usage-cards">
                    <div className="usage-card">
                        <span className="usage-icon">💰</span>
                        <div>
                            <h4>1 Point = ₹1 Discount</h4>
                            <p>Use your points directly as discount on game purchases</p>
                        </div>
                    </div>
                    <div className="usage-card">
                        <span className="usage-icon">🎯</span>
                        <div>
                            <h4>Up to 50% Off</h4>
                            <p>Maximum discount of 50% on any order using points</p>
                        </div>
                    </div>
                    <div className="usage-card">
                        <span className="usage-icon">⚡</span>
                        <div>
                            <h4>Apply at Checkout</h4>
                            <p>Points can be applied during the checkout process</p>
                        </div>
                    </div>
                </div>

                {/* Discount Calculator */}
                <div className="discount-calculator">
                    <h4>Your Current Discount Power</h4>
                    <div className="calculator-result">
                        <span className="points-display">{wallet?.currentPoints || 0} Points</span>
                        <span className="equals">=</span>
                        <span className="discount-display">₹{calculateDiscount(wallet?.currentPoints || 0)} Off</span>
                    </div>
                </div>
            </div>

            {/* Points History */}
            <div className="history-section">
                <h3>📊 Points History</h3>
                {history.length === 0 ? (
                    <div className="no-history">
                        <p>No transactions yet. Start earning points!</p>
                    </div>
                ) : (
                    <div className="history-list">
                        {history.map((item) => (
                            <div key={item._id} className={`history-item ${item.type}`}>
                                <div className="history-icon">
                                    {getSourceIcon(item.source)}
                                </div>
                                <div className="history-content">
                                    <h4>{item.description}</h4>
                                    <p className="history-date">{formatDate(item.createdAt)}</p>
                                </div>
                                <div className={`history-points ${item.type}`}>
                                    {item.type === 'earned' ? '+' : ''}{item.points}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wallet;
