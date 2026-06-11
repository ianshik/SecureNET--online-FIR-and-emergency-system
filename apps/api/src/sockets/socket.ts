import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import http from 'http';
import { verifyToken } from '../utils/jwt';

export const setupSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  const subClient = pubClient.duplicate();

  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
  });

  // Middleware for auth
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = verifyToken(token);
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${(socket as any).user.id}`);
    const userRole = (socket as any).user.role;

    // Join room for specific role
    socket.join(`role:${userRole}`);
    
    // Join personal room
    socket.join(`user:${(socket as any).user.id}`);

    // Join case/incident specific room
    socket.on('join_incident_room', (incidentId: string) => {
      socket.join(`incident:${incidentId}`);
    });

    // Real-time location updates (officer to citizen or vice versa)
    socket.on('location:update', (data: { incidentId: string, coordinates: [number, number] }) => {
      io.to(`incident:${data.incidentId}`).emit('location:change', {
        userId: (socket as any).user.id,
        role: userRole,
        coordinates: data.coordinates,
        timestamp: new Date()
      });
    });

    // Chat functionality within incident
    socket.on('chat:send', (data: { incidentId: string, message: string }) => {
      io.to(`incident:${data.incidentId}`).emit('chat:receive', {
        senderId: (socket as any).user.id,
        message: data.message,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${(socket as any).user.id}`);
    });
  });

  return io;
};
