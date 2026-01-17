import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, games: 0, orders: 0, totalRevenue: 0, totalPoints: 0, recentOrders: 0 });
  const [games, setGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [freeGames, setFreeGames] = useState([]);
  const [activeTab, setActiveTab] = useState('games');
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteGameId, setDeleteGameId] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockUser, setBlockUser] = useState(null);
  const [customBlockDays, setCustomBlockDays] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentGame, setCurrentGame] = useState(null);
  
  // User Detail Modal
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [userPointsHistory, setUserPointsHistory] = useState([]);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  
  // Points Modal
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsAction, setPointsAction] = useState({ points: '', type: 'add', description: '' });
  
  // Order Status Modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderUpdate, setOrderUpdate] = useState({ orderStatus: '', paymentStatus: '', trackingNumber: '' });

  // Free Games Modal States
  const [showFreeGameModal, setShowFreeGameModal] = useState(false);
  const [currentFreeGame, setCurrentFreeGame] = useState(null);
  const [freeGameForm, setFreeGameForm] = useState({
    title: '',
    description: '',
    image: '',
    gameUrl: '',
    rating: 4.5,
    isActive: true,
    order: 0
  });
  const [showDeleteFreeGameModal, setShowDeleteFreeGameModal] = useState(false);
  const [deleteFreeGameId, setDeleteFreeGameId] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    price: '',
    oldPrice: '',
    image: '',
    tag: '',
    description: '',
    category: ''
  });

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, gamesRes, usersRes, ordersRes, freeGamesRes] = await Promise.all([
        fetch(API_URL + '/api/admin/stats', { headers: getHeaders() }),
        fetch(API_URL + '/api/admin/games', { headers: getHeaders() }),
        fetch(API_URL + '/api/admin/users', { headers: getHeaders() }),
        fetch(API_URL + '/api/admin/orders', { headers: getHeaders() }),
        fetch(API_URL + '/api/admin/free-games', { headers: getHeaders() })
      ]);

      if (statsRes.status === 401 || statsRes.status === 403) {
        alert('Unauthorized. Please login as admin.');
        navigate('/login');
        return;
      }

      const [statsData, gamesData, usersData, ordersData, freeGamesData] = await Promise.all([
        statsRes.json(),
        gamesRes.json(),
        usersRes.json(),
        ordersRes.json(),
        freeGamesRes.json()
      ]);

      console.log('Admin Stats Response:', statsData);
      console.log('Admin Games Response:', gamesData);
      console.log('Admin Users Response:', usersData);
      console.log('Admin Orders Response:', ordersData);
      console.log('Admin Free Games Response:', freeGamesData);

      if (statsData.success) {
        console.log('Setting stats:', statsData.stats);
        setStats(statsData.stats);
      } else {
        console.error('Stats fetch failed:', statsData.message);
      }
      if (gamesData.success) setGames(gamesData.games);
      if (usersData.success) setUsers(usersData.users);
      if (ordersData.success) setOrders(ordersData.orders);
      if (freeGamesData.success) setFreeGames(freeGamesData.freeGames);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId) => {
    setLoadingUserDetail(true);
    try {
      const res = await fetch(API_URL + `/api/admin/users/${userId}`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setSelectedUserDetail(data.user);
        setUserOrders(data.orders);
        setUserPointsHistory(data.pointsHistory);
        setShowUserDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!currentGame;
    const url = isEdit 
      ? API_URL + `/api/admin/games/${currentGame.id}`
      : API_URL + '/api/admin/games';
    
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        fetchData();
        setSuccessMessage(isEdit ? 'Game Updated Successfully!' : 'New Game Added Successfully!');
        setShowSuccessModal(true);
      } else {
        alert(data.message || 'Error saving game');
      }
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Network error: ' + error.message);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteGameId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteGameId) return;
    try {
      const res = await fetch(API_URL + `/api/admin/games/${deleteGameId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      const data = await res.json();
      if (data.success) {
        setShowDeleteModal(false);
        setDeleteGameId(null);
        fetchData();
        setSuccessMessage('Game Deleted Successfully!');
        setShowSuccessModal(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Error deleting game');
    }
  };

  const handleBlockUser = async (days) => {
    if (!blockUser) return;
    try {
      const res = await fetch(API_URL + `/api/admin/users/${blockUser._id}/block`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ 
          block: days !== 0, 
          days: days
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setShowBlockModal(false);
        setBlockUser(null);
        setCustomBlockDays('');
        fetchData();
        setSuccessMessage(days === 0 ? 'User Unblocked Successfully!' : `User Blocked ${days === -1 ? 'Forever' : `for ${days} Days`}!`);
        setShowSuccessModal(true);
      } else {
        alert(data.message || 'Error updating user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Error updating user');
    }
  };

  const handleUpdatePoints = async () => {
    if (!selectedUserDetail || !pointsAction.points) return;
    try {
      const res = await fetch(API_URL + `/api/admin/users/${selectedUserDetail._id}/points`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          points: parseInt(pointsAction.points),
          type: pointsAction.type,
          description: pointsAction.description
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setShowPointsModal(false);
        setPointsAction({ points: '', type: 'add', description: '' });
        fetchUserDetail(selectedUserDetail._id);
        fetchData();
        setSuccessMessage(`Points ${pointsAction.type === 'add' ? 'Added' : 'Deducted'} Successfully!`);
        setShowSuccessModal(true);
      } else {
        alert(data.message || 'Error updating points');
      }
    } catch (error) {
      console.error('Error updating points:', error);
      alert('Error updating points');
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(API_URL + `/api/admin/orders/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(orderUpdate)
      });
      
      const data = await res.json();
      if (data.success) {
        setShowOrderModal(false);
        setSelectedOrder(null);
        setOrderUpdate({ orderStatus: '', paymentStatus: '', trackingNumber: '' });
        fetchData();
        setSuccessMessage('Order Updated Successfully!');
        setShowSuccessModal(true);
      } else {
        alert(data.message || 'Error updating order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order');
    }
  };

  const openEditModal = (game) => {
    setCurrentGame(game);
    setFormData({
      id: game.id,
      title: game.title,
      price: game.price,
      oldPrice: game.oldPrice || '',
      image: game.image,
      tag: game.tag || '',
      description: game.description || '',
      category: game.category || ''
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setCurrentGame(null);
    setFormData({
      id: `jj${Date.now()}`, 
      title: '',
      price: '',
      oldPrice: '',
      image: '',
      tag: '',
      description: '',
      category: ''
    });
    setShowModal(true);
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setOrderUpdate({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber || ''
    });
    setShowOrderModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      processing: '#ff9100',
      confirmed: '#00b8d4',
      shipped: '#536dfe',
      delivered: '#00e676',
      cancelled: '#ff4444',
      pending: '#ff9100',
      completed: '#00e676',
      failed: '#ff4444',
      refunded: '#ab47bc'
    };
    return colors[status] || '#aaa';
  };

  if (loading) return <div className="admin-loader">Loading...</div>;

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
           <button onClick={() => window.location.reload()} className="refresh-btn">Refresh Data</button>
        </div>
      </div>

      {/* Stats Grid - Enhanced */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #ff0055, #ff4081)'}}><i className="fa-solid fa-users"></i></div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="value">{stats.users}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #ff6b9d, #ffa0c0)'}}><i className="fa-solid fa-gamepad"></i></div>
          <div className="stat-info">
            <h3>Total Games</h3>
            <p className="value">{stats.games}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #00b8d4, #00e5ff)'}}><i className="fa-solid fa-shopping-cart"></i></div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p className="value">{stats.orders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #00c853, #69f0ae)'}}><i className="fa-solid fa-indian-rupee-sign"></i></div>
          <div className="stat-info">
            <h3>Revenue</h3>
            <p className="value">₹{stats.totalRevenue?.toLocaleString() || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #ff6d00, #ffab40)'}}><i className="fa-solid fa-coins"></i></div>
          <div className="stat-info">
            <h3>Total Points</h3>
            <p className="value">{stats.totalPoints?.toLocaleString() || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #aa00ff, #e040fb)'}}><i className="fa-solid fa-clock"></i></div>
          <div className="stat-info">
            <h3>Recent Orders</h3>
            <p className="value">{stats.recentOrders} <span style={{fontSize: '0.7rem', color: '#aaa'}}>(7 days)</span></p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'games' ? 'active' : ''}`}
          onClick={() => setActiveTab('games')}
        >
          <i className="fa-solid fa-gamepad"></i> Games
        </button>
        <button 
          className={`tab-btn ${activeTab === 'freeGames' ? 'active' : ''}`}
          onClick={() => setActiveTab('freeGames')}
        >
          <i className="fa-solid fa-gift"></i> Free Games
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="fa-solid fa-users"></i> Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <i className="fa-solid fa-shopping-bag"></i> Orders
        </button>
      </div>

      <div className="admin-content-area">
        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="games-section">
            <div className="section-header">
              <h2>All Games ({games.length})</h2>
              <button className="add-btn" onClick={openAddModal}>+ Add New Game</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ff0055' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Image</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Title</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Price</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>ID</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tag</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map(game => (
                    <tr key={game._id} style={{ borderBottom: '1px solid #333', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px' }}>
                        <img src={game.image} alt={game.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                      </td>
                      <td style={{ padding: '16px', color: 'white', fontWeight: '500' }}>{game.title}</td>
                      <td style={{ padding: '16px', color: '#00e676', fontWeight: '600' }}>₹{game.price}</td>
                      <td style={{ padding: '16px', color: '#aaa' }}>{game.id}</td>
                      <td style={{ padding: '16px' }}>
                        {game.tag && <span style={{ background: 'rgba(255, 0, 85, 0.15)', color: '#ff0055', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500' }}>{game.tag}</span>}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => openEditModal(game)} style={{ padding: '8px 14px', background: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-pen"></i> Edit
                          </button>
                          <button onClick={() => openDeleteModal(game.id)} style={{ padding: '8px 14px', background: 'rgba(255, 68, 68, 0.2)', color: '#ff4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {games.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#aaa'}}>No games found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Free Games Tab */}
        {activeTab === 'freeGames' && (
          <div className="games-section">
            <div className="section-header">
              <h2>Free Games ({freeGames.length})</h2>
              <button className="add-btn" onClick={() => {
                setCurrentFreeGame(null);
                setFreeGameForm({ title: '', description: '', image: '', gameUrl: '', rating: 4.5, isActive: true, order: 0 });
                setShowFreeGameModal(true);
              }}>+ Add Free Game</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Game URL</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {freeGames.map((game) => (
                    <tr key={game._id}>
                      <td>
                        <img 
                          src={game.image} 
                          alt={game.title} 
                          style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </td>
                      <td style={{ fontWeight: '500' }}>{game.title}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{game.description}</td>
                      <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{game.gameUrl}</td>
                      <td>⭐ {game.rating}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.8rem',
                          background: game.isActive ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 68, 68, 0.2)',
                          color: game.isActive ? '#00e676' : '#ff4444'
                        }}>
                          {game.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => {
                              setCurrentFreeGame(game);
                              setFreeGameForm({
                                title: game.title,
                                description: game.description,
                                image: game.image,
                                gameUrl: game.gameUrl,
                                rating: game.rating,
                                isActive: game.isActive,
                                order: game.order || 0
                              });
                              setShowFreeGameModal(true);
                            }}
                            style={{ padding: '6px 12px', background: '#4a90d9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            <i className="fa-solid fa-edit"></i> Edit
                          </button>
                          <button 
                            onClick={() => {
                              setDeleteFreeGameId(game._id);
                              setShowDeleteFreeGameModal(true);
                            }}
                            style={{ padding: '6px 12px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            <i className="fa-solid fa-trash"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {freeGames.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#aaa'}}>
                        No free games found. Click "Add Free Game" to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: 'white', fontSize: '1.2rem' }}>Registered Users ({users.length})</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ff0055' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Name</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Points</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Created</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '16px', color: 'white', fontWeight: '500' }}>{user.name || 'N/A'}</td>
                      <td style={{ padding: '16px', color: '#aaa' }}>{user.email}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ background: 'rgba(255, 140, 0, 0.15)', color: '#ff8c00', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                          {user.wallet?.currentPoints || 0} pts
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {user.isBlocked 
                          ? <span style={{ background: 'rgba(255, 68, 68, 0.15)', color: '#ff4444', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>Blocked</span>
                          : user.isVerified 
                            ? <span style={{ background: 'rgba(0, 230, 118, 0.15)', color: '#00e676', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>Verified</span> 
                            : <span style={{ background: 'rgba(255, 145, 0, 0.15)', color: '#ff9100', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>Pending</span>
                        }
                      </td>
                      <td style={{ padding: '16px', color: '#aaa' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => fetchUserDetail(user._id)}
                            disabled={loadingUserDetail}
                            style={{ 
                              padding: '8px 14px', 
                              background: 'rgba(0, 184, 212, 0.2)', 
                              color: '#00b8d4', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            <i className="fa-solid fa-eye"></i> View
                          </button>
                          <button 
                            onClick={() => { setBlockUser(user); setShowBlockModal(true); }}
                            style={{ 
                              padding: '8px 14px', 
                              background: user.isBlocked ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 68, 68, 0.2)', 
                              color: user.isBlocked ? '#00e676' : '#ff4444', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            {user.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#aaa'}}>No users found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: 'white', fontSize: '1.2rem' }}>All Orders ({orders.length})</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ff0055' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>Order #</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>Customer</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>Items</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>Payment</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '16px', color: '#00e676', fontWeight: '600' }}>#{order.orderNumber}</td>
                      <td style={{ padding: '16px', color: 'white' }}>
                        <div>{order.userId?.name || 'N/A'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{order.userId?.email}</div>
                      </td>
                      <td style={{ padding: '16px', color: '#aaa' }}>{order.items?.length || 0} items</td>
                      <td style={{ padding: '16px', color: '#00e676', fontWeight: '600' }}>₹{order.finalAmount}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          background: `rgba(${getStatusColor(order.paymentStatus) === '#00e676' ? '0,230,118' : getStatusColor(order.paymentStatus) === '#ff4444' ? '255,68,68' : '255,145,0'}, 0.15)`, 
                          color: getStatusColor(order.paymentStatus), 
                          padding: '4px 10px', 
                          borderRadius: '15px', 
                          fontSize: '0.8rem',
                          textTransform: 'capitalize'
                        }}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          background: `rgba(${getStatusColor(order.orderStatus) === '#00e676' ? '0,230,118' : getStatusColor(order.orderStatus) === '#ff4444' ? '255,68,68' : '255,145,0'}, 0.15)`, 
                          color: getStatusColor(order.orderStatus), 
                          padding: '4px 10px', 
                          borderRadius: '15px', 
                          fontSize: '0.8rem',
                          textTransform: 'capitalize'
                        }}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#aaa', fontSize: '0.9rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '16px' }}>
                        <button 
                          onClick={() => openOrderModal(order)}
                          style={{ 
                            padding: '8px 14px', 
                            background: '#333', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer'
                          }}
                        >
                          <i className="fa-solid fa-pen"></i> Update
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan="8" style={{textAlign: 'center', padding: '40px', color: '#aaa'}}>No orders found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Game Add/Edit Modal */}
      {showModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99999
          }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div 
            style={{
              background: '#1e1e1e',
              padding: '30px',
              borderRadius: '16px',
              width: '500px',
              maxWidth: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid #333'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
               <h2 style={{ margin: 0, color: 'white' }}>{currentGame ? 'Edit Game' : 'Add New Game'}</h2>
               <button 
                 style={{ background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}
                 onClick={() => setShowModal(false)}
               >×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Game ID (Unique)</label>
                <input 
                  type="text" 
                  name="id" 
                  value={formData.id} 
                  onChange={handleInputChange} 
                  readOnly={!!currentGame} 
                  required
                  style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #333', color: 'white', borderRadius: '8px', boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  required
                  style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #333', color: 'white', borderRadius: '8px', boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Price (₹)</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    required
                    style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #333', color: 'white', borderRadius: '8px', boxSizing: 'border-box' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Old Price (₹)</label>
                  <input 
                    type="number" 
                    name="oldPrice" 
                    value={formData.oldPrice} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #333', color: 'white', borderRadius: '8px', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Image URL</label>
                <input 
                  type="text" 
                  name="image" 
                  value={formData.image} 
                  onChange={handleInputChange} 
                  required
                  style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #333', color: 'white', borderRadius: '8px', boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Tag</label>
                  <input 
                    type="text" 
                    name="tag" 
                    value={formData.tag} 
                    onChange={handleInputChange} 
                    placeholder="e.g., New, Sale"
                    style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #333', color: 'white', borderRadius: '8px', boxSizing: 'border-box' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Category</label>
                  <input 
                    type="text" 
                    name="category" 
                    value={formData.category} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #333', color: 'white', borderRadius: '8px', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  rows="3"
                  style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #333', color: 'white', borderRadius: '8px', resize: 'vertical', boxSizing: 'border-box' }} 
                />
              </div>
              <button 
                type="submit"
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  background: '#ff0055', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: '600', 
                  fontSize: '1rem' 
                }}
              >
                {currentGame ? 'Update Game' : 'Add Game'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99999
          }}
        >
          <div 
            style={{
              background: '#1e1e1e',
              padding: '30px',
              borderRadius: '16px',
              width: '400px',
              maxWidth: '90%',
              textAlign: 'center',
              border: '1px solid #333'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{ color: 'white', marginBottom: '10px' }}>Delete Game?</h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>
              This action cannot be undone. Are you sure you want to delete this game?
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                onClick={() => { setShowDeleteModal(false); setDeleteGameId(null); }}
                style={{ 
                  background: 'transparent', 
                  border: '1px solid #444', 
                  color: 'white', 
                  padding: '12px 30px', 
                  borderRadius: '8px', 
                  cursor: 'pointer'
                }}
              >Cancel</button>
              <button 
                onClick={handleDelete}
                style={{ 
                  background: '#ff4444', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 30px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {showBlockModal && blockUser && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99999
          }}
        >
          <div 
            style={{
              background: '#1e1e1e',
              padding: '30px',
              borderRadius: '16px',
              width: '450px',
              maxWidth: '90%',
              border: '1px solid #333'
            }}
          >
            <h2 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>
              {blockUser.isBlocked ? 'Unblock User' : 'Block User'}
            </h2>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <p style={{ color: '#aaa', marginBottom: '5px' }}>User: <strong style={{ color: 'white' }}>{blockUser.name || blockUser.email}</strong></p>
              <p style={{ color: '#aaa' }}>Email: {blockUser.email}</p>
            </div>

            {!blockUser.isBlocked && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#aaa', marginBottom: '15px', textAlign: 'center' }}>Select block duration:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                  {[7, 14, 30, -1].map(days => (
                    <button 
                      key={days}
                      onClick={() => handleBlockUser(days)}
                      style={{ 
                        padding: '12px', 
                        background: days === -1 ? 'rgba(255, 68, 68, 0.3)' : '#333', 
                        color: days === -1 ? '#ff4444' : 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      {days === -1 ? 'Forever' : `${days} Days`}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="number" 
                    placeholder="Custom days..."
                    value={customBlockDays}
                    onChange={(e) => setCustomBlockDays(e.target.value)}
                    style={{ 
                      flex: 1,
                      padding: '12px', 
                      background: '#121212', 
                      border: '1px solid #333', 
                      color: 'white', 
                      borderRadius: '8px' 
                    }}
                  />
                  <button 
                    onClick={() => customBlockDays && handleBlockUser(parseInt(customBlockDays))}
                    style={{ 
                      padding: '12px 20px', 
                      background: '#ff0055', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Block
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => { setShowBlockModal(false); setBlockUser(null); setCustomBlockDays(''); }}
                style={{ 
                  background: 'transparent', 
                  border: '1px solid #444', 
                  color: 'white', 
                  padding: '12px 30px', 
                  borderRadius: '8px', 
                  cursor: 'pointer'
                }}
              >Cancel</button>
              {blockUser.isBlocked && (
                <button 
                  onClick={() => handleBlockUser(0)}
                  style={{ 
                    background: '#00e676', 
                    color: 'black', 
                    border: 'none', 
                    padding: '12px 30px', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >Unblock User</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetailModal && selectedUserDetail && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
          onClick={(e) => e.target === e.currentTarget && setShowUserDetailModal(false)}
        >
          <div 
            style={{
              background: '#1e1e1e',
              padding: '30px',
              borderRadius: '16px',
              width: '800px',
              maxWidth: '95%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid #333'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ margin: 0, color: 'white' }}>User Details</h2>
              <button 
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}
                onClick={() => setShowUserDetailModal(false)}
              >×</button>
            </div>

            {/* User Info */}
            <div style={{ background: '#121212', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ color: '#aaa', fontSize: '0.85rem' }}>Name</label>
                  <p style={{ color: 'white', margin: '5px 0 0', fontWeight: '500' }}>{selectedUserDetail.name || 'N/A'}</p>
                </div>
                <div>
                  <label style={{ color: '#aaa', fontSize: '0.85rem' }}>Email</label>
                  <p style={{ color: 'white', margin: '5px 0 0' }}>{selectedUserDetail.email}</p>
                </div>
                <div>
                  <label style={{ color: '#aaa', fontSize: '0.85rem' }}>Username</label>
                  <p style={{ color: '#00e676', margin: '5px 0 0', fontWeight: '500' }}>{selectedUserDetail.username || 'N/A'}</p>
                </div>
                <div>
                  <label style={{ color: '#aaa', fontSize: '0.85rem' }}>Referral Code</label>
                  <p style={{ color: '#ff0055', margin: '5px 0 0', fontWeight: '500' }}>{selectedUserDetail.referralCode || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Wallet Section */}
            <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ color: 'white', margin: 0 }}>💰 Wallet & Points</h3>
                <button 
                  onClick={() => setShowPointsModal(true)}
                  style={{ 
                    padding: '8px 16px', 
                    background: '#ff8c00', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  <i className="fa-solid fa-coins"></i> Manage Points
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                <div style={{ background: 'rgba(255, 140, 0, 0.1)', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ color: '#ff8c00', fontSize: '1.8rem', fontWeight: '700' }}>{selectedUserDetail.wallet?.balance || 0}</div>
                  <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Current Points</div>
                </div>
                <div style={{ background: 'rgba(0, 230, 118, 0.1)', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ color: '#00e676', fontSize: '1.8rem', fontWeight: '700' }}>{selectedUserDetail.wallet?.totalPointsEarned || 0}</div>
                  <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Total Earned</div>
                </div>
                <div style={{ background: 'rgba(255, 68, 68, 0.1)', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ color: '#ff4444', fontSize: '1.8rem', fontWeight: '700' }}>{selectedUserDetail.wallet?.totalPointsRedeemed || 0}</div>
                  <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Total Redeemed</div>
                </div>
              </div>
            </div>

            {/* User Orders */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: 'white', marginBottom: '15px' }}>📦 Orders ({userOrders.length})</h3>
              {userOrders.length > 0 ? (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#121212' }}>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>Order #</th>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>Amount</th>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>Status</th>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map(order => (
                        <tr key={order._id} style={{ borderBottom: '1px solid #333' }}>
                          <td style={{ padding: '10px', color: '#00e676' }}>#{order.orderNumber}</td>
                          <td style={{ padding: '10px', color: 'white' }}>₹{order.finalAmount}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ color: getStatusColor(order.orderStatus), textTransform: 'capitalize' }}>{order.orderStatus}</span>
                          </td>
                          <td style={{ padding: '10px', color: '#aaa' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>No orders yet</p>
              )}
            </div>

            {/* Points History */}
            <div>
              <h3 style={{ color: 'white', marginBottom: '15px' }}>📊 Points History ({userPointsHistory.length})</h3>
              {userPointsHistory.length > 0 ? (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#121212' }}>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>Points</th>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>Type</th>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>Source</th>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>Description</th>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userPointsHistory.map(history => (
                        <tr key={history._id} style={{ borderBottom: '1px solid #333' }}>
                          <td style={{ padding: '10px', color: history.type === 'earned' ? '#00e676' : '#ff4444', fontWeight: '600' }}>
                            {history.type === 'earned' ? '+' : ''}{history.points}
                          </td>
                          <td style={{ padding: '10px', color: 'white', textTransform: 'capitalize' }}>{history.type}</td>
                          <td style={{ padding: '10px', color: '#aaa', textTransform: 'capitalize' }}>{history.source?.replace('_', ' ')}</td>
                          <td style={{ padding: '10px', color: '#aaa', fontSize: '0.9rem' }}>{history.description}</td>
                          <td style={{ padding: '10px', color: '#aaa' }}>{new Date(history.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>No points history</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Points Management Modal */}
      {showPointsModal && selectedUserDetail && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100000
          }}
        >
          <div 
            style={{
              background: '#1e1e1e',
              padding: '30px',
              borderRadius: '16px',
              width: '400px',
              maxWidth: '90%',
              border: '1px solid #333'
            }}
          >
            <h2 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>Manage Points</h2>
            <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '20px' }}>
              Current Balance: <strong style={{ color: '#ff8c00' }}>{selectedUserDetail.wallet?.currentPoints || 0} pts</strong>
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Action</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setPointsAction({...pointsAction, type: 'add'})}
                  style={{ 
                    flex: 1,
                    padding: '12px', 
                    background: pointsAction.type === 'add' ? '#00e676' : '#333', 
                    color: pointsAction.type === 'add' ? 'black' : 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  + Add Points
                </button>
                <button 
                  onClick={() => setPointsAction({...pointsAction, type: 'deduct'})}
                  style={{ 
                    flex: 1,
                    padding: '12px', 
                    background: pointsAction.type === 'deduct' ? '#ff4444' : '#333', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  - Deduct Points
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Points Amount</label>
              <input 
                type="number" 
                placeholder="Enter points..."
                value={pointsAction.points}
                onChange={(e) => setPointsAction({...pointsAction, points: e.target.value})}
                style={{ 
                  width: '100%',
                  padding: '12px', 
                  background: '#121212', 
                  border: '1px solid #333', 
                  color: 'white', 
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Reason (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g., Bonus, Compensation..."
                value={pointsAction.description}
                onChange={(e) => setPointsAction({...pointsAction, description: e.target.value})}
                style={{ 
                  width: '100%',
                  padding: '12px', 
                  background: '#121212', 
                  border: '1px solid #333', 
                  color: 'white', 
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => { setShowPointsModal(false); setPointsAction({ points: '', type: 'add', description: '' }); }}
                style={{ 
                  flex: 1,
                  background: 'transparent', 
                  border: '1px solid #444', 
                  color: 'white', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  cursor: 'pointer'
                }}
              >Cancel</button>
              <button 
                onClick={handleUpdatePoints}
                disabled={!pointsAction.points}
                style={{ 
                  flex: 1,
                  background: pointsAction.type === 'add' ? '#00e676' : '#ff4444', 
                  color: pointsAction.type === 'add' ? 'black' : 'white', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: '600',
                  opacity: pointsAction.points ? 1 : 0.5
                }}
              >
                {pointsAction.type === 'add' ? 'Add' : 'Deduct'} Points
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Update Modal */}
      {showOrderModal && selectedOrder && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99999
          }}
        >
          <div 
            style={{
              background: '#1e1e1e',
              padding: '30px',
              borderRadius: '16px',
              width: '500px',
              maxWidth: '90%',
              border: '1px solid #333'
            }}
          >
            <h2 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>Update Order #{selectedOrder.orderNumber}</h2>
            
            {/* Order Items Preview */}
            <div style={{ background: '#121212', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ color: '#aaa', marginBottom: '10px', fontSize: '0.9rem' }}>Order Items:</p>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: '0.9rem', marginBottom: '5px' }}>
                  <span>{item.title} x{item.quantity}</span>
                  <span style={{ color: '#00e676' }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #333', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: 'white' }}>Total:</strong>
                <strong style={{ color: '#00e676' }}>₹{selectedOrder.finalAmount}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Order Status</label>
              <select 
                value={orderUpdate.orderStatus}
                onChange={(e) => setOrderUpdate({...orderUpdate, orderStatus: e.target.value})}
                style={{ 
                  width: '100%',
                  padding: '12px', 
                  background: '#121212', 
                  border: '1px solid #333', 
                  color: 'white', 
                  borderRadius: '8px'
                }}
              >
                <option value="processing">Processing</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Payment Status</label>
              <select 
                value={orderUpdate.paymentStatus}
                onChange={(e) => setOrderUpdate({...orderUpdate, paymentStatus: e.target.value})}
                style={{ 
                  width: '100%',
                  padding: '12px', 
                  background: '#121212', 
                  border: '1px solid #333', 
                  color: 'white', 
                  borderRadius: '8px'
                }}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Tracking Number (Optional)</label>
              <input 
                type="text" 
                placeholder="Enter tracking number..."
                value={orderUpdate.trackingNumber}
                onChange={(e) => setOrderUpdate({...orderUpdate, trackingNumber: e.target.value})}
                style={{ 
                  width: '100%',
                  padding: '12px', 
                  background: '#121212', 
                  border: '1px solid #333', 
                  color: 'white', 
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => { setShowOrderModal(false); setSelectedOrder(null); }}
                style={{ 
                  flex: 1,
                  background: 'transparent', 
                  border: '1px solid #444', 
                  color: 'white', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  cursor: 'pointer'
                }}
              >Cancel</button>
              <button 
                onClick={handleUpdateOrder}
                style={{ 
                  flex: 1,
                  background: '#ff0055', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >Update Order</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100001
          }}
        >
          <div 
            style={{
              background: '#1e1e1e',
              padding: '40px',
              borderRadius: '16px',
              width: '400px',
              maxWidth: '90%',
              textAlign: 'center',
              border: '1px solid #333',
              boxShadow: '0 10px 40px rgba(0, 230, 118, 0.2)'
            }}
          >
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: '20px',
              animation: 'pulse 1s ease-in-out'
            }}>✅</div>
            <h2 style={{ color: 'white', marginBottom: '10px', fontSize: '1.5rem' }}>Success!</h2>
            <p style={{ color: '#00e676', marginBottom: '30px', fontSize: '1.1rem', fontWeight: '500' }}>
              {successMessage}
            </p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              style={{ 
                background: '#00e676', 
                color: 'black', 
                border: 'none', 
                padding: '14px 50px', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1.1rem',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >Done</button>
          </div>
        </div>
      )}

      {/* Free Game Add/Edit Modal */}
      {showFreeGameModal && (
        <div 
          onClick={() => setShowFreeGameModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999999
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1e1e1e',
              padding: '30px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'white', fontSize: '1.3rem' }}>
                {currentFreeGame ? '✏️ Edit Free Game' : '🎮 Add Free Game'}
              </h2>
              <button onClick={() => setShowFreeGameModal(false)} style={{ background: 'transparent', border: 'none', color: '#aaa', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const url = currentFreeGame 
                ? `${API_URL}/api/admin/free-games/${currentFreeGame._id}`
                : `${API_URL}/api/admin/free-games`;
              const method = currentFreeGame ? 'PUT' : 'POST';
              
              try {
                const res = await fetch(url, {
                  method,
                  headers: getHeaders(),
                  body: JSON.stringify(freeGameForm)
                });
                const data = await res.json();
                if (data.success) {
                  setShowFreeGameModal(false);
                  fetchData();
                  setSuccessMessage(currentFreeGame ? 'Free Game Updated!' : 'Free Game Added!');
                  setShowSuccessModal(true);
                } else {
                  alert(data.message || 'Error saving free game');
                }
              } catch (error) {
                console.error('Error:', error);
                alert('Network error');
              }
            }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '0.9rem' }}>Title *</label>
                <input
                  type="text"
                  value={freeGameForm.title}
                  onChange={(e) => setFreeGameForm({...freeGameForm, title: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', background: '#121212', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  placeholder="e.g., Chess, Sudoku"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '0.9rem' }}>Description *</label>
                <textarea
                  value={freeGameForm.description}
                  onChange={(e) => setFreeGameForm({...freeGameForm, description: e.target.value})}
                  required
                  rows="3"
                  style={{ width: '100%', padding: '10px', background: '#121212', border: '1px solid #333', borderRadius: '6px', color: 'white', resize: 'vertical' }}
                  placeholder="Game description..."
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '0.9rem' }}>Image URL *</label>
                <input
                  type="url"
                  value={freeGameForm.image}
                  onChange={(e) => setFreeGameForm({...freeGameForm, image: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', background: '#121212', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '0.9rem' }}>Game URL *</label>
                <input
                  type="text"
                  value={freeGameForm.gameUrl}
                  onChange={(e) => setFreeGameForm({...freeGameForm, gameUrl: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', background: '#121212', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  placeholder="/games/game1/game1.html or external URL"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '0.9rem' }}>Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={freeGameForm.rating}
                    onChange={(e) => setFreeGameForm({...freeGameForm, rating: parseFloat(e.target.value)})}
                    style={{ width: '100%', padding: '10px', background: '#121212', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '0.9rem' }}>Display Order</label>
                  <input
                    type="number"
                    value={freeGameForm.order}
                    onChange={(e) => setFreeGameForm({...freeGameForm, order: parseInt(e.target.value) || 0})}
                    style={{ width: '100%', padding: '10px', background: '#121212', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#aaa', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={freeGameForm.isActive}
                    onChange={(e) => setFreeGameForm({...freeGameForm, isActive: e.target.checked})}
                    style={{ width: '18px', height: '18px' }}
                  />
                  Active (visible to users)
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowFreeGameModal(false)}
                  style={{ flex: 1, padding: '12px', background: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', background: '#ff0055', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {currentFreeGame ? 'Update Game' : 'Add Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Free Game Confirmation Modal */}
      {showDeleteFreeGameModal && (
        <div 
          onClick={() => setShowDeleteFreeGameModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999999
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1e1e1e',
              padding: '30px',
              borderRadius: '12px',
              textAlign: 'center',
              maxWidth: '400px'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🗑️</div>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>Delete Free Game?</h3>
            <p style={{ color: '#aaa', marginBottom: '20px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteFreeGameModal(false)}
                style={{ padding: '10px 25px', background: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_URL}/api/admin/free-games/${deleteFreeGameId}`, {
                      method: 'DELETE',
                      headers: getHeaders()
                    });
                    const data = await res.json();
                    if (data.success) {
                      setShowDeleteFreeGameModal(false);
                      fetchData();
                      setSuccessMessage('Free Game Deleted!');
                      setShowSuccessModal(true);
                    } else {
                      alert(data.message || 'Error deleting game');
                    }
                  } catch (error) {
                    console.error('Error:', error);
                    alert('Network error');
                  }
                }}
                style={{ padding: '10px 25px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
