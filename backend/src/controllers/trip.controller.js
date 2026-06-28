import { prisma } from '../utils/db.js';

export const getUpcomingTrips = async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        date: { gte: new Date() }
      },
      include: {
        trek: {
          select: { title: true, price: true, location: true, images: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    const formatted = trips.map(trip => {
      let gallery = [];
      try { gallery = JSON.parse(trip.trek.images); } catch (e) {}
      
      return {
        id: trip.id,
        trekId: trip.trekId,
        title: trip.trek.title,
        price: trip.trek.price,
        location: trip.trek.location,
        image: gallery[0] || '',
        date: trip.date,
        totalSeats: trip.totalSeats,
        bookedSeats: trip.bookedSeats,
        remainingSeats: Math.max(0, trip.totalSeats - trip.bookedSeats),
        status: trip.status
      };
    });

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getLiveLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Tracking token is required.' });
    }

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        trek: {
          select: { title: true, duration: true, location: true }
        },
        tripLeader: {
          select: { name: true, phone: true }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    // Verify token matches
    if (trip.trackingToken !== token) {
      return res.status(403).json({ message: 'Access denied. Invalid tracking token.' });
    }

    res.json({
      tripId: trip.id,
      trekName: trip.trek.title,
      location: trip.trek.location,
      duration: trip.trek.duration,
      tripDate: trip.date,
      leaderName: trip.tripLeader ? trip.tripLeader.name : 'Trek Leader',
      leaderPhone: trip.tripLeader ? trip.tripLeader.phone : '',
      status: trip.status,
      currentLat: trip.currentLat,
      currentLng: trip.currentLng,
      lastLocationUpdate: trip.lastLocationUpdate
    });
  } catch (error) {
    next(error);
  }
};

export const updateTripLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lat, lng, status } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Latitude (lat) and Longitude (lng) are required.' });
    }

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    // Verify that the logged in user is either admin or the assigned trip leader
    if (req.user.role !== 'ADMIN' && trip.tripLeaderId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden. You are not the leader of this trip.' });
    }

    const updateData = {
      currentLat: parseFloat(lat),
      currentLng: parseFloat(lng),
      lastLocationUpdate: new Date()
    };

    if (status) {
      // Validate status
      const validStatuses = ['UPCOMING', 'STARTING', 'ON_ROUTE', 'REACHED_DESTINATION', 'RETURNING', 'COMPLETED'];
      if (validStatuses.includes(status)) {
        updateData.status = status;
      }
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: updateData,
      include: {
        trek: { select: { title: true } }
      }
    });

    res.json({
      message: 'Location updated successfully.',
      tripId: updatedTrip.id,
      trekName: updatedTrip.trek.title,
      status: updatedTrip.status,
      currentLat: updatedTrip.currentLat,
      currentLng: updatedTrip.currentLng,
      lastLocationUpdate: updatedTrip.lastLocationUpdate
    });
  } catch (error) {
    next(error);
  }
};

export const createTrip = async (req, res, next) => {
  try {
    const { trekId, date, totalSeats, tripLeaderId } = req.body;

    if (!trekId || !date || !totalSeats) {
      return res.status(400).json({ message: 'trekId, date, and totalSeats are required.' });
    }

    // Check if trek exists
    const trek = await prisma.trek.findUnique({ where: { id: trekId } });
    if (!trek) {
      return res.status(404).json({ message: 'Trek package not found.' });
    }

    // Generate unique TRIP-ID
    const tripId = `TRIP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const trackingToken = `TR-TOKEN-${trekId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newTrip = await prisma.trip.create({
      data: {
        id: tripId,
        trekId,
        date: new Date(date),
        totalSeats: parseInt(totalSeats),
        tripLeaderId: tripLeaderId ? parseInt(tripLeaderId) : null,
        trackingToken,
        status: 'UPCOMING'
      }
    });

    res.status(201).json(newTrip);
  } catch (error) {
    next(error);
  }
};

export const getAllTrips = async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        trek: { select: { title: true } },
        tripLeader: { select: { name: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(trips);
  } catch (error) {
    next(error);
  }
};

export const updateTripStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, tripLeaderId, totalSeats } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    const data = {};
    if (status) data.status = status;
    if (tripLeaderId !== undefined) data.tripLeaderId = tripLeaderId ? parseInt(tripLeaderId) : null;
    if (totalSeats !== undefined) data.totalSeats = parseInt(totalSeats);

    const updated = await prisma.trip.update({
      where: { id },
      data,
      include: {
        trek: { select: { title: true } }
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
