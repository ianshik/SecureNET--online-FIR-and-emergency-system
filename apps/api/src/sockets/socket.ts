import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import http from 'http';
import { verifyToken } from '../utils/jwt';

let ioInstance: Server | null = null;

export const getIO = (): Server => {
  if (!ioInstance) throw new Error('Socket.io not initialized');
  return ioInstance;
};

export const setupSocket = (server: http.Server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const io = ioInstance;

  console.log("REDIS_URL =", process.env.REDIS_URL);

  try {
    const pubClient = createClient({
      url: process.env.REDIS_URL
    });

    const subClient = pubClient.duplicate();

    Promise.all([
      pubClient.connect(),
      subClient.connect()
    ])
      .then(() => {
        console.log("✅ Redis Connected");
        io.adapter(createAdapter(pubClient, subClient));
      })
      .catch((err) => {
        console.error("❌ Redis Connection Failed");
        console.error(err);
      });

  } catch (err) {
    console.error("❌ Redis Setup Failed");
    console.error(err);
  }

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
