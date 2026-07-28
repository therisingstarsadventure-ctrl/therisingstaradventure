import { asyncHandler } from '../utils/asyncHandler.js';
import * as tripService from '../services/trip.service.js';

export const getAllTrips = asyncHandler(async (req, res) => {
  const trips = await tripService.getAllTrips();
  res.json(trips);
});

export const getUpcomingTrips = asyncHandler(async (req, res) => {
  const trips = await tripService.getUpcomingTrips();
  res.json(trips);
});

export const createTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.createTrip(req.body);
  res.status(201).json({
    message: 'Trip departure scheduled successfully.',
    trip,
  });
});

export const updateTripStatus = asyncHandler(async (req, res) => {
  const result = await tripService.updateTripStatus(req.params.id, req.body.status);
  res.json(result);
});

export const updateTripLocation = asyncHandler(async (req, res) => {
  const result = await tripService.updateTripLocation(req.params.id, req.body);
  res.json(result);
});

export const getLiveLocation = asyncHandler(async (req, res) => {
  const result = await tripService.getLiveLocation(req.params.id);
  res.json(result);
});

export const triggerSos = asyncHandler(async (req, res) => {
  const result = await tripService.triggerSos(req.params.id, req.body);
  res.status(201).json(result);
});

export const resolveSos = asyncHandler(async (req, res) => {
  const result = await tripService.resolveSos(req.params.id);
  res.json(result);
});

export const uploadTripPhotos = asyncHandler(async (req, res) => {
  const result = await tripService.uploadTripPhotos(req.params.id, req.body);
  res.status(201).json(result);
});

export const getTripPhotos = asyncHandler(async (req, res) => {
  const photos = await tripService.getTripPhotos(req.params.id);
  res.json(photos);
});

export const getTripAttendees = asyncHandler(async (req, res) => {
  const attendees = await tripService.getTripAttendees(req.params.id);
  res.json(attendees);
});
