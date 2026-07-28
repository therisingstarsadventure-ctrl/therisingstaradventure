import { z } from 'zod';

export const createPackageSchema = z.object({
  body: z.object({
    id: z.string().min(1, 'Package ID is required'),
    title: z.string().min(1, 'Title is required'),
    location: z.string().min(1, 'Location is required'),
    price: z.number().positive('Price must be greater than 0'),
    days: z.string().min(1, 'Days is required'),
    description: z.string().min(1, 'Description is required'),
    images: z.array(z.string()).optional(),
    zone: z.string().default('maharashtra'),
    difficulty: z.string().default('Moderate'),
    duration: z.string().default('1 Day'),
    elevation: z.string().optional(),
    groupSize: z.string().optional(),
    bestSeason: z.string().optional(),
    meetingPoint: z.string().optional(),
    inclusions: z.array(z.string()).optional(),
    exclusions: z.array(z.string()).optional(),
    timeline: z.array(z.any()).optional(),
  }),
});

export const updatePackageSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: createPackageSchema.shape.body.partial(),
});
