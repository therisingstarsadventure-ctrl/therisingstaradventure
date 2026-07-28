import { z } from 'zod';

export const addReviewSchema = z.object({
  body: z.object({
    trekId: z.string().min(1, 'trekId is required'),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(1, 'comment is required'),
  }),
});
