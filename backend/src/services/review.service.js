import { ApiError } from '../utils/ApiError.js';
import * as reviewRepository from '../repositories/review.repository.js';
import * as trekRepository from '../repositories/trek.repository.js';

export const addReview = async (userId, { trekId, rating, comment }) => {
  const trek = await trekRepository.findTrekById(trekId);
  if (!trek) {
    throw new ApiError(404, 'Trek package not found.');
  }

  const review = await reviewRepository.createReviewInDb({
    userId,
    trekId,
    rating: parseInt(rating),
    comment,
  });

  return {
    message: 'Thank you for your feedback! Review added successfully.',
    review,
  };
};

export const getPackageReviews = async (trekId) => {
  return await reviewRepository.findReviewsByTrekId(trekId);
};
