import { prisma } from '../utils/db.js';

export const createBooking = async (req, res, next) => {
  try {
    const { tripId, members } = req.body;
    const userId = req.user.id;

    if (!tripId || !members || parseInt(members) <= 0) {
      return res.status(400).json({ message: 'tripId and a positive number of members are required.' });
    }

    const memberCount = parseInt(members);

    // 1. Fetch Trip details including trek price
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        trek: { select: { title: true, price: true } }
      }
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip departure not found.' });
    }

    // 2. Validate seat availability
    const availableSeats = trip.totalSeats - trip.bookedSeats;
    if (memberCount > availableSeats) {
      return res.status(400).json({ 
        message: `Booking failed. Only ${availableSeats} seats remaining for this departure.`,
        remainingSeats: availableSeats
      });
    }

    // 3. Calculate total amount
    const totalAmount = trip.trek.price * memberCount;

    // 4. Create the booking in PENDING state
    const booking = await prisma.booking.create({
      data: {
        userId,
        tripId,
        members: memberCount,
        totalAmount,
        status: 'PENDING'
      },
      include: {
        trip: {
          include: {
            trek: { select: { title: true } }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Booking request created successfully. Please complete your payment.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        trip: {
          include: {
            trek: { select: { title: true, location: true, duration: true } }
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        trip: {
          include: {
            trek: { select: { title: true } }
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // CONFIRMED, CANCELLED

    if (!status || !['CONFIRMED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be CONFIRMED or CANCELLED.' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { trip: true }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Handle seat logic adjustments on state changes
    let bookedSeatsAdjustment = 0;
    
    if (booking.status !== 'CONFIRMED' && status === 'CONFIRMED') {
      // Transitioning to confirmed -> increase booked seats
      bookedSeatsAdjustment = booking.members;
    } else if (booking.status === 'CONFIRMED' && status === 'CANCELLED') {
      // Transitioning from confirmed to cancelled -> decrease booked seats
      bookedSeatsAdjustment = -booking.members;
    }

    // Check availability if confirming
    if (bookedSeatsAdjustment > 0) {
      const remaining = booking.trip.totalSeats - booking.trip.bookedSeats;
      if (bookedSeatsAdjustment > remaining) {
        return res.status(400).json({ message: `Cannot confirm. Not enough seats. Only ${remaining} available.` });
      }
    }

    // Perform database updates
    const updatedBooking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: parseInt(id) },
        data: { status }
      });

      if (bookedSeatsAdjustment !== 0) {
        await tx.trip.update({
          where: { id: booking.tripId },
          data: {
            bookedSeats: {
              increment: bookedSeatsAdjustment
            }
          }
        });
      }

      return b;
    });

    res.json({
      message: `Booking status updated to ${status}.`,
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};
