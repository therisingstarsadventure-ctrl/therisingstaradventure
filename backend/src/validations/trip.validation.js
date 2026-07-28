import { z } from 'zod';

export const createTripSchema = z.object({
  body: z.object({
    trekId: z.string().min(1, 'trekId is required'),
    date: z.string().or(z.date()),
    totalSeats: z.number().int().positive('totalSeats must be positive'),
    tripLeaderId: z.number().int().optional(),
  }),
});

export const updateTripStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum(['UPCOMING', 'STARTING', 'ON_ROUTE', 'REACHED_DESTINATION', 'RETURNING', 'COMPLETED']),
  }),
});

export const updateTripLocationSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    lat: z.number(),
    lng: z.number(),
    speed: z.number().optional(),
    batteryLevel: z.number().int().min(0).max(100).optional(),
    eta: z.string().optional(),
  }),
});

export const tripSosSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});
