import { prisma } from '../utils/db.js';

export const createReviewInDb = async (data) => {
  return await prisma.review.create({
    data,
    include: {
      user: { select: { name: true } },
    },
  });
};

export const findReviewsByTrekId = async (trekId) => {
  return await prisma.review.findMany({
    where: { trekId },
    include: {
      user: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};
