import { prisma } from '../utils/db.js';

export const processPayment = async (req, res, next) => {
  try {
    const { bookingId, transactionId, method, amount } = req.body;

    if (!bookingId || !method || !amount) {
      return res.status(400).json({ message: 'bookingId, method, and amount are required.' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { trip: true }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Verify amount matches
    const paymentAmount = parseFloat(amount);
    if (paymentAmount < booking.totalAmount) {
      return res.status(400).json({ message: `Insufficient amount. Total required is ₹${booking.totalAmount}.` });
    }

    // Check seat availability if confirming
    const remaining = booking.trip.totalSeats - booking.trip.bookedSeats;
    if (booking.status !== 'CONFIRMED' && booking.members > remaining) {
      return res.status(400).json({ message: `Cannot complete payment. Departure is fully booked. Only ${remaining} seats left.` });
    }

    const txnId = transactionId || `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Database transaction: Create payment entry, update booking to CONFIRMED, update trip bookedSeats
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: paymentAmount,
          paymentStatus: 'PAID',
          transactionId: txnId,
          method
        }
      });

      let updatedBooking = booking;
      if (booking.status !== 'CONFIRMED') {
        updatedBooking = await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'CONFIRMED' }
        });

        await tx.trip.update({
          where: { id: booking.tripId },
          data: {
            bookedSeats: {
              increment: booking.members
            }
          }
        });
      }

      return { payment, booking: updatedBooking };
    });

    res.status(201).json({
      message: 'Payment received. Booking confirmed!',
      payment: result.payment,
      booking: result.booking
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Transaction ID already exists. Please check details.' });
    }
    next(error);
  }
};
