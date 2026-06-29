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

    if (trip.trackingToken !== token) {
      return res.status(403).json({ message: 'Access denied. Invalid tracking token.' });
    }

    // Check if there is an active SOS alert
    const activeSos = await prisma.sosAlert.findFirst({
      where: { tripId: id, status: 'ACTIVE' }
    });

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
      lastLocationUpdate: trip.lastLocationUpdate,
      speed: trip.speed,
      batteryLevel: trip.batteryLevel,
      eta: trip.eta,
      hasActiveSos: !!activeSos
    });
  } catch (error) {
    next(error);
  }
};

export const updateTripLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lat, lng, status, speed, batteryLevel, eta } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Latitude (lat) and Longitude (lng) are required.' });
    }

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    if (req.user.role !== 'ADMIN' && trip.tripLeaderId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden. You are not the leader of this trip.' });
    }

    const updateData = {
      currentLat: parseFloat(lat),
      currentLng: parseFloat(lng),
      lastLocationUpdate: new Date()
    };

    if (status) {
      const validStatuses = ['UPCOMING', 'STARTING', 'ON_ROUTE', 'REACHED_DESTINATION', 'RETURNING', 'COMPLETED'];
      if (validStatuses.includes(status)) {
        updateData.status = status;
      }
    }

    if (speed !== undefined) {
      updateData.speed = parseFloat(speed);
    }
    if (batteryLevel !== undefined) {
      updateData.batteryLevel = parseInt(batteryLevel);
    }
    if (eta !== undefined) {
      updateData.eta = eta;
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
      lastLocationUpdate: updatedTrip.lastLocationUpdate,
      speed: updatedTrip.speed,
      batteryLevel: updatedTrip.batteryLevel,
      eta: updatedTrip.eta
    });
  } catch (error) {
    next(error);
  }
};

export const triggerSos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    if (req.user.role !== 'ADMIN' && trip.tripLeaderId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const sos = await prisma.sosAlert.create({
      data: {
        tripId: id,
        lat: parseFloat(lat !== undefined ? lat : trip.currentLat),
        lng: parseFloat(lng !== undefined ? lng : trip.currentLng),
        status: 'ACTIVE'
      }
    });

    res.json({ message: 'SOS Alert triggered successfully!', alert: sos });
  } catch (error) {
    next(error);
  }
};

export const resolveSos = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    if (req.user.role !== 'ADMIN' && trip.tripLeaderId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    await prisma.sosAlert.updateMany({
      where: { tripId: id, status: 'ACTIVE' },
      data: { status: 'RESOLVED' }
    });

    res.json({ message: 'SOS Alerts marked as resolved.' });
  } catch (error) {
    next(error);
  }
};

export const uploadTripPhotos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { urls } = req.body; // Array of hosted photo URLs

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ message: 'An array of photo urls is required.' });
    }

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    if (req.user.role !== 'ADMIN' && trip.tripLeaderId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const photosData = urls.map(url => ({
      tripId: id,
      url
    }));

    await prisma.tripPhoto.createMany({
      data: photosData
    });

    res.json({ message: 'Trip photos uploaded successfully!' });
  } catch (error) {
    next(error);
  }
};

export const getTripPhotos = async (req, res, next) => {
  try {
    const { id } = req.params;

    const photos = await prisma.tripPhoto.findMany({
      where: { tripId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(photos);
  } catch (error) {
    next(error);
  }
};

export const getTripAttendees = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    if (req.user.role !== 'ADMIN' && trip.tripLeaderId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const bookings = await prisma.booking.findMany({
      where: { tripId: id },
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(bookings);
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

    const trek = await prisma.trek.findUnique({ where: { id: trekId } });
    if (!trek) {
      return res.status(404).json({ message: 'Trek package not found.' });
    }

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
