import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './config/db.js';
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

// Enable CORS for Vite frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// In-Memory State container initialized with realistic production baseline
const state = {
  helmets: JSON.parse(JSON.stringify(INITIAL_HELMETS)),
  readings: JSON.parse(JSON.stringify(INITIAL_READINGS)),
  alerts: JSON.parse(JSON.stringify(INITIAL_ALERTS)),
  incidents: JSON.parse(JSON.stringify(INITIAL_INCIDENTS)),
  timeline: JSON.parse(JSON.stringify(INITIAL_TIMELINE)),
  activeSession: JSON.parse(JSON.stringify(ACTIVE_SESSION)),
  workers: JSON.parse(JSON.stringify(INITIAL_WORKERS))
};

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize Simulator Service
const simulator = new SimulatorService(state, io);
simulator.startBackgroundSimulation();

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Send initial full snapshot to newly connected supervisor client
  socket.emit('state:full', {
    helmets: state.helmets,
    readings: state.readings,
    alerts: state.alerts,
    incidents: state.incidents,
    timeline: state.timeline,
    activeSession: state.activeSession
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Mount API Routes
app.use('/api', createApiRouter(state, simulator, io));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'ArcShield Supervisor Safety System',
    timestamp: new Date().toISOString(),
    hardwareSupported: [
      'ESP32-S3 DevKit N16R8',
      'MAX6675 K-Type',
      'DHT22',
      'GUVA-S12SD',
      'BH1750',
      'MQ-2', 'MQ-5', 'MQ-7', 'MQ-135',
      'MPU6050',
      'TCRT5000',
      'NEO-6M GPS',
      'MicroSD 16GB'
    ]
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🛡️  ArcShield - Smart Connected Safety Gear Server`);
    console.log(`⚡  Supervisor Control API running on http://localhost:${PORT}`);
    console.log(`🔌  Socket.IO real-time stream active`);
    console.log(`🎯  Hardware model: ESP32-S3 + MAX6675 + DHT22 + GUVA-S12SD`);
    console.log(`    + MQ-2/5/7/135 + MPU6050 + TCRT5000 + NEO-6M + MicroSD`);
    console.log(`======================================================\n`);
  });
}

start();
