import { ApiError } from '../utils/ApiError.js';
import * as bookingRepository from '../repositories/booking.repository.js';
import * as tripRepository from '../repositories/trip.repository.js';
import { prisma } from '../utils/db.js';

export const createBooking = async (userId, { tripId, members }) => {
  const memberCount = parseInt(members);
  if (memberCount <= 0) {
    throw new ApiError(400, 'Positive number of members is required.');
  }

  // Use a serializable transaction to prevent race conditions during seat booking
  return await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: {
        trek: { select: { title: true, price: true } },
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip departure not found.');
    }

    const availableSeats = trip.totalSeats - trip.bookedSeats;
    if (memberCount > availableSeats) {
      throw new ApiError(
        400,
        `Booking failed. Only ${availableSeats} seats remaining for this departure.`
      );
    }

    // Decimal arithmetic safely handling price * members
    const trekPrice = Number(trip.trek.price);
    const totalAmount = trekPrice * memberCount;

    const booking = await tx.booking.create({
      data: {
        userId,
        tripId,
        members: memberCount,
        totalAmount,
        status: 'PENDING',
      },
      include: {
        trip: {
          include: {
            trek: { select: { title: true } },
          },
        },
      },
    });

    return {
      message: 'Booking request created successfully. Please complete your payment.',
      booking,
    };
  });
};

export const getMyBookings = async (userId) => {
  return await bookingRepository.findBookingsByUserId(userId);
};

export const getAllBookings = async () => {
  return await bookingRepository.findAllBookings();
};

export const updateBookingStatus = async (id, status) => {
  const validStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'ON_TRIP', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const bookingId = parseInt(id);
  const booking = await bookingRepository.findBookingById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found.');
  }

  const isSeatOccupying = (s) => ['CONFIRMED', 'CHECKED_IN', 'ON_TRIP', 'COMPLETED'].includes(s);
  const oldOccupying = isSeatOccupying(booking.status);
  const newOccupying = isSeatOccupying(status);

  let bookedSeatsAdjustment = 0;
  if (!oldOccupying && newOccupying) {
    bookedSeatsAdjustment = booking.members;
  } else if (oldOccupying && !newOccupying) {
    bookedSeatsAdjustment = -booking.members;
  }

  if (bookedSeatsAdjustment > 0) {
    const remaining = booking.trip.totalSeats - booking.trip.bookedSeats;
    if (bookedSeatsAdjustment > remaining) {
      throw new ApiError(400, `Cannot update status. Not enough seats. Only ${remaining} available.`);
    }
  }

  const updatedBooking = await bookingRepository.updateBookingAndTripSeats(
    bookingId,
    status,
    booking.tripId,
    bookedSeatsAdjustment
  );

  return {
    message: `Booking status updated to ${status}.`,
    booking: updatedBooking,
  };
};
