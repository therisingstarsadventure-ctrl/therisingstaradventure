import { prisma } from '../utils/db.js';

export const createBookingInDb = async (data) => {
  return await prisma.booking.create({
    data,
    include: {
      trip: {
        include: {
          trek: { select: { title: true } },
        },
      },
    },
  });
};

export const findBookingsByUserId = async (userId) => {
  return await prisma.booking.findMany({
    where: { userId },
    include: {
      trip: {
        include: {
          trek: { select: { title: true, location: true, duration: true } },
        },
      },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const findAllBookings = async () => {
  return await prisma.booking.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } },
      trip: {
        include: {
          trek: { select: { title: true } },
        },
      },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const findBookingById = async (id) => {
  return await prisma.booking.findUnique({
    where: { id },
    include: { trip: true },
  });
};

export const updateBookingAndTripSeats = async (bookingId, newStatus, tripId, seatsAdjustment) => {
  return await prisma.$transaction(async (tx) => {
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });

    if (seatsAdjustment !== 0) {
      await tx.trip.update({
        where: { id: tripId },
        data: {
          bookedSeats: {
            increment: seatsAdjustment,
          },
        },
      });
    }

    return updatedBooking;
  });
};

export const countBookings = async () => {
  return await prisma.booking.count();
};

export const calculateTotalRevenue = async () => {
  const result = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { paymentStatus: 'PAID' },
  });
  return result._sum.amount ? Number(result._sum.amount) : 0;
};
