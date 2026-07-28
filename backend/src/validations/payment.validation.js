import { z } from 'zod';

export const processPaymentSchema = z.object({
  body: z.object({
    bookingId: z.number().int().positive('bookingId must be a positive integer'),
    transactionId: z.string().optional(),
    method: z.string().optional(),
  }),
});
