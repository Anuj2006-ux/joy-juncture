import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import './Addresses.css';

const Addresses = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
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
    const [message, setMessage] = useState({ type: '', text: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchAddresses();
    }, [navigate]);

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/api/address', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAddresses(data.addresses);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetForm = () => {
        setFormData({
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
        setEditingAddress(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const url = editingAddress
                ? API_URL + `/api/address/${editingAddress._id}`
                : API_URL + '/api/address';

            const response = await fetch(url, {
                method: editingAddress ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: editingAddress ? 'Address updated!' : 'Address added!' });
                fetchAddresses();
                resetForm();
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save address' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleEdit = (address) => {
        setFormData({
            name: address.name,
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country || 'India',
            isDefault: address.isDefault
        });
        setEditingAddress(address);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + `/api/address/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Address deleted' });
                fetchAddresses();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete address' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleSetDefault = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + `/api/address/${id}/default`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                fetchAddresses();
            }
        } catch (error) {
            console.error('Error setting default:', error);
        }
    };

    if (loading) {
        return (
            <div className="addresses-container">
                <div className="loading">Loading addresses...</div>
            </div>
        );
    }

    return (
        <div className="addresses-container">
            <div className="addresses-header">
                <h1>My Addresses</h1>
                <p>Manage your saved delivery addresses</p>
            </div>

            {message.text && (
                <div className={`address-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {!showForm ? (
                <>
                    <button className="add-address-btn" onClick={() => setShowForm(true)}>
                        <i className="fas fa-plus"></i> Add New Address
                    </button>

                    {addresses.length === 0 ? (
                        <div className="no-addresses">
                            <div className="no-address-icon">📍</div>
                            <h2>No Saved Addresses</h2>
                            <p>Add an address to make checkout faster</p>
                        </div>
                    ) : (
                        <div className="addresses-grid">
                            {addresses.map((address) => (
                                <div key={address._id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
                                    {address.isDefault && (
                                        <span className="default-badge">Default</span>
                                    )}
                                    <h3>{address.name}</h3>
                                    <p className="address-name">{address.fullName}</p>
                                    <p>{address.addressLine1}</p>
                                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                                    <p>{address.city}, {address.state} - {address.pincode}</p>
                                    <p className="address-phone"><i className="fas fa-phone"></i> {address.phone}</p>

                                    <div className="address-actions">
                                        <button className="edit-btn" onClick={() => handleEdit(address)}>
                                            <i className="fas fa-edit"></i> Edit
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDelete(address._id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                        {!address.isDefault && (
                                            <button className="default-btn" onClick={() => handleSetDefault(address._id)}>
                                                Set Default
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="address-form-container">
                    <button className="back-btn" onClick={resetForm}>
                        <i className="fas fa-arrow-left"></i> Back to Addresses
                    </button>

                    <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>

                    <form onSubmit={handleSubmit} className="address-form">
                        <div className="form-group">
                            <label>Address Label *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Home, Office, Mom's House"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Receiver's name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="10-digit mobile number"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Address Line 1 *</label>
                            <input
                                type="text"
                                name="addressLine1"
                                value={formData.addressLine1}
                                onChange={handleInputChange}
                                placeholder="House/Flat No., Building Name, Street"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Address Line 2</label>
                            <input
                                type="text"
                                name="addressLine2"
                                value={formData.addressLine2}
                                onChange={handleInputChange}
                                placeholder="Landmark (optional)"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>State *</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Pincode *</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    placeholder="6-digit pincode"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    disabled
                                />
                            </div>
                        </div>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleInputChange}
                            />
                            Set as default address
                        </label>

                        <button type="submit" className="save-address-btn" disabled={saving}>
                            {saving ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Addresses;
