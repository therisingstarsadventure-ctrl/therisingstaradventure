import { prisma } from '../utils/db.js';

export const findAllTrips = async () => {
  return await prisma.trip.findMany({
    include: {
      trek: { select: { title: true, location: true, price: true } },
      tripLeader: { select: { name: true, phone: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { date: 'asc' },
  });
};

export const findUpcomingTrips = async () => {
  return await prisma.trip.findMany({
    where: { date: { gte: new Date() } },
    include: {
      trek: {
        include: { images: { select: { url: true } } },
      },
    },
    orderBy: { date: 'asc' },
  });
};

export const findTripById = async (id) => {
  return await prisma.trip.findUnique({
    where: { id },
    include: {
      trek: { select: { title: true, price: true } },
      tripLeader: { select: { name: true, phone: true } },
    },
  });
};

export const createTrip = async (data) => {
  return await prisma.trip.create({
    data,
    include: { trek: { select: { title: true } } },
  });
};

export const updateTrip = async (id, data) => {
  return await prisma.trip.update({
    where: { id },
    data,
  });
};

export const createSosAlert = async (data) => {
  return await prisma.sosAlert.create({ data });
};

export const resolveSosAlerts = async (tripId) => {
  return await prisma.sosAlert.updateMany({
    where: { tripId, status: 'ACTIVE' },
    data: { status: 'RESOLVED' },
  });
};

export const addTripPhoto = async (tripId, url) => {
  return await prisma.tripPhoto.create({
    data: { tripId, url },
  });
};

export const getTripPhotos = async (tripId) => {
  return await prisma.tripPhoto.findMany({
    where: { tripId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getTripAttendees = async (tripId) => {
  return await prisma.booking.findMany({
    where: {
      tripId,
      status: { in: ['CONFIRMED', 'CHECKED_IN', 'ON_TRIP'] },
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
};

export const countTrips = async () => {
  return await prisma.trip.count();
};
