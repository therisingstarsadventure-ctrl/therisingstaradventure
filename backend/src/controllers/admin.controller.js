import { asyncHandler } from '../utils/asyncHandler.js';
import * as adminService from '../services/admin.service.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.json(stats);
});
