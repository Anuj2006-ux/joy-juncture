const express = require('express');
const router = express.Router();

// POST /api/contact - Handle contact form submission
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, comment } = req.body;

        // Validate required fields
        if (!email || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Email and comment are required.'
            });
        }

        // Here you can:
        // 1. Save to database
        // 2. Send email notification
        // 3. Send to CRM system
        // For now, just log it
        console.log('Contact form submission:', { name, email, phone, comment });

        // TODO: Implement email sending or database storage
        // Example: await sendContactEmail({ name, email, phone, comment });
        // Example: await ContactMessage.create({ name, email, phone, comment });

        res.json({
            success: true,
            message: 'Thank you for contacting us! We\'ll get back to you soon.'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request.'
        });
    }
});

module.exports = router;
