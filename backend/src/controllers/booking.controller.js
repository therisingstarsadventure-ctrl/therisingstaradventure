import { asyncHandler } from '../utils/asyncHandler.js';
import * as bookingService from '../services/booking.service.js';

export const createBooking = asyncHandler(async (req, res) => {
  const result = await bookingService.createBooking(req.user.id, req.body);
  res.status(201).json(result);
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getMyBookings(req.user.id);
  res.json(bookings);
});

export const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getAllBookings();
  res.json(bookings);
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const result = await bookingService.updateBookingStatus(req.params.id, req.body.status);
  res.json(result);
});
