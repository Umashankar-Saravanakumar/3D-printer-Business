# 3D Print Pro - Professional 3D Printing Services

A clean, minimal website for 3D printing businesses built with HTML, CSS, JavaScript, and Node.js.

## Features

- **File Upload**: Support for multiple CAD formats (STL, OBJ, STEP, IGES, etc.)
- **3D Preview**: Interactive 3D viewer with Three.js showing models on virtual print bed
- **Order Management**: Complete order form with price calculation
- **Email Notifications**: Automatic order confirmations and status updates
- **Responsive Design**: Clean, modern UI that works on all devices
- **Simple Backend**: Node.js server for file handling and order processing

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   ```
   http://localhost:3000
   ```

## Configuration

### Email Setup (Optional)
To enable email notifications, create a `.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=3000
```

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use that password in the EMAIL_PASS field

## File Structure

```
├── index.html          # Main website page
├── styles.css          # All CSS styling
├── script.js           # Frontend JavaScript
├── server.js           # Node.js backend server
├── package.json        # Dependencies
├── uploads/            # Uploaded files (created automatically)
└── README.md          # This file
```

## How It Works

### Frontend (HTML/CSS/JavaScript)
- **Step 1**: Drag & drop or click to upload 3D files
- **Step 2**: View your model in 3D with interactive controls
- **Step 3**: Fill out order details and see price estimate
- **Step 4**: Get order confirmation with tracking ID

### Backend (Node.js)
- Handles file uploads with validation
- Stores orders in memory (easily replaceable with database)
- Sends email notifications to both customer and business
- Provides API endpoints for order management

## Supported File Formats

- **STL** (Stereolithography)
- **OBJ** (Wavefront OBJ)
- **PLY** (Polygon File Format)
- **STEP/STP** (Standard for Exchange of Product Data)
- **IGES/IGS** (Initial Graphics Exchange Specification)
- **3MF** (3D Manufacturing Format)
- **AMF** (Additive Manufacturing Format)

## Customization

### Styling
Edit `styles.css` to change colors, fonts, and layout. The design uses CSS Grid and Flexbox for responsive layouts.

### Pricing
Modify the `calculatePrice()` function in `script.js` to adjust pricing logic:
- Material costs
- Layer height multipliers
- Base pricing
- Volume calculations

### Email Templates
Update email templates in `server.js` in the `sendOrderNotifications()` function.

### File Processing
The current implementation creates a demo cube for non-STL files. For production, integrate with:
- **OpenCASCADE.js** for STEP/IGES conversion
- **FreeCAD Python API** for advanced conversions
- **Cloud conversion services**

## Production Deployment

### Database
Replace the in-memory `orders` array with a proper database:
```javascript
// Example with SQLite
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('orders.db');
```

### File Storage
For production, consider:
- **AWS S3** for file storage
- **Cloudinary** for file processing
- **Local NAS** for on-premise storage

### Security
- Add authentication for admin features
- Implement rate limiting
- Add file virus scanning
- Use HTTPS in production

### Scaling
- Use **PM2** for process management
- Add **Redis** for session storage
- Implement **load balancing**
- Add **monitoring** and **logging**

## API Endpoints

### File Upload
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (form field)
```

### Submit Order
```
POST /api/orders
Content-Type: application/json
Body: {customerName, customerEmail, fileId, ...}
```

### Get Order
```
GET /api/orders/:orderId
```

### Update Order Status
```
PATCH /api/orders/:orderId/status
Body: {status: "processing|printing|completed|cancelled"}
```

### List All Orders
```
GET /api/orders
```

## Browser Support

- **Chrome** 60+
- **Firefox** 55+
- **Safari** 12+
- **Edge** 79+

Requires WebGL support for 3D viewer.

## License

MIT License - feel free to use this for your 3D printing business!

## Support

For questions or customization help, contact: support@3dprintpro.com
