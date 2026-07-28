import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

import { errorHandler } from './middleware/error.middleware.js';
import { validate } from './middleware/validate.middleware.js';
import { verifyToken, isAdmin, isLeader } from './middleware/auth.middleware.js';
import { metricsMiddleware } from './middleware/metrics.middleware.js';
import { cacheMiddleware, invalidateCache } from './middleware/cache.middleware.js';
import { setupSwagger } from './config/swagger.js';
import { register } from './utils/metrics.js';
import { logger } from './utils/logger.js';
import * as auditService from './services/audit.service.js';
import { searchTreks } from './services/search.service.js';
import { generateSignedUploadUrl } from './services/storage.service.js';

import * as auth from './controllers/auth.controller.js';
import * as packages from './controllers/package.controller.js';
import * as trips from './controllers/trip.controller.js';
import * as bookings from './controllers/booking.controller.js';
import * as payments from './controllers/payment.controller.js';
import * as reviews from './controllers/review.controller.js';
import * as contact from './controllers/contact.controller.js';
import * as admin from './controllers/admin.controller.js';
import * as cms from './controllers/cms.controller.js';

import { registerSchema, loginSchema } from './validations/auth.validation.js';
import { createBookingSchema, updateBookingStatusSchema } from './validations/booking.validation.js';
import { createPackageSchema, updatePackageSchema } from './validations/package.validation.js';
import { createTripSchema, updateTripStatusSchema, updateTripLocationSchema, tripSosSchema } from './validations/trip.validation.js';
import { processPaymentSchema } from './validations/payment.validation.js';
import { addReviewSchema } from './validations/review.validation.js';
import { submitContactSchema, subscribeNewsletterSchema } from './validations/contact.validation.js';
import { saveTrekCmsSchema, bulkTrekActionSchema, bulkCreateDeparturesSchema } from './validations/cms.validation.js';
import { asyncHandler } from './utils/asyncHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Compression & Middleware ──────────────────────────────────────────────
app.use(compression());

// ─── CORS Configuration ────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'https://therisingstarsadventures.org,https://www.therisingstarsadventures.org')
  .split(',').map(o => o.trim()).filter(Boolean);

const allowDynamicOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return true;
  return false;
};

// ─── Security & Global Middlewares ──────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'wss:', 'ws:', 'https:'],
    },
  },
}));

