require('dotenv').config();
const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const commentRoutes = require('./routes/commentRoutes');
const contentRoutes = require('./routes/contentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();


const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Global CORS for API routes (optional)
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

// Serve uploads with guaranteed CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
}, express.static(path.join(__dirname, 'uploads')));




// ---------- Create HTTP server ----------
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// ---------- Connect to MongoDB ----------
(async () => {
  try {
    await connectDB(MONGO_URI);
    console.log('MongoDB connected');
  } catch (e) {
    console.error('DB connection failed', e);
    process.exit(1);
  }
})();

// ---------- Socket.io ----------
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: CORS_ORIGIN, methods: ['GET', 'POST'] },
});
app.set('io', io);

// ---------- Basic middlewares ----------
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

// ---------- Routes ----------
app.use('/auth', authRoutes);
app.use('/comments', commentRoutes);
app.use('/contents', contentRoutes);

// ---------- Health check ----------
app.get('/ping', (req, res) => res.json({ ok: true }));

// ---------- Error handler ----------
app.use(errorHandler);

// ---------- Socket events ----------
io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

// ---------- Start server ----------
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
