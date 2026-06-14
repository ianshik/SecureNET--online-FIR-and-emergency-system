import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB } from './config/db';
import authRoutes from './features/auth/auth.routes';
import complaintRoutes from './features/complaints/complaint.routes';
import sosRoutes from './features/sos/sos.routes';
import dispatchRoutes from './features/dispatch/dispatch.routes';
import firRoutes from './features/fir/fir.routes';
import evidenceRoutes from './features/evidence/evidence.routes';
import aiRoutes from './features/ai/ai.routes';
import analyticsRoutes from './features/analytics/analytics.routes';
import notificationRoutes from './features/notifications/notification.routes';
import usersRoutes from './features/users/users.routes';
import { setupSocket } from './sockets/socket';
import path from "path";
dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});
console.log("REDIS_URL =", process.env.REDIS_URL);

const app = express();
const port = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.NEXTAUTH_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
setupSocket(server);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/fir', firRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'SecureNet API is running' });
});

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