app.use(cors({
  origin: (origin, callback) => {
    if (allowDynamicOrigin(origin)) callback(null, true);
    else callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev', { stream: { write: (msg) => logger.http(msg.trim()) }, skip: () => process.env.NODE_ENV === 'test' }));
app.use(metricsMiddleware);

// ─── Rate Limiters ──────────────────────────────────────────────────────────
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many requests, please try again later.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: 'Too many auth attempts. Please try again later.' } });
app.use('/api', apiLimiter);

// ─── Prometheus Metrics Endpoint ────────────────────────────────────────────
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// ─── Swagger API Docs ───────────────────────────────────────────────────────
setupSwagger(app);

// ─── Auth Routes ────────────────────────────────────────────────────────────
const authRouter = express.Router();
authRouter.post('/register', authLimiter, validate(registerSchema), auth.register);
authRouter.post('/login', authLimiter, validate(loginSchema), auth.login);
authRouter.get('/profile', verifyToken, auth.getProfile);
app.use('/api/auth', authRouter);

// ─── Package Routes (Public & Dynamic API) ─────────────────────────
const packageRouter = express.Router();
packageRouter.get('/', cacheMiddleware('pkgs:all', 300), packages.getAllPackages);
packageRouter.get('/:id', cacheMiddleware((req) => `pkg:${req.params.id}`, 600), packages.getPackageById);
packageRouter.post('/', verifyToken, isAdmin, validate(createPackageSchema), packages.createPackage);
packageRouter.put('/:id', verifyToken, isAdmin, validate(updatePackageSchema), packages.updatePackage);
packageRouter.delete('/:id', verifyToken, isAdmin, packages.deletePackage);
app.use('/api/packages', packageRouter);

// ─── Enterprise Trek CMS Routes ────────────────────────────────────────────
const cmsRouter = express.Router();
cmsRouter.get('/treks', verifyToken, isAdmin, cms.listTreks);
cmsRouter.get('/treks/:id', verifyToken, isAdmin, cms.getTrek);
cmsRouter.post('/treks', verifyToken, isAdmin, validate(saveTrekCmsSchema), cms.saveTrek);
cmsRouter.post('/treks/:id/duplicate', verifyToken, isAdmin, cms.duplicateTrek);
cmsRouter.post('/treks/bulk-action', verifyToken, isAdmin, validate(bulkTrekActionSchema), cms.bulkAction);
cmsRouter.post('/trips/bulk-create', verifyToken, isAdmin, validate(bulkCreateDeparturesSchema), cms.bulkCreateDepartures);
cmsRouter.get('/treks/:id/versions', verifyToken, isAdmin, cms.getVersions);
cmsRouter.post('/treks/:id/restore-version/:versionId', verifyToken, isAdmin, cms.restoreVersion);
cmsRouter.get('/signed-upload', verifyToken, isAdmin, (req, res) => {
  const signed = generateSignedUploadUrl('treks');
  res.json({ signed });
});
app.use('/api/cms', cmsRouter);

// ─── Trip Routes ────────────────────────────────────────────────────────────
const tripRouter = express.Router();
tripRouter.get('/', verifyToken, isAdmin, trips.getAllTrips);
tripRouter.get('/upcoming', cacheMiddleware('trips:upcoming', 120), trips.getUpcomingTrips);
tripRouter.post('/', verifyToken, isAdmin, validate(createTripSchema), trips.createTrip);
tripRouter.put('/:id', verifyToken, isAdmin, validate(updateTripStatusSchema), trips.updateTripStatus);
tripRouter.put('/:id/location', verifyToken, isLeader, validate(updateTripLocationSchema), trips.updateTripLocation);
tripRouter.get('/:id/track', trips.getLiveLocation);
tripRouter.post('/:id/sos', verifyToken, isLeader, validate(tripSosSchema), trips.triggerSos);
tripRouter.post('/:id/sos/resolve', verifyToken, isLeader, trips.resolveSos);
tripRouter.post('/:id/photos', verifyToken, isLeader, trips.uploadTripPhotos);
tripRouter.get('/:id/photos', trips.getTripPhotos);
tripRouter.get('/:id/attendees', verifyToken, isLeader, trips.getTripAttendees);
app.use('/api/trips', tripRouter);

// ─── Booking Routes ─────────────────────────────────────────────────────────
const bookingRouter = express.Router();
bookingRouter.post('/', verifyToken, validate(createBookingSchema), bookings.createBooking);
bookingRouter.get('/my', verifyToken, bookings.getMyBookings);
bookingRouter.get('/', verifyToken, isAdmin, bookings.getAllBookings);
bookingRouter.put('/:id', verifyToken, isAdmin, validate(updateBookingStatusSchema), bookings.updateBookingStatus);
bookingRouter.put('/:id/status', verifyToken, isLeader, validate(updateBookingStatusSchema), bookings.updateBookingStatus);
app.use('/api/bookings', bookingRouter);

// ─── Payment Routes ─────────────────────────────────────────────────────────
const paymentRouter = express.Router();
paymentRouter.post('/', verifyToken, validate(processPaymentSchema), payments.processPayment);
app.use('/api/payments', paymentRouter);

// ─── Review Routes ──────────────────────────────────────────────────────────
const reviewRouter = express.Router();
reviewRouter.post('/', verifyToken, validate(addReviewSchema), reviews.addReview);
reviewRouter.get('/package/:trekId', cacheMiddleware((req) => `reviews:${req.params.trekId}`, 300), reviews.getPackageReviews);
app.use('/api/reviews', reviewRouter);

// ─── Contact & Newsletter Routes ────────────────────────────────────────────
const contactRouter = express.Router();
contactRouter.post('/', validate(submitContactSchema), contact.submitContact);
contactRouter.get('/', verifyToken, isAdmin, contact.getAllContactMessages);
app.use('/api/contact', contactRouter);

const newsletterRouter = express.Router();
newsletterRouter.post('/', validate(subscribeNewsletterSchema), contact.subscribeNewsletter);
newsletterRouter.get('/', verifyToken, isAdmin, contact.getAllNewsletterSubscribers);
app.use('/api/newsletter', newsletterRouter);

// ─── Admin Routes ───────────────────────────────────────────────────────────
const adminRouter = express.Router();
adminRouter.get('/stats', verifyToken, isAdmin, cacheMiddleware('admin:stats', 60), admin.getDashboardStats);
adminRouter.get('/audit', verifyToken, isAdmin, asyncHandler(async (req, res) => {
  const logs = await auditService.getAuditLogs({
    entity: req.query.entity,
    entityId: req.query.entityId,
    userId: req.query.userId,
    limit: parseInt(req.query.limit) || 50,
    offset: parseInt(req.query.offset) || 0,
  });
  res.json(logs);
}));
app.use('/api/admin', adminRouter);

// ─── Search Route ───────────────────────────────────────────────────────────
app.get('/api/search', cacheMiddleware((req) => `search:${JSON.stringify(req.query)}`, 120), asyncHandler(async (req, res) => {
  const results = await searchTreks(req.query);
  res.json(results);
}));

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({ name: 'The Rising Stars API', version: '2.1.0', status: 'online', architecture: 'enterprise-cms' });
});

// ─── Static Frontend Files ──────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../../')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use(errorHandler);

export default app;
