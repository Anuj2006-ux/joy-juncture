import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, games: 0 });
  const [games, setGames] = useState([]);
  const [users, setUsers] = useState([]); // New state for users
  const [activeTab, setActiveTab] = useState('games'); // 'games' or 'users'
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteGameId, setDeleteGameId] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockUser, setBlockUser] = useState(null);
  const [customBlockDays, setCustomBlockDays] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentGame, setCurrentGame] = useState(null);
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
      const statsRes = await fetch(API_URL + '/api/admin/stats', { headers: getHeaders() });
      if (statsRes.status === 401 || statsRes.status === 403) {
        alert('Unauthorized. Please login as admin.');
        navigate('/login');
        return;
      }
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      const gamesRes = await fetch(API_URL + '/api/admin/games', { headers: getHeaders() });
      const gamesData = await gamesRes.json();
      if (gamesData.success) setGames(gamesData.games);

      const usersRes = await fetch(API_URL + '/api/admin/users', { headers: getHeaders() });
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.users);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    const isEdit = !!currentGame;
    const url = isEdit 
      ? API_URL + `/api/admin/games/${currentGame.id}`
      : API_URL + '/api/admin/games';
    
    const method = isEdit ? 'PUT' : 'POST';
    console.log('Sending request to:', url, 'Method:', method);

    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setShowModal(false);
        fetchData(); // Refresh list
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
          days: days // -1 means forever, 0 means unblock
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
    console.log('Add button clicked, opening modal...');
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
    console.log('Modal state set to true');
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

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><i className="fa-solid fa-users"></i></div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <div className="value">{stats.users}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fa-solid fa-gamepad"></i></div>
          <div className="stat-info">
            <h3>Total Games</h3>
            <div className="value">{stats.games}</div>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'games' ? 'active' : ''}`}
          onClick={() => setActiveTab('games')}
        >
          Games Management
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users List
        </button>
      </div>

      <div className="admin-content-area">
        {activeTab === 'games' ? (
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
        ) : (
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
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Username</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Created At</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ff0055', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '16px', color: 'white', fontWeight: '500' }}>{user.name || 'N/A'}</td>
                      <td style={{ padding: '16px', color: '#aaa' }}>{user.email}</td>
                      <td style={{ padding: '16px', color: '#00e676', fontWeight: '500' }}>{user.username || 'N/A'}</td>
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
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#aaa'}}>No users found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

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
                  style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #333', color: 'white', borderRadius: '8px' }} 
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required 
                  style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                 <div style={{ flex: 1, marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Price</label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} required 
                      style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                    />
                 </div>
                 <div style={{ flex: 1, marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Old Price (Optional)</label>
                    <input type="number" name="oldPrice" value={formData.oldPrice} onChange={handleInputChange} 
                      style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                    />
                 </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Image URL</label>
                <input type="text" name="image" value={formData.image} onChange={handleInputChange} required 
                  style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                />
                {formData.image && <div style={{ marginTop: '10px', height: '150px', borderRadius: '8px', overflow: 'hidden' }}><img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Tag (e.g., Best Seller)</label>
                <input type="text" name="tag" value={formData.tag} onChange={handleInputChange} 
                  style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #333' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ background: 'transparent', border: '1px solid #444', color: 'white', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer' }}
                >Cancel</button>
                <button type="submit"
                  style={{ background: '#ff0055', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >{currentGame ? 'Update Game' : 'Add Game'}</button>
              </div>
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
          onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}
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
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🗑️</div>
            <h2 style={{ color: 'white', marginBottom: '10px' }}>Delete Game?</h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>
              Are you sure you want to delete this game? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => { setShowDeleteModal(false); setDeleteGameId(null); }}
                style={{ 
                  background: 'transparent', 
                  border: '1px solid #444', 
                  color: 'white', 
                  padding: '12px 30px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontSize: '1rem'
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
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >Yes, Delete</button>
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
          onClick={(e) => e.target === e.currentTarget && setShowBlockModal(false)}
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
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{blockUser.isBlocked ? '🔓' : '🚫'}</div>
              <h2 style={{ color: 'white', marginBottom: '10px' }}>
                {blockUser.isBlocked ? 'Unblock User?' : 'Block User?'}
              </h2>
              <p style={{ color: '#aaa', marginBottom: '5px' }}>
                <strong style={{ color: '#ff0055' }}>{blockUser.username || blockUser.email}</strong>
              </p>
            </div>

            {!blockUser.isBlocked && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#aaa', marginBottom: '15px', textAlign: 'center' }}>Select block duration:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                  {[
                    { label: '1 Day', days: 1 },
                    { label: '7 Days', days: 7 },
                    { label: '1 Month', days: 30 },
                    { label: '6 Months', days: 180 },
                  ].map(opt => (
                    <button 
                      key={opt.days}
                      onClick={() => handleBlockUser(opt.days)}
                      style={{ 
                        padding: '12px', 
                        background: '#333', 
                        color: 'white', 
                        border: '1px solid #444', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.borderColor = '#ff0055'}
                      onMouseOut={(e) => e.target.style.borderColor = '#444'}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => handleBlockUser(-1)}
                  style={{ 
                    width: '100%',
                    padding: '12px', 
                    background: '#ff4444', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontWeight: '600',
                    marginBottom: '15px'
                  }}
                >
                  🚫 Block Forever
                </button>
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
            zIndex: 99999
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
    </div>
  );
};

export default AdminDashboard;
