import { ApiError } from '../utils/ApiError.js';
import * as tripRepository from '../repositories/trip.repository.js';
import { cache } from '../utils/redis.js';

export const getAllTrips = async () => {
  return await tripRepository.findAllTrips();
};

export const getUpcomingTrips = async () => {
  return await tripRepository.findUpcomingTrips();
};

export const createTrip = async ({ trekId, date, totalSeats, tripLeaderId }) => {
  const tripId = `TRIP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const trackingToken = `TR-TOKEN-${trekId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return await tripRepository.createTrip({
    id: tripId,
    trekId,
    date: new Date(date),
    totalSeats: parseInt(totalSeats),
    bookedSeats: 0,
    status: 'UPCOMING',
    tripLeaderId: tripLeaderId ? parseInt(tripLeaderId) : null,
    trackingToken,
  });
};

export const updateTripStatus = async (id, status) => {
  const trip = await tripRepository.findTripById(id);
  if (!trip) {
    throw new ApiError(404, 'Trip departure not found.');
  }

  const updatedTrip = await tripRepository.updateTrip(id, { status });
  return {
    message: `Trip status updated to ${status}.`,
    trip: updatedTrip,
  };
};

export const updateTripLocation = async (id, { lat, lng, speed = 0, batteryLevel = 100, eta }) => {
  const trip = await tripRepository.findTripById(id);
  if (!trip) {
    throw new ApiError(404, 'Trip departure not found.');
  }

  const now = new Date();
  const locationData = {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    speed: parseFloat(speed),
    batteryLevel: parseInt(batteryLevel),
    eta,
    updatedAt: now.toISOString(),
  };

  // 1. Cache latest location in Redis for ultra-fast real-time lookup
  await cache.set(`trip:location:${id}`, JSON.stringify(locationData), 86400);

  // 2. Persist location to PostgreSQL
  const updatedTrip = await tripRepository.updateTrip(id, {
    currentLat: parseFloat(lat),
    currentLng: parseFloat(lng),
    speed: parseFloat(speed),
    batteryLevel: parseInt(batteryLevel),
    eta,
    lastLocationUpdate: now,
  });

  return {
    message: 'Trip location updated successfully.',
    location: {
      lat: updatedTrip.currentLat,
      lng: updatedTrip.currentLng,
      lastLocationUpdate: updatedTrip.lastLocationUpdate,
    },
  };
};

export const getLiveLocation = async (id) => {
  // Try reading from Redis cache first
  const cachedLocation = await cache.get(`trip:location:${id}`);
  if (cachedLocation) {
    const loc = JSON.parse(cachedLocation);
    const trip = await tripRepository.findTripById(id);
    return {
      tripId: id,
      trekTitle: trip ? trip.trek.title : 'Adventure Trek',
      lat: loc.lat,
      lng: loc.lng,
      speed: loc.speed,
      batteryLevel: loc.batteryLevel,
      eta: loc.eta,
      lastUpdated: loc.updatedAt,
      status: trip ? trip.status : 'ON_ROUTE',
    };
  }

  const trip = await tripRepository.findTripById(id);
  if (!trip) {
    throw new ApiError(404, 'Trip departure not found.');
  }

  return {
    tripId: trip.id,
    trekTitle: trip.trek.title,
    lat: trip.currentLat,
    lng: trip.currentLng,
    speed: trip.speed,
    batteryLevel: trip.batteryLevel,
    eta: trip.eta,
    lastUpdated: trip.lastLocationUpdate,
    status: trip.status,
  };
};

export const triggerSos = async (id, { lat, lng }) => {
  const trip = await tripRepository.findTripById(id);
  if (!trip) {
    throw new ApiError(404, 'Trip departure not found.');
  }

  const alert = await tripRepository.createSosAlert({
    tripId: id,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    status: 'ACTIVE',
  });

  return {
    message: 'SOS Emergency Alert dispatched to Operations Dashboard!',
    alert,
  };
};

export const resolveSos = async (id) => {
  await tripRepository.resolveSosAlerts(id);
  return { message: 'SOS alert resolved.' };
};

export const uploadTripPhotos = async (id, { url }) => {
  const photo = await tripRepository.addTripPhoto(id, url);
  return {
    message: 'Photo uploaded to live trek feed.',
    photo,
  };
};

export const getTripPhotos = async (id) => {
  return await tripRepository.getTripPhotos(id);
};

export const getTripAttendees = async (id) => {
  const attendees = await tripRepository.getTripAttendees(id);
  return attendees.map((b) => ({
    bookingId: b.id,
    members: b.members,
    status: b.status,
    user: b.user,
  }));
};
