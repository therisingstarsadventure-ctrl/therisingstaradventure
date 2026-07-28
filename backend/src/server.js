import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';
import { initializeSocket } from './realtime/socket.js';
import { seedPermissions } from './services/rbac.service.js';
import { logger } from './utils/logger.js';
import { prisma } from './utils/db.js';

const PORT = process.env.PORT || 5000;

// Create HTTP server for both Express and Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO real-time engine
const io = initializeSocket(server);
app.set('io', io);

// Start server
server.listen(PORT, async () => {
  logger.info(`
🚀 ===================================================
🌐 The Rising Stars Enterprise Backend v2.0.0
🔌 Port: ${PORT}
🌍 Mode: ${process.env.NODE_ENV || 'development'}
🤖 Database: Neon PostgreSQL via Prisma ORM
📡 Real-time: Socket.IO enabled
📊 Metrics: http://localhost:${PORT}/metrics
📖 API Docs: http://localhost:${PORT}/api/docs
🎯 Base API: http://localhost:${PORT}/api
🚀 ===================================================
  `);

  // Seed RBAC permissions on startup (idempotent)
  try {
    await seedPermissions();
    logger.info('RBAC permissions seeded successfully.');
  } catch (err) {
    logger.error(`RBAC seed failed: ${err.message}`);
  }

  // Lazy-load BullMQ workers (only when Redis is available)
  try {
    await import('./jobs/workers.js');
  } catch (err) {
    logger.warn(`BullMQ workers not started: ${err.message}`);
  }
});

// ─── Graceful Shutdown ──────────────────────────────────────────────────────
const shutdown = async (signal) => {
  logger.warn(`${signal} received — starting graceful shutdown...`);

  // 1. Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed.');

    // 2. Close Socket.IO
    io.close(() => logger.info('Socket.IO closed.'));

    // 3. Disconnect Prisma
    await prisma.$disconnect();
    logger.info('Prisma disconnected.');

    logger.info('Graceful shutdown complete.');
    process.exit(0);
  });

  // Force shutdown after 15 seconds if graceful fails
  setTimeout(() => {
    logger.error('Forced shutdown after 15s timeout.');
    process.exit(1);
  }, 15000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  server.close(() => process.exit(1));
});
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  server.close(() => process.exit(1));
});
