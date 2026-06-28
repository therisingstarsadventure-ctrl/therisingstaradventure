import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/error.middleware.js';
import * as auth from './controllers/auth.controller.js';
import * as packages from './controllers/package.controller.js';
import * as trips from './controllers/trip.controller.js';
import * as bookings from './controllers/booking.controller.js';
import * as payments from './controllers/payment.controller.js';
import * as reviews from './controllers/review.controller.js';
import * as contact from './controllers/contact.controller.js';
import * as admin from './controllers/admin.controller.js';
import { verifyToken, isAdmin, isLeader } from './middleware/auth.middleware.js';

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || 'https://therisingstarsadventures.org,https://www.therisingstarsadventures.org,https://api.therisingstarsadventures.org')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// 1. Security & Logger Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allow loading maps & fonts in development
}));

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan('dev'));

// Rate Limiter to protect endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

// 2. Auth Routes
const authRouter = express.Router();
authRouter.post('/register', auth.register);
authRouter.post('/login', auth.login);
authRouter.get('/profile', verifyToken, auth.getProfile);
app.use('/api/auth', authRouter);

// 3. Package Routes
const packageRouter = express.Router();
packageRouter.get('/', packages.getAllPackages);
packageRouter.get('/:id', packages.getPackageById);
packageRouter.post('/', verifyToken, isAdmin, packages.createPackage);
packageRouter.put('/:id', verifyToken, isAdmin, packages.updatePackage);
packageRouter.delete('/:id', verifyToken, isAdmin, packages.deletePackage);
app.use('/api/packages', packageRouter);

// 4. Trip Routes
const tripRouter = express.Router();
tripRouter.get('/', verifyToken, isAdmin, trips.getAllTrips);
tripRouter.get('/upcoming', trips.getUpcomingTrips);
tripRouter.post('/', verifyToken, isAdmin, trips.createTrip);
tripRouter.put('/:id', verifyToken, isAdmin, trips.updateTripStatus);
tripRouter.put('/:id/location', verifyToken, isLeader, trips.updateTripLocation);
tripRouter.get('/:id/track', trips.getLiveLocation);
app.use('/api/trips', tripRouter);

// 5. Booking Routes
const bookingRouter = express.Router();
bookingRouter.post('/', verifyToken, bookings.createBooking);
bookingRouter.get('/my', verifyToken, bookings.getMyBookings);
bookingRouter.get('/', verifyToken, isAdmin, bookings.getAllBookings);
bookingRouter.put('/:id', verifyToken, isAdmin, bookings.updateBookingStatus);
app.use('/api/bookings', bookingRouter);

// 6. Payment Routes
const paymentRouter = express.Router();
paymentRouter.post('/', verifyToken, payments.processPayment);
app.use('/api/payments', paymentRouter);

// 7. Review Routes
const reviewRouter = express.Router();
reviewRouter.post('/', verifyToken, reviews.addReview);
reviewRouter.get('/package/:trekId', reviews.getPackageReviews);
app.use('/api/reviews', reviewRouter);

// 8. Contact & Newsletter Routes
const contactRouter = express.Router();
contactRouter.post('/', contact.submitContact);
contactRouter.get('/', verifyToken, isAdmin, contact.getAllContactMessages);
app.use('/api/contact', contactRouter);

const newsletterRouter = express.Router();
newsletterRouter.post('/', contact.subscribeNewsletter);
newsletterRouter.get('/', verifyToken, isAdmin, contact.getAllNewsletterSubscribers);
app.use('/api/newsletter', newsletterRouter);

// 9. Admin Stats Router
const adminRouter = express.Router();
adminRouter.get('/stats', verifyToken, isAdmin, admin.getDashboardStats);
app.use('/api/admin', adminRouter);

// Base Route
app.get('/', (req, res) => {
  res.json({
    name: 'The Rising Stars API',
    version: '1.5.0',
    status: 'online',
    docs: 'https://github.com/shashank/the-rising-star'
  });
});

// 10. Global Error Handler
app.use(errorHandler);

export default app;
