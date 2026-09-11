import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../server/routes/auth.js';
import orderRoutes from '../server/routes/orders.js';
import uploadRoutes from '../server/routes/upload.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Routes (support both /api/* and /* paths for Vercel serverless functions)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/upload', uploadRoutes);

// Health check
app.get(['/api/health', '/health', '/api', '/'], (req, res) => {
  res.json({ status: 'ok', message: 'Winstar / Xerox Digital Pro API running on Vercel Serverless' });
});

export default app;
