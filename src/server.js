require('dotenv').config();
const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const commentRoutes = require('./routes/commentRoutes');
const contentRoutes = require('./routes/contentRoutes');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const app = express();

app.use(cors({
    origin: 'http://localhost:3000',   //  frontend origin
    credentials: true,                 // allow cookies, authorization headers, etc.
  }));

const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

(async () => {
  try {
    await connectDB(MONGO_URI);
  } catch (e) {
    console.error('DB connection failed', e);
    process.exit(1);
  }
})();

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: CORS_ORIGIN, methods: ['GET', 'POST'] }
});

// store io in express app so controllers can emit
app.set('io', io);

// basic middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: CORS_ORIGIN }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// routes
app.use('/auth', authRoutes);
app.use('/comments', commentRoutes);
app.use('/contents', contentRoutes);

// health
app.get('/ping', (req, res) => res.json({ ok: true }));

// error handler
app.use(errorHandler);

// socket events
io.on('connection', (socket) => {
  console.log('Client connected', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
