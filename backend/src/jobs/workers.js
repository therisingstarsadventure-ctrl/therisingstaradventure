import { Queue, Worker } from 'bullmq';
import { redisClient } from '../utils/redis.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../utils/db.js';

// Only start queues if Redis is available
const connection = process.env.REDIS_URL
  ? { host: new URL(process.env.REDIS_URL).hostname, port: parseInt(new URL(process.env.REDIS_URL).port) || 6379 }
  : null;

let notificationQueue = null;
let bookingQueue = null;
let cleanupQueue = null;

if (connection) {
  notificationQueue = new Queue('notifications', { connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: true, removeOnFail: 50 } });
  bookingQueue = new Queue('bookings', { connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: true } });
  cleanupQueue = new Queue('cleanup', { connection, defaultJobOptions: { removeOnComplete: true } });

  // --- Notification Worker ---
  const notificationWorker = new Worker('notifications', async (job) => {
    const { type, to, data } = job.data;
    logger.info(`[Queue] Processing notification job: ${job.id} | type: ${type}`);

    switch (type) {
      case 'email:booking_confirmation':
        logger.info(`[Email] Booking confirmed: ${to} | BookingID: ${data.bookingId}`);
        break;
      case 'email:payment_receipt':
        logger.info(`[Email] Payment receipt: ${to} | TxnID: ${data.transactionId}`);
        break;
      case 'push:sos_alert':
        logger.warn(`[Push] SOS Alert sent to ops team | TripID: ${data.tripId}`);
        break;
      case 'sms:booking_confirmation':
        logger.info(`[SMS] Booking SMS: ${to} | BookingID: ${data.bookingId}`);
        break;
      default:
        logger.warn(`[Queue] Unknown notification type: ${type}`);
    }
    return { processed: true };
  }, { connection, concurrency: 10 });

  // --- Booking Worker ---
  const bookingWorker = new Worker('bookings', async (job) => {
    const { bookingId } = job.data;
    logger.info(`[Queue] Processing booking job: ${job.id} | BookingID: ${bookingId}`);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, trip: { include: { trek: true } } },
    });

    if (!booking) {
      logger.error(`[Queue] Booking not found: ${bookingId}`);
      return;
    }

    // Enqueue notification
    await notificationQueue.add('email:booking_confirmation', {
      type: 'email:booking_confirmation',
      to: booking.user.email,
      data: {
        bookingId: booking.id,
        userName: booking.user.name,
        trekName: booking.trip.trek.title,
        tripDate: booking.trip.date,
        members: booking.members,
        totalAmount: booking.totalAmount,
      },
    });

    return { notificationQueued: true };
  }, { connection, concurrency: 5 });

  // --- Cleanup Worker ---
  const cleanupWorker = new Worker('cleanup', async (job) => {
    logger.info(`[Queue] Cleanup job: ${job.id} | type: ${job.data.type}`);
    if (job.data.type === 'cancel_pending_bookings') {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = await prisma.booking.updateMany({
        where: { status: 'PENDING', createdAt: { lt: cutoff } },
        data: { status: 'CANCELLED' },
      });
      logger.info(`[Cleanup] Cancelled ${result.count} stale pending bookings`);
    }
  }, { connection, concurrency: 2 });

  notificationWorker.on('failed', (job, err) => logger.error(`[Queue] Notification job failed: ${job?.id} | ${err.message}`));
  bookingWorker.on('failed', (job, err) => logger.error(`[Queue] Booking job failed: ${job?.id} | ${err.message}`));
  cleanupWorker.on('failed', (job, err) => logger.error(`[Queue] Cleanup job failed: ${job?.id} | ${err.message}`));

  logger.info('BullMQ workers initialized (notifications, bookings, cleanup)');
} else {
  logger.warn('Redis unavailable — BullMQ workers disabled. Jobs will not be queued.');
}

export { notificationQueue, bookingQueue, cleanupQueue };
