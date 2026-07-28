import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    tripId: z.string().min(1, 'tripId is required'),
    members: z.number().int().positive('members must be a positive integer'),
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'ON_TRIP', 'COMPLETED', 'CANCELLED']),
  }),
});
