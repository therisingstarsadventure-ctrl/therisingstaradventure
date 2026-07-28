import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { cache } from '../utils/redis.js';
import { logger } from '../utils/logger.js';
import { activeSocketConnections, gpsUpdatesTotal } from '../utils/metrics.js';
import { env } from '../config/env.config.js';
import { prisma } from '../utils/db.js';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (origin.endsWith('.vercel.app') || origin.startsWith('http://localhost')) {
          return callback(null, true);
        }
        const allowed = (env.CORS_ORIGINS || '').split(',').map(o => o.trim());
        if (allowed.includes(origin)) return callback(null, true);
        callback(new Error('Socket.IO CORS blocked'));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 10000,
    transports: ['websocket', 'polling'],
  });

  // JWT Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    activeSocketConnections.inc();
    logger.info(`Socket connected: ${socket.id} | User: ${socket.user?.id} | Role: ${socket.user?.role}`);

    // --- LEADER: Join as broadcaster for a trip ---
    socket.on('leader:join', async ({ tripId }) => {
      if (socket.user?.role !== 'LEADER' && socket.user?.role !== 'ADMIN') {
        return socket.emit('error', { message: 'Only trip leaders can broadcast location.' });
      }
      try {
        const trip = await prisma.trip.findFirst({ where: { id: tripId, tripLeaderId: socket.user.id } });
        if (!trip) return socket.emit('error', { message: 'Trip not found or unauthorized.' });

        socket.join(`leader:${tripId}`);
        socket.join(`trip:${tripId}`);
        socket.tripId = tripId;
        logger.info(`Leader ${socket.user.id} joined trip room: ${tripId}`);
        socket.emit('leader:joined', { tripId, message: 'Broadcasting started.' });
      } catch (err) {
        logger.error(`leader:join error: ${err.message}`);
        socket.emit('error', { message: 'Failed to join trip room.' });
      }
    });

    // --- LEADER: Broadcast live location ---
    socket.on('location:update', async ({ lat, lng, speed = 0, batteryLevel = 100, eta = null }) => {
      if (!socket.tripId) return socket.emit('error', { message: 'Join a trip room first.' });

      const locationData = {
        tripId: socket.tripId,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        speed: parseFloat(speed),
        batteryLevel: parseInt(batteryLevel),
        eta,
        updatedAt: new Date().toISOString(),
      };

      // Cache in Redis immediately for polling fallback
      await cache.set(`trip:location:${socket.tripId}`, JSON.stringify(locationData), 86400);
      gpsUpdatesTotal.inc();

      // Broadcast to all trackers in the trip room
      io.to(`trip:${socket.tripId}`).emit('location:update', locationData);

      // Persist to DB asynchronously
      prisma.trip.update({
        where: { id: socket.tripId },
        data: {
          currentLat: locationData.lat,
          currentLng: locationData.lng,
          speed: locationData.speed,
          batteryLevel: locationData.batteryLevel,
          eta: locationData.eta,
          lastLocationUpdate: new Date(),
        },
      }).catch(err => logger.error(`DB location persist error: ${err.message}`));
    });

    // --- TRACKER: Subscribe to trip location feed ---
    socket.on('tracker:join', async ({ tripId }) => {
      socket.join(`trip:${tripId}`);
      socket.trackedTripId = tripId;
      logger.info(`Tracker ${socket.id} joined trip: ${tripId}`);

      // Send last known location immediately
      const cached = await cache.get(`trip:location:${tripId}`);
      if (cached) {
        socket.emit('location:update', JSON.parse(cached));
      } else {
        const trip = await prisma.trip.findUnique({ where: { id: tripId } });
        if (trip) {
          socket.emit('location:update', {
            tripId,
            lat: trip.currentLat,
            lng: trip.currentLng,
            speed: trip.speed,
            batteryLevel: trip.batteryLevel,
            eta: trip.eta,
            updatedAt: trip.lastLocationUpdate,
          });
        }
      }
    });

    // --- LEADER: Trigger SOS alert ---
    socket.on('sos:trigger', async ({ lat, lng }) => {
      if (!socket.tripId) return socket.emit('error', { message: 'Join a trip room first.' });

      try {
        const alert = await prisma.sosAlert.create({
          data: { tripId: socket.tripId, lat: parseFloat(lat), lng: parseFloat(lng), status: 'ACTIVE' },
        });
        io.to(`trip:${socket.tripId}`).emit('sos:alert', { alert, tripId: socket.tripId });
        logger.warn(`SOS triggered for trip ${socket.tripId} at [${lat},${lng}]`);
      } catch (err) {
        logger.error(`SOS trigger error: ${err.message}`);
        socket.emit('error', { message: 'Failed to create SOS alert.' });
      }
    });

    // --- LEADER: Resolve SOS ---
    socket.on('sos:resolve', async () => {
      if (!socket.tripId) return socket.emit('error', { message: 'Join a trip room first.' });
      await prisma.sosAlert.updateMany({
        where: { tripId: socket.tripId, status: 'ACTIVE' },
        data: { status: 'RESOLVED' },
      });
      io.to(`trip:${socket.tripId}`).emit('sos:resolved', { tripId: socket.tripId });
    });

    socket.on('disconnect', (reason) => {
      activeSocketConnections.dec();
      logger.info(`Socket disconnected: ${socket.id} | Reason: ${reason}`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error [${socket.id}]: ${err.message}`);
    });
  });

  logger.info('Socket.IO real-time engine initialized.');
  return io;
};
