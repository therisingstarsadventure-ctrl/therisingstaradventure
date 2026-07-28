import { prisma } from '../utils/db.js';

export const findAllTreks = async (query = {}) => {
  const where = {};
  if (query.zone && query.zone !== 'all') {
    where.zone = query.zone;
  }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { location: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const treks = await prisma.trek.findMany({
    where,
    include: {
      images: { select: { url: true } },
      trips: {
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
      },
    },
  });

  return treks.map((t) => ({
    ...t,
    price: `₹${Number(t.price).toLocaleString('en-IN')}`,
    images: t.images.map((img) => img.url),
    gallery: t.images.map((img) => img.url),
  }));
};

export const findTrekById = async (id) => {
  const t = await prisma.trek.findUnique({
    where: { id },
    include: {
      images: { select: { url: true } },
      trips: {
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
      },
      reviews: {
        include: {
          user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!t) return null;

  return {
    ...t,
    price: `₹${Number(t.price).toLocaleString('en-IN')}`,
    images: t.images.map((img) => img.url),
    gallery: t.images.map((img) => img.url),
  };
};

export const createTrek = async (data) => {
  const { images, ...trekData } = data;
  return await prisma.trek.create({
    data: {
      ...trekData,
      images: {
        create: (images || []).map((url) => ({ url })),
      },
    },
    include: { images: true },
  });
};

export const updateTrek = async (id, data) => {
  const { images, ...trekData } = data;

  if (images) {
    await prisma.image.deleteMany({ where: { trekId: id } });
  }

  return await prisma.trek.update({
    where: { id },
    data: {
      ...trekData,
      ...(images && {
        images: {
          create: images.map((url) => ({ url })),
        },
      }),
    },
    include: { images: true },
  });
};

export const deleteTrek = async (id) => {
  return await prisma.trek.delete({ where: { id } });
};

export const countTreks = async () => {
  return await prisma.trek.count();
};
