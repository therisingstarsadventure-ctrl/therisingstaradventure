import { logger } from '../utils/logger.js';
import { notificationQueue } from '../jobs/workers.js';

/**
 * Unified notification service. Routes notifications to the BullMQ queue
 * when available, otherwise logs and no-ops gracefully.
 */

export const sendBookingConfirmation = async (booking, user, trek) => {
  const payload = {
    type: 'email:booking_confirmation',
    to: user.email,
    data: {
      bookingId: booking.id,
      userName: user.name,
      trekName: trek.title,
      tripDate: booking.trip?.date,
      members: booking.members,
      totalAmount: String(booking.totalAmount),
    },
  };

  if (notificationQueue) {
    await notificationQueue.add('booking_confirmation', payload, { priority: 1 });
    logger.info(`[Notification] Queued booking confirmation for ${user.email}`);
  } else {
    logger.info(`[Notification] (no-queue) Booking confirmation for ${user.email}: ${JSON.stringify(payload.data)}`);
  }
};

export const sendPaymentReceipt = async (payment, user) => {
  const payload = {
    type: 'email:payment_receipt',
    to: user.email,
    data: {
      paymentId: payment.id,
      transactionId: payment.transactionId,
      amount: String(payment.amount),
      method: payment.method,
      userName: user.name,
    },
  };

  if (notificationQueue) {
    await notificationQueue.add('payment_receipt', payload, { priority: 1 });
    logger.info(`[Notification] Queued payment receipt for ${user.email}`);
  } else {
    logger.info(`[Notification] (no-queue) Payment receipt for ${user.email}: TxnID ${payment.transactionId}`);
  }
};

export const sendSosAlert = async (tripId, alert) => {
  const payload = {
    type: 'push:sos_alert',
    to: 'ops_dashboard',
    data: {
      tripId,
      alertId: alert.id,
      lat: alert.lat,
      lng: alert.lng,
    },
  };

  if (notificationQueue) {
    await notificationQueue.add('sos_alert', payload, { priority: 10 });
    logger.warn(`[Notification] Queued SOS alert for trip ${tripId}`);
  } else {
    logger.warn(`[Notification] (no-queue) SOS alert for trip ${tripId} at [${alert.lat},${alert.lng}]`);
  }
};

export const sendSmsNotification = async (phone, message) => {
  const payload = {
    type: 'sms:generic',
    to: phone,
    data: { message },
  };

  if (notificationQueue) {
    await notificationQueue.add('sms', payload);
    logger.info(`[Notification] Queued SMS to ${phone}`);
  } else {
    logger.info(`[Notification] (no-queue) SMS to ${phone}: ${message}`);
  }
};

export const sendPushNotification = async (userId, title, body, data = {}) => {
  const payload = {
    type: 'push:generic',
    to: String(userId),
    data: { title, body, ...data },
  };

  if (notificationQueue) {
    await notificationQueue.add('push', payload);
    logger.info(`[Notification] Queued push notification to user ${userId}`);
  } else {
    logger.info(`[Notification] (no-queue) Push to user ${userId}: ${title}`);
  }
};
