import { prisma } from '../utils/db.js';

export const findAllCmsTreks = async (query = {}) => {
  const where = {};
  if (query.status && query.status !== 'all') {
    where.status = query.status;
  }
  if (query.zone && query.zone !== 'all') {
    where.zone = query.zone;
  }
  if (query.featured === 'true') {
    where.featured = true;
  }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { location: { contains: query.search, mode: 'insensitive' } },
      { id: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const treks = await prisma.trek.findMany({
    where,
    include: {
      images: { orderBy: { order: 'asc' } },
      _count: { select: { trips: true, reviews: true, versions: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return treks.map(t => ({
    ...t,
    priceFormatted: `₹${Number(t.price).toLocaleString('en-IN')}`,
    gallery: t.images.map(img => img.url),
  }));
};

export const findCmsTrekById = async (id) => {
  const t = await prisma.trek.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: 'asc' } },
      trips: { orderBy: { date: 'asc' } },
      versions: { orderBy: { version: 'desc' }, take: 10 },
      reviews: { include: { user: { select: { name: true } } } },
    },
  });

  if (!t) return null;

  return {
    ...t,
    priceFormatted: `₹${Number(t.price).toLocaleString('en-IN')}`,
    gallery: t.images.map(img => img.url),
  };
};

export const createOrUpdateCmsTrek = async (data, editedBy = 'Admin') => {
  const { images, ...trekData } = data;

  return await prisma.$transaction(async (tx) => {
    // 1. Check existing trek for versioning
    const existing = await tx.trek.findUnique({ where: { id: data.id } });
    const currentVersion = existing ? existing.version + 1 : 1;

    // 2. Upsert trek
    const trek = await tx.trek.upsert({
      where: { id: data.id },
      update: {
        ...trekData,
        version: currentVersion,
        slug: data.slug || data.id,
      },
      create: {
        ...trekData,
        version: currentVersion,
        slug: data.slug || data.id,
      },
    });

    // 3. Update images if provided
    if (images && Array.isArray(images)) {
      await tx.image.deleteMany({ where: { trekId: data.id } });
      await tx.image.createMany({
        data: images.map((url, index) => ({
          url,
          order: index,
          trekId: data.id,
        })),
      });
    }

    // 4. Save Version History Snapshot
    await tx.trekVersion.create({
      data: {
        trekId: data.id,
        version: currentVersion,
        data: JSON.parse(JSON.stringify(data)),
        editedBy,
      },
    });

    return trek;
  });
};

export const duplicateCmsTrek = async (sourceId, newId, newTitle) => {
  const source = await findCmsTrekById(sourceId);
  if (!source) throw new Error('Source trek not found for duplication.');

  const { images, trips, versions, reviews, priceFormatted, gallery, id, slug, ...copyData } = source;

  return await prisma.$transaction(async (tx) => {
    const duplicated = await tx.trek.create({
      data: {
        ...copyData,
        id: newId,
        slug: `${newId}-${Date.now()}`,
        title: newTitle || `${copyData.title} (Copy)`,
        status: 'DRAFT',
        version: 1,
        images: {
          create: (images || []).map((img, idx) => ({ url: img.url, order: idx })),
        },
      },
      include: { images: true },
    });

    await tx.trekVersion.create({
      data: {
        trekId: newId,
        version: 1,
        data: JSON.parse(JSON.stringify(duplicated)),
        editedBy: 'Admin (Duplicate)',
      },
    });

    return duplicated;
  });
};

export const updateBulkTreksStatus = async (trekIds, status) => {
  return await prisma.trek.updateMany({
    where: { id: { in: trekIds } },
    data: { status },
  });
};

export const deleteBulkTreks = async (trekIds) => {
  return await prisma.trek.deleteMany({
    where: { id: { in: trekIds } },
  });
};

export const createBulkDepartures = async (trekId, departures) => {
  return await prisma.trip.createMany({
    data: departures.map(dep => ({
      id: `TRIP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      trekId,
      date: dep.date,
      totalSeats: dep.totalSeats || 30,
      bookedSeats: 0,
      status: 'UPCOMING',
      tripLeaderId: dep.tripLeaderId || null,
      trackingToken: `TR-TOKEN-${trekId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    })),
  });
};

export const getTrekVersionHistory = async (trekId) => {
  return await prisma.trekVersion.findMany({
    where: { trekId },
    orderBy: { version: 'desc' },
  });
};
