// Simple Node.js server for 3D Print Pro
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('.'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.stl', '.obj', '.ply', '.step', '.stp', '.iges', '.igs', '.3mf', '.amf'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type'));
        }
    }
});

// In-memory storage for orders (in production, use a database)
const orders = [];

// Email configuration (configure with your email service)
const emailTransporter = nodemailer.createTransporter({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Routes

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileInfo = {
            id: Date.now().toString(),
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            type: path.extname(req.file.originalname).toLowerCase(),
            uploadTime: new Date().toISOString()
        };

        res.json({
            success: true,
            file: fileInfo,
            message: 'File uploaded successfully'
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Get uploaded file
app.get('/api/files/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Submit order endpoint
app.post('/api/orders', (req, res) => {
    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            material,
            infill,
            layerHeight,
            quantity,
            notes,
            fileId,
            estimatedPrice
        } = req.body;

        // Validate required fields
        if (!customerName || !customerEmail || !fileId) {
            return res.status(400).json({ 
                error: 'Missing required fields: customerName, customerEmail, fileId' 
            });
        }

        // Generate order ID
        const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        const order = {
            orderId,
            customerName,
            customerEmail,
            customerPhone,
            material: material || 'PLA',
            infill: parseInt(infill) || 20,
            layerHeight: parseFloat(layerHeight) || 0.2,
            quantity: parseInt(quantity) || 1,
            notes: notes || '',
            fileId,
            estimatedPrice,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Store order
        orders.push(order);

        // Send email notifications
        sendOrderNotifications(order);

        res.json({
            success: true,
            orderId: order.orderId,
            message: 'Order submitted successfully'
        });

    } catch (error) {
        console.error('Order submission error:', error);
        res.status(500).json({ error: 'Failed to submit order' });
    }
});

// Get order by ID
app.get('/api/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const order = orders.find(o => o.orderId === orderId);
    
    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Get all orders (for admin)
app.get('/api/orders', (req, res) => {
    res.json({
        orders: orders.map(order => ({
            orderId: order.orderId,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            material: order.material,
            quantity: order.quantity,
            estimatedPrice: order.estimatedPrice,
            status: order.status,
            createdAt: order.createdAt
        }))
    });
});

// Update order status
app.patch('/api/orders/:orderId/status', (req, res) => {
    const orderId = req.params.orderId;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'printing', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            error: 'Invalid status',
            validStatuses 
        });
    }

    const order = orders.find(o => o.orderId === orderId);
    
    if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        
        // Send status update email
        sendStatusUpdateEmail(order);
        
        res.json({ 
            success: true, 
            message: `Order ${orderId} status updated to ${status}` 
        });
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Email functions
function sendOrderNotifications(order) {
    // Email to business owner
    const businessEmail = {
        from: process.env.EMAIL_USER || 'noreply@usautomation.com',
        to: process.env.EMAIL_USER || 'orders@usautomation.com',
        subject: `New 3D Print Order: ${order.orderId}`,
        html: `
            <h2>New 3D Print Order Received</h2>
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Email:</strong> ${order.customerEmail}</p>
            <p><strong>Phone:</strong> ${order.customerPhone || 'Not provided'}</p>
            <p><strong>Material:</strong> ${order.material}</p>
            <p><strong>Infill:</strong> ${order.infill}%</p>
            <p><strong>Layer Height:</strong> ${order.layerHeight}mm</p>
            <p><strong>Quantity:</strong> ${order.quantity}</p>
            <p><strong>Estimated Price:</strong> ${order.estimatedPrice}</p>
            <p><strong>Notes:</strong> ${order.notes || 'None'}</p>
        `
    };

    // Email to customer
    const customerEmail = {
        from: process.env.EMAIL_USER || 'noreply@usautomation.com',
        to: order.customerEmail,
        subject: `Order Confirmation: ${order.orderId}`,
        html: `
            <h2>Thank you for your order!</h2>
            <p>Hi ${order.customerName},</p>
            <p>We've received your 3D printing order and will begin processing it shortly.</p>
            <h3>Order Summary</h3>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Material:</strong> ${order.material}</p>
            <p><strong>Quantity:</strong> ${order.quantity}</p>
            <p><strong>Estimated Price:</strong> ${order.estimatedPrice}</p>
            <p>We'll send you updates as your order progresses.</p>
            <p>Best regards,<br>US Automation and Services Team</p>
        `
    };

    // Send emails (only if email is configured)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        emailTransporter.sendMail(businessEmail).catch(console.error);
        emailTransporter.sendMail(customerEmail).catch(console.error);
    } else {
        console.log('Email not configured. Order notifications would be sent to:');
        console.log('Business:', businessEmail);
        console.log('Customer:', customerEmail);
    }
}

function sendStatusUpdateEmail(order) {
    const statusMessages = {
        processing: 'Your order is now being processed.',
        printing: 'Your order is currently being printed!',
        completed: 'Your order has been completed and is ready for pickup/shipping.',
        cancelled: 'Your order has been cancelled.'
    };

    const email = {
        from: process.env.EMAIL_USER || 'noreply@usautomation.com',
        to: order.customerEmail,
        subject: `Order Update: ${order.orderId}`,
        html: `
            <h2>Order Status Update</h2>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
            <p>${statusMessages[order.status] || 'Your order status has been updated.'}</p>
            <p>Thank you for choosing US Automation and Services!</p>
        `
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        emailTransporter.sendMail(email).catch(console.error);
    } else {
        console.log('Status update email would be sent:', email);
    }
}

// Error handling
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 US Automation and Services server running on http://localhost:${PORT}`);
    console.log(`📁 Upload directory: ${uploadsDir}`);
    console.log(`📧 Email configured: ${process.env.EMAIL_USER ? 'Yes' : 'No'}`);
});

module.exports = app;
