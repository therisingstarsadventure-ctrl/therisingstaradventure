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
    const checkedInBookings = await prisma.booking.count({ where: { status: 'CHECKED_IN' } });
    const onTripBookings = await prisma.booking.count({ where: { status: 'ON_TRIP' } });
    const completedBookings = await prisma.booking.count({ where: { status: 'COMPLETED' } });
    const cancelledBookings = await prisma.booking.count({ where: { status: 'CANCELLED' } });

    // 4. Counts of trips by status
    const liveTripsCount = await prisma.trip.count({
      where: {
        status: { in: ['STARTING', 'ON_ROUTE', 'REACHED_DESTINATION', 'RETURNING'] }
      }
    });
    const totalTripsCount = await prisma.trip.count();

    // 5. Active SOS alerts
    const activeSosAlerts = await prisma.sosAlert.findMany({
      where: { status: 'ACTIVE' },
      include: {
        trip: {
          include: {
            trek: { select: { title: true } },
            tripLeader: { select: { name: true, phone: true } }
          }
        }
      }
    });

    // 6. Recent bookings (last 10)
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        trip: {
          include: {
            trek: { select: { title: true } }
          }
        }
      }
    });

    // 7. Recent contact messages (last 5)
    const recentMessages = await prisma.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // 8. Popular Treks - Aggregate based on bookings count
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

    // 9. Leaders list for trip building forms
    const leaders = await prisma.user.findMany({
      where: { role: { in: ['LEADER', 'ADMIN'] } },
      select: { id: true, name: true }
    });

    // 10. Fetch current live trips and today's trips lists
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayTrips = await prisma.trip.findMany({
      where: {
        date: {
          gte: startOfToday,
          lte: endOfToday
        }
      },
      include: {
        trek: { select: { title: true } },
        tripLeader: { select: { name: true } }
      }
    });

    const liveTripsList = await prisma.trip.findMany({
      where: {
        status: { in: ['STARTING', 'ON_ROUTE', 'REACHED_DESTINATION', 'RETURNING'] }
      },
      include: {
        trek: { select: { title: true } },
        tripLeader: { select: { name: true, phone: true } }
      }
    });

    res.json({
      stats: {
        totalCustomers,
        totalBookingsCount,
        totalRevenue,
        pendingBookings,
        confirmedBookings,
        checkedInBookings,
        onTripBookings,
        completedBookings,
        cancelledBookings,
        liveTripsCount,
        totalTripsCount,
        activeSosCount: activeSosAlerts.length
      },
      activeSosAlerts: activeSosAlerts.map(sos => ({
        id: sos.id,
        tripId: sos.tripId,
        trekName: sos.trip.trek.title,
        leaderName: sos.trip.tripLeader ? sos.trip.tripLeader.name : 'Unknown',
        leaderPhone: sos.trip.tripLeader ? sos.trip.tripLeader.phone : '',
        lat: sos.lat,
        lng: sos.lng,
        createdAt: sos.createdAt
      })),
      recentBookings: recentBookings.map(b => ({
        id: b.id,
        userName: b.user.name,
        userEmail: b.user.email,
        userPhone: b.user.phone,
        trekName: b.trip.trek.title,
        tripId: b.tripId,
        members: b.members,
        totalAmount: b.totalAmount,
        status: b.status,
        createdAt: b.createdAt
      })),
      recentMessages,
      popularTreks,
      leaders,
      todayTrips: todayTrips.map(t => ({
        id: t.id,
        trekName: t.trek.title,
        leaderName: t.tripLeader ? t.tripLeader.name : 'Unassigned',
        status: t.status,
        date: t.date
      })),
      liveTripsList: liveTripsList.map(t => ({
        id: t.id,
        trekName: t.trek.title,
        leaderName: t.tripLeader ? t.tripLeader.name : 'Unassigned',
        leaderPhone: t.tripLeader ? t.tripLeader.phone : '',
        status: t.status,
        trackingToken: t.trackingToken,
        speed: t.speed,
        batteryLevel: t.batteryLevel,
        eta: t.eta
      }))
    });
  } catch (error) {
    next(error);
  }
};
