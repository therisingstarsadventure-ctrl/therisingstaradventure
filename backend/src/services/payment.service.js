import { ApiError } from '../utils/ApiError.js';
import * as bookingRepository from '../repositories/booking.repository.js';
import * as paymentRepository from '../repositories/payment.repository.js';
import { prisma } from '../utils/db.js';

export const processPayment = async (userId, { bookingId, transactionId, method = 'UPI' }) => {
  const bId = parseInt(bookingId);
  const booking = await bookingRepository.findBookingById(bId);

  if (!booking) {
    throw new ApiError(404, 'Booking not found.');
  }

  if (booking.userId !== userId) {
    throw new ApiError(403, 'Unauthorized transaction for this booking.');
  }

  if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
    throw new ApiError(400, 'Booking is already confirmed/paid.');
  }

  const txnId = transactionId || `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        bookingId: bId,
        amount: booking.totalAmount,
        paymentStatus: 'PAID',
        transactionId: txnId,
        method,
      },
    });

    const updatedBooking = await tx.booking.update({
      where: { id: bId },
      data: { status: 'CONFIRMED' },
    });

    await tx.trip.update({
      where: { id: booking.tripId },
      data: {
        bookedSeats: {
          increment: booking.members,
        },
      },
    });

    return {
      message: 'Payment processed successfully. Booking confirmed!',
      payment,
      booking: updatedBooking,
    };
  });
};
