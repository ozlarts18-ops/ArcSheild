import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import connectDB, { getDBStatus } from './config/db.js';
import { initRedis, getRedisStatus } from './config/redis.js';
import { SECURITY_CONFIG } from './config/security.js';
import sanitizeInput from './middleware/sanitize.js';
import errorHandler from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import {
  INITIAL_HELMETS,
  INITIAL_READINGS,
  INITIAL_ALERTS,
  INITIAL_INCIDENTS,
  INITIAL_TIMELINE,
  ACTIVE_SESSION,
  INITIAL_WORKERS
} from './services/store.js';
import { SimulatorService } from './services/simulatorService.js';
import { createApiRouter } from './routes/api.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// 1. HTTP Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*", "wss://*", "https://*"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Strict CORS Configuration
const allowedOrigins = SECURITY_CONFIG.ALLOWED_ORIGINS;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server health checks)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => 
      origin === allowed || 
      origin.startsWith(allowed) || 
      (!SECURITY_CONFIG.IS_PRODUCTION && origin.includes('localhost'))
    );

    if (isAllowed) {
      return callback(null, true);
    }
    
    if (SECURITY_CONFIG.IS_PRODUCTION) {
      console.warn(`[CORS] Blocked unauthorized origin: ${origin}`);
      return callback(new Error(`CORS Error: Origin ${origin} not authorized by ArcShield security policy.`));
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

// 3. Request Body Size Limit & NoSQL Injection Sanitizer
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(sanitizeInput);

// 4. In-Memory Operational State Container
const state = {
  helmets: JSON.parse(JSON.stringify(INITIAL_HELMETS)),
  readings: JSON.parse(JSON.stringify(INITIAL_READINGS)),
  alerts: JSON.parse(JSON.stringify(INITIAL_ALERTS)),
  incidents: JSON.parse(JSON.stringify(INITIAL_INCIDENTS)),
  timeline: JSON.parse(JSON.stringify(INITIAL_TIMELINE)),
  activeSession: JSON.parse(JSON.stringify(ACTIVE_SESSION)),
  workers: JSON.parse(JSON.stringify(INITIAL_WORKERS))
};

// 5. Secure Socket.IO Setup with Role-Based Room Isolation
const io = new SocketIOServer(server, {
  cors: {
    origin: SECURITY_CONFIG.ALLOWED_ORIGINS.length > 0 ? SECURITY_CONFIG.ALLOWED_ORIGINS : '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket Authentication & Room Authorization Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
  if (token) {
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    jwt.verify(cleanToken, SECURITY_CONFIG.JWT_SECRET, (err, decoded) => {
      if (!err && decoded) {
        socket.user = decoded;
      }
      next(); // Proceed with or without user payload (guest allowed for public landing)
    });
  } else {
    next();
  }
});

io.on('connection', (socket) => {
  const user = socket.user;

  if (user) {
    if (user.role === 'ADMIN') {
      socket.join('admin:monitoring');
      console.log(`[Socket.IO] Admin ${user.id} joined admin:monitoring`);
    } else {
      socket.join(`user:${user.id}`);
      socket.join(`helmet:${user.assignedHelmetId || 'ARC-001'}`);
      console.log(`[Socket.IO] User ${user.id} joined room user:${user.id}`);
    }
  }

  // Send initial scoped state snapshot
  socket.emit('state:full', {
    helmets: user?.role === 'ADMIN' ? state.helmets : state.helmets.filter(h => h.id === 'AS-001'),
    readings: state.readings,
    alerts: user?.role === 'ADMIN' ? state.alerts : state.alerts.filter(a => a.helmetId === 'AS-001'),
    activeSession: state.activeSession
  });

  socket.on('disconnect', () => {
    // Clean disconnection
  });
});

// 6. Background Telemetry Engine
const simulator = new SimulatorService(state, io);
simulator.startBackgroundSimulation();

// 7. Mount API Routes
app.use('/api', createApiRouter(state, simulator, io));

// 8. Safe Public Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ArcShield Connected Safety System',
    timestamp: new Date().toISOString()
  });
});

// 9. Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  // Initialize Database and Redis concurrently
  await connectDB();
  initRedis();

  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🛡️  ArcShield - Smart Connected Safety Gear Server`);
    console.log(`⚡  API running securely on port ${PORT}`);
    console.log(`🔒  Security: Helmet headers, Rate Limiting, JWT, RBAC, Redis`);
    console.log(`======================================================\n`);
  });
}

start();

export { app, server };
