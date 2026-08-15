import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || '*';

// Middlewares
app.use(cors({
  origin: CLIENT_URL === '*' ? '*' : [CLIENT_URL, 'http://localhost:8081', 'http://localhost:19006', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api', taskRoutes);

// Global Error Handler
app.use(errorHandler);

// Start standalone Express server
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`========================================`);
  console.log(`🚀 VoiceTask AI Backend Server Running`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Model: gemini-3.7-flash`);
  console.log(`========================================`);
});

export default app;
