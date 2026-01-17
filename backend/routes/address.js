const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const { isAuthenticated } = require('../middleware/authMiddleware');

// GET all addresses for user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean(); // Use lean() for faster read-only queries
    res.json({ success: true, addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch addresses' });
  }
});

// GET single address
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    res.json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch address' });
  }
});

// CREATE new address
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name, fullName, phone, addressLine1, addressLine2, city, state, pincode, country, isDefault } = req.body;

    // Validation
    if (!name || !fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    // If this is the first address, make it default
    const existingAddresses = await Address.countDocuments({ userId: req.user._id });
    const shouldBeDefault = existingAddresses === 0 ? true : isDefault;

    const address = new Address({
      userId: req.user._id,
      name,
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      pincode,
      country: country || 'India',
      isDefault: shouldBeDefault
    });

    await address.save();

    res.status(201).json({ success: true, message: 'Address added successfully', address });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ success: false, message: 'Failed to add address' });
  }
});

// UPDATE address
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, fullName, phone, addressLine1, addressLine2, city, state, pincode, country, isDefault } = req.body;

    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    address.name = name || address.name;
    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.addressLine1 = addressLine1 || address.addressLine1;
    address.addressLine2 = addressLine2 !== undefined ? addressLine2 : address.addressLine2;
    address.city = city || address.city;
    address.state = state || address.state;
    address.pincode = pincode || address.pincode;
    address.country = country || address.country;
    
    if (isDefault !== undefined) {
      address.isDefault = isDefault;
    }

    await address.save();

    res.json({ success: true, message: 'Address updated successfully', address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update address' });
  }
});

// DELETE address
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If deleted address was default, make another one default
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ userId: req.user._id });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
});

// SET default address
router.patch('/:id/default', isAuthenticated, async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    address.isDefault = true;
    await address.save();

    res.json({ success: true, message: 'Default address updated', address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to set default address' });
  }
});

module.exports = router;
