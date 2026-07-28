import * as userRepository from '../repositories/user.repository.js';
import * as trekRepository from '../repositories/trek.repository.js';
import * as tripRepository from '../repositories/trip.repository.js';
import * as bookingRepository from '../repositories/booking.repository.js';

export const getDashboardStats = async () => {
  const [totalTreks, totalTrips, totalBookings, totalUsers, totalRevenue] = await Promise.all([
    trekRepository.countTreks(),
    tripRepository.countTrips(),
    bookingRepository.countBookings(),
    userRepository.countUsers(),
    bookingRepository.calculateTotalRevenue(),
  ]);

  return {
    totalTreks,
    totalTrips,
    totalBookings,
    totalUsers,
    totalRevenue,
  };
};
