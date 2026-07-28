import { asyncHandler } from '../utils/asyncHandler.js';
import * as reviewService from '../services/review.service.js';

export const addReview = asyncHandler(async (req, res) => {
  const result = await reviewService.addReview(req.user.id, req.body);
  res.status(201).json(result);
});

export const getPackageReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getPackageReviews(req.params.trekId);
  res.json(reviews);
});
