import { asyncHandler } from '../utils/asyncHandler.js';
import * as paymentService from '../services/payment.service.js';

export const processPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.processPayment(req.user.id, req.body);
  res.status(201).json(result);
});
