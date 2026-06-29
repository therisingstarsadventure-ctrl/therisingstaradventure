import dotenv from 'dotenv';
import app from './app.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 ===================================================
🌐 The Rising Stars Backend Server Running
🔌 Port: ${PORT}
🌍 Mode: ${process.env.NODE_ENV || 'development'}
🤖 Database: Neon PostgreSQL via Prisma ORM
🎯 Base Endpoint: http://localhost:${PORT}/
🚀 ===================================================
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
