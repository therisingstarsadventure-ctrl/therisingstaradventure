import { prisma } from '../utils/db.js';

export const createPaymentInDb = async (data) => {
  return await prisma.payment.create({ data });
};

export const updateBookingStatusInDb = async (bookingId, status) => {
  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
};

export const incrementTripBookedSeatsInDb = async (tripId, seats) => {
  return await prisma.trip.update({
    where: { id: tripId },
    data: {
      bookedSeats: {
        increment: seats,
      },
    },
  });
};
