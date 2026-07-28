import { z } from 'zod';

export const submitContactSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(5, 'Message must be at least 5 characters long'),
  }),
});

export const subscribeNewsletterSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});
