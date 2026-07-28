import { prisma } from '../utils/db.js';
import { cache } from '../utils/redis.js';

const PACKAGES_CACHE_TTL = 300;    // 5 minutes
const PACKAGE_CACHE_TTL = 600;     // 10 minutes
const TRIPS_CACHE_TTL = 120;       // 2 minutes
const ADMIN_STATS_CACHE_TTL = 60;  // 1 minute

// ─── Trek Search (Full-Text + Filters) ──────────────────────────────────────

export const searchTreks = async ({ q, zone, difficulty, minPrice, maxPrice, page = 1, limit = 12 }) => {
  const where = {};

  if (zone && zone !== 'all') where.zone = zone;
  if (difficulty) where.difficulty = difficulty;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { location: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [treks, total] = await Promise.all([
    prisma.trek.findMany({
      where,
      include: { images: { select: { url: true }, take: 1 } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { price: 'asc' },
    }),
    prisma.trek.count({ where }),
  ]);

  return {
    treks: treks.map(t => ({
      ...t,
      price: `₹${Number(t.price).toLocaleString('en-IN')}`,
      images: t.images.map(img => img.url),
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
