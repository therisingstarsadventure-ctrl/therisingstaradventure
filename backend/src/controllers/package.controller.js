import { prisma } from '../utils/db.js';

export const getAllPackages = async (req, res, next) => {
  try {
    const { zone, difficulty, search } = req.query;

    const where = {};
    if (zone) where.zone = zone;
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { location: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const treks = await prisma.trek.findMany({
      where,
      include: {
        reviews: {
          select: { rating: true }
        },
        trips: {
          where: { date: { gte: new Date() } },
          orderBy: { date: 'asc' }
        }
      }
    });

    // Format output with review summary
    const formattedTreks = treks.map(trek => {
      const reviewCount = trek.reviews.length;
      const averageRating = reviewCount > 0 
        ? parseFloat((trek.reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount).toFixed(1))
        : 0;

      // Parse JSON columns
      let gallery = [];
      try { gallery = JSON.parse(trek.images); } catch (e) {}

      return {
        id: trek.id,
        name: trek.title,
        zone: trek.zone,
        zoneLabel: trek.location,
        difficulty: trek.difficulty,
        duration: trek.duration,
        elevation: trek.elevation,
        groupSize: trek.groupSize,
        price: `₹${trek.price.toLocaleString()}`,
        numericPrice: trek.price,
        description: trek.description,
        gallery,
        reviewCount,
        averageRating,
        upcomingTrips: trek.trips
      };
    });

    res.json(formattedTreks);
  } catch (error) {
    next(error);
  }
};

export const getPackageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trek = await prisma.trek.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        trips: {
          where: { date: { gte: new Date() } },
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!trek) {
      return res.status(404).json({ message: 'Trek package not found.' });
    }

    // Parse JSON arrays/objects safely
    let gallery = [], inclusions = [], exclusions = [], timeline = [];
    try { gallery = JSON.parse(trek.images); } catch (e) {}
    try { inclusions = JSON.parse(trek.inclusions); } catch (e) {}
    try { exclusions = JSON.parse(trek.exclusions); } catch (e) {}
    try { timeline = JSON.parse(trek.timeline); } catch (e) {}

    const reviewCount = trek.reviews.length;
    const averageRating = reviewCount > 0
      ? parseFloat((trek.reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount).toFixed(1))
      : 0;

    res.json({
      id: trek.id,
      name: trek.title,
      zone: trek.zone,
      zoneLabel: trek.location,
      difficulty: trek.difficulty,
      duration: trek.duration,
      elevation: trek.elevation,
      groupSize: trek.groupSize,
      price: `₹${trek.price.toLocaleString()}`,
      numericPrice: trek.price,
      description: trek.description,
      gallery,
      inclusions,
      exclusions,
      timeline,
      reviewCount,
      averageRating,
      reviews: trek.reviews.map(r => ({
        id: r.id,
        userName: r.user.name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt
      })),
      upcomingTrips: trek.trips
    });
  } catch (error) {
    next(error);
  }
};

export const createPackage = async (req, res, next) => {
  try {
    const {
      id, title, location, price, days, description, images,
      zone, difficulty, duration, elevation, groupSize,
      bestSeason, meetingPoint, inclusions, exclusions, timeline
    } = req.body;

    if (!id || !title || !price || !description) {
      return res.status(400).json({ message: 'Fields (id, title, price, description) are required.' });
    }

    const existing = await prisma.trek.findUnique({ where: { id } });
    if (existing) {
      return res.status(400).json({ message: `A trek package with ID '${id}' already exists.` });
    }

    const trek = await prisma.trek.create({
      data: {
        id,
        title,
        location: location || zone,
        price: parseFloat(price),
        days: days || '1 Day',
        description,
        images: Array.isArray(images) ? JSON.stringify(images) : JSON.stringify([]),
        zone: zone || 'maharashtra',
        difficulty: difficulty || 'Easy',
        duration: duration || '1 Day',
        elevation: elevation || 'N/A',
        groupSize: groupSize || '15-20',
        bestSeason: bestSeason || 'All Season',
        meetingPoint: meetingPoint || 'To be announced',
        inclusions: Array.isArray(inclusions) ? JSON.stringify(inclusions) : JSON.stringify([]),
        exclusions: Array.isArray(exclusions) ? JSON.stringify(exclusions) : JSON.stringify([]),
        timeline: Array.isArray(timeline) ? JSON.stringify(timeline) : JSON.stringify([]),
      }
    });

    res.status(201).json(trek);
  } catch (error) {
    next(error);
  }
};

export const updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const trek = await prisma.trek.findUnique({ where: { id } });
    if (!trek) {
      return res.status(404).json({ message: 'Trek package not found.' });
    }

    // Convert numeric fields and array fields to string if they are sent as JSON
    if (updateData.price !== undefined) updateData.price = parseFloat(updateData.price);
    if (updateData.images && Array.isArray(updateData.images)) updateData.images = JSON.stringify(updateData.images);
    if (updateData.inclusions && Array.isArray(updateData.inclusions)) updateData.inclusions = JSON.stringify(updateData.inclusions);
    if (updateData.exclusions && Array.isArray(updateData.exclusions)) updateData.exclusions = JSON.stringify(updateData.exclusions);
    if (updateData.timeline && Array.isArray(updateData.timeline)) updateData.timeline = JSON.stringify(updateData.timeline);

    const updated = await prisma.trek.update({
      where: { id },
      data: updateData
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trek = await prisma.trek.findUnique({ where: { id } });
    if (!trek) {
      return res.status(404).json({ message: 'Trek package not found.' });
    }

    // Delete associated trips and reviews first to maintain relational integrity in SQLite
    await prisma.review.deleteMany({ where: { trekId: id } });
    
    // Find all trips of this trek
    const trips = await prisma.trip.findMany({ where: { trekId: id } });
    const tripIds = trips.map(t => t.id);

    // Delete bookings and payments for these trips
    for (const tripId of tripIds) {
      const bookings = await prisma.booking.findMany({ where: { tripId } });
      const bookingIds = bookings.map(b => b.id);
      await prisma.payment.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await prisma.booking.deleteMany({ where: { tripId } });
    }

    await prisma.trip.deleteMany({ where: { trekId: id } });
    await prisma.trek.delete({ where: { id } });

    res.json({ message: 'Trek package and all associated departures, bookings, and reviews deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
