const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files for uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Request Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0 && req.method !== 'GET') {
    // Don't log passwords
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = '[HIDDEN]';
    console.log('Request body:', logBody);
  }
  next();
});

// ✅ Routes
const authRoutes = require("./routes/auth");
const pinRoutes = require("./routes/pins");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");
const photoRoutes = require("./routes/photos"); // NEW: Photo routes
const journalRoutes = require("./routes/journal"); // NEW: Journal routes

app.use("/api/auth", authRoutes);
app.use("/api/pins", pinRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/photos", photoRoutes); // NEW: Photo endpoints
app.use("/api/journal", journalRoutes); // NEW: Journal endpoints

// ✅ Root Route
app.get("/", (req, res) => {
  res.json({
    message: "🎒 WanderLog API Server",
    version: "2.1.0", // Updated version
    endpoints: {
      auth: "/api/auth",
      pins: "/api/pins",
      users: "/api/users",
      messages: "/api/messages",
      photos: "/api/photos", // NEW: Photo endpoints
      journal: "/api/journal" // NEW: Journal endpoints
    },
    timestamp: new Date().toISOString()
  });
});

// ✅ Health Check Route
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// ✅ 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      "GET /",
      "GET /api/health",
      // Auth routes
      "POST /api/auth/register",
      "POST /api/auth/login",
      "POST /api/auth/google",
      "GET /api/auth/me",
      "PUT /api/auth/profile",
      "DELETE /api/auth/account",
      "POST /api/auth/logout",
      // Pin routes
      "GET /api/pins",
      "POST /api/pins",
      "PUT /api/pins/:id",
      "DELETE /api/pins/:id",
      "GET /api/pins/stats",
      "GET /api/pins/public",
      // User routes
      "GET /api/users/all",
      "GET /api/users/exploring",
      "GET /api/users/explorers",
      "GET /api/users/mutual-friends",
      "POST /api/users/explore",
      "POST /api/users/unexplore",
      "GET /api/users/:username",
      "GET /api/users/:username/explorers",
      "GET /api/users/:username/exploring",
      "GET /api/users/search/:query",
      // Message routes
      "GET /api/messages/conversations",
      "GET /api/messages/:userId",
      "POST /api/messages/send",
      "PUT /api/messages/mark-read/:userId",
      "DELETE /api/messages/:messageId",
      "GET /api/messages/unread/count",
      "GET /api/messages/requests",
      "GET /api/messages/requests/count",
      "GET /api/messages/requests/:senderId",
      "POST /api/messages/requests/:senderId/accept",
      "POST /api/messages/requests/:senderId/decline",
      // NEW: Photo routes
      "GET /api/photos/country/:countryCode",
      "GET /api/photos/country/:countryCode/public",
      "POST /api/photos/upload",
      "POST /api/photos/upload-base64",
      "PUT /api/photos/:photoId",
      "DELETE /api/photos/:photoId",
      "POST /api/photos/:photoId/like",
      "GET /api/photos/user/stats",
      // NEW: Journal routes
      "GET /api/journal/country/:countryCode",
      "GET /api/journal/country/:countryCode/public",
      "POST /api/journal",
      "GET /api/journal/:entryId",
      "PUT /api/journal/:entryId",
      "DELETE /api/journal/:entryId",
      "POST /api/journal/:entryId/like",
      "POST /api/journal/:entryId/comment",
      "GET /api/journal/user/stats",
      "GET /api/journal/search"
    ]
  });
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  
  // Handle multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files. Maximum is 10 files per upload.'
    });
  }
  
  if (err.message && err.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed.'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    console.log("📊 Database:", mongoose.connection.db.databaseName);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ Server Startup
app.listen(PORT, () => {
  console.log(`🚀 WanderLog API Server running on http://localhost:${PORT}`);
  console.log(`🔐 Authentication: http://localhost:${PORT}/api/auth`);
  console.log(`📍 Pins API: http://localhost:${PORT}/api/pins`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`💬 Messages API: http://localhost:${PORT}/api/messages`);
  console.log(`📸 Photos API: http://localhost:${PORT}/api/photos`); // NEW
  console.log(`📖 Journal API: http://localhost:${PORT}/api/journal`); // NEW
  console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
});