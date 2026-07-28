import { z } from 'zod';

export const saveTrekCmsSchema = z.object({
  body: z.object({
    id: z.string().min(1, 'Trek ID is required'),
    slug: z.string().optional(),
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    location: z.string().min(1, 'Location is required'),
    state: z.string().optional(),
    price: z.number().positive('Price must be greater than 0'),
    discountPrice: z.number().optional().nullable(),
    days: z.string().min(1, 'Days is required'),
    description: z.string().min(1, 'Description is required'),
    zone: z.string().default('maharashtra'),
    difficulty: z.string().default('Moderate'),
    duration: z.string().default('1 Day'),
    elevation: z.string().optional(),
    groupSize: z.string().optional(),
    bestSeason: z.string().optional(),
    meetingPoint: z.string().optional(),
    googleMapLink: z.string().optional().nullable(),
    heroImage: z.string().optional().nullable(),
    maxSeats: z.number().int().positive().default(30),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'HIDDEN']).default('PUBLISHED'),
    publishScheduledAt: z.string().optional().nullable(),
    featured: z.boolean().default(false),
    seasonal: z.boolean().default(false),
    highlights: z.array(z.string()).optional(),
    thingsToCarry: z.array(z.string()).optional(),
    inclusions: z.array(z.string()).optional(),
    exclusions: z.array(z.string()).optional(),
    timeline: z.array(z.any()).optional(),
    faqs: z.array(z.any()).optional(),
    policies: z.array(z.string()).optional(),
    cancellationRules: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    videos: z.array(z.string()).optional(),
    metaTitle: z.string().optional().nullable(),
    metaDescription: z.string().optional().nullable(),
    keywords: z.string().optional().nullable(),
    ogImage: z.string().optional().nullable(),
    canonicalUrl: z.string().optional().nullable(),
    structuredData: z.any().optional().nullable(),
  }),
});

export const bulkTrekActionSchema = z.object({
  body: z.object({
    trekIds: z.array(z.string()).min(1, 'At least one trek ID is required'),
    action: z.enum(['publish', 'archive', 'delete', 'duplicate', 'assignLeader', 'setStatus']),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'HIDDEN']).optional(),
    leaderId: z.number().int().optional(),
  }),
});

export const bulkCreateDeparturesSchema = z.object({
  body: z.object({
    trekId: z.string().min(1, 'Trek ID is required'),
    startDate: z.string(),
    endDate: z.string(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).default([0, 6]), // Default Sat & Sun
    totalSeats: z.number().int().positive().default(30),
    tripLeaderId: z.number().int().optional().nullable(),
  }),
});
