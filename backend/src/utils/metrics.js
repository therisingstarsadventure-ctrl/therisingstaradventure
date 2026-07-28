import client from 'prom-client';

// Enable default Node.js metrics (CPU, memory, event loop lag, GC)
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// HTTP Request Duration
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// Active WebSocket / GPS Sessions
export const activeSocketConnections = new client.Gauge({
  name: 'socket_active_connections_total',
  help: 'Number of active Socket.IO connections',
  registers: [register],
});

// Booking counter
export const bookingsCreatedTotal = new client.Counter({
  name: 'bookings_created_total',
  help: 'Total number of bookings created',
  registers: [register],
});

// Payment counter
export const paymentsProcessedTotal = new client.Counter({
  name: 'payments_processed_total',
  help: 'Total number of payments processed',
  labelNames: ['status'],
  registers: [register],
});

// Cache hit/miss counters
export const cacheHits = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total number of Redis cache hits',
  labelNames: ['cache_key'],
  registers: [register],
});

export const cacheMisses = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total number of Redis cache misses',
  labelNames: ['cache_key'],
  registers: [register],
});

// GPS Location Updates
export const gpsUpdatesTotal = new client.Counter({
  name: 'gps_location_updates_total',
  help: 'Total number of GPS location updates received',
  registers: [register],
});

export { register };
