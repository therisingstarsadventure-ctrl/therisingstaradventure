import { prisma } from '../utils/db.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total active bookings, total bookings, total customers
    const totalCustomers = await prisma.user.count({ where: { role: 'USER' } });
    const totalBookingsCount = await prisma.booking.count();
    
    // 2. Sum of PAID payments (revenue)
    const paidPayments = await prisma.payment.findMany({
      where: { paymentStatus: 'PAID' },
      select: { amount: true }
    });
    const totalRevenue = paidPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // 3. Count bookings by status
    const pendingBookings = await prisma.booking.count({ where: { status: 'PENDING' } });
    const confirmedBookings = await prisma.booking.count({ where: { status: 'CONFIRMED' } });
    const cancelledBookings = await prisma.booking.count({ where: { status: 'CANCELLED' } });

    // 4. Counts of trips by status
    const activeTripsCount = await prisma.trip.count({
      where: {
        status: { in: ['STARTING', 'ON_ROUTE', 'REACHED_DESTINATION', 'RETURNING'] }
      }
    });
    const totalTripsCount = await prisma.trip.count();

    // 5. Recent bookings (last 5)
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        trip: {
          include: {
            trek: { select: { title: true } }
          }
        }
      }
    });

    // 6. Recent contact messages (last 5)
    const recentMessages = await prisma.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // 7. Popular Treks - Aggregate based on bookings count
    const bookings = await prisma.booking.findMany({
      include: {
        trip: {
          select: { trekId: true }
        }
      }
    });

    const trekBookingCounts = {};
    bookings.forEach(b => {
      const tId = b.trip.trekId;
      trekBookingCounts[tId] = (trekBookingCounts[tId] || 0) + b.members;
    });

    const treks = await prisma.trek.findMany({
      select: { id: true, title: true, price: true }
    });

    const popularTreks = treks.map(t => ({
      id: t.id,
      title: t.title,
      price: t.price,
      bookedSeats: trekBookingCounts[t.id] || 0
    }))
    .sort((a, b) => b.bookedSeats - a.bookedSeats)
    .slice(0, 5);

    // 8. Leaders list for trip building forms
    const leaders = await prisma.user.findMany({
      where: { role: { in: ['LEADER', 'ADMIN'] } },
      select: { id: true, name: true }
    });

    res.json({
      stats: {
        totalCustomers,
        totalBookingsCount,
        totalRevenue,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        activeTripsCount,
        totalTripsCount
      },
      recentBookings: recentBookings.map(b => ({
        id: b.id,
        userName: b.user.name,
        userEmail: b.user.email,
        trekName: b.trip.trek.title,
        members: b.members,
        totalAmount: b.totalAmount,
        status: b.status,
        createdAt: b.createdAt
      })),
      recentMessages,
      popularTreks,
      leaders
    });
  } catch (error) {
    next(error);
  }
};
