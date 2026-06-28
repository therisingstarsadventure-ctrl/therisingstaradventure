import { prisma } from '../utils/db.js';

export const addReview = async (req, res, next) => {
  try {
    const { trekId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!trekId || !rating || comment === undefined) {
      return res.status(400).json({ message: 'trekId, rating, and comment are required.' });
    }

    const ratingVal = parseInt(rating);
    if (ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
    }

    // Verify trek exists
    const trek = await prisma.trek.findUnique({ where: { id: trekId } });
    if (!trek) {
      return res.status(404).json({ message: 'Trek package not found.' });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        trekId,
        rating: ratingVal,
        comment
      },
      include: {
        user: { select: { name: true } }
      }
    });

    res.status(201).json({
      message: 'Review posted successfully.',
      review: {
        id: review.id,
        userName: review.user.name,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPackageReviews = async (req, res, next) => {
  try {
    const { trekId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { trekId },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews.map(r => ({
      id: r.id,
      userName: r.user.name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt
    })));
  } catch (error) {
    next(error);
  }
};
