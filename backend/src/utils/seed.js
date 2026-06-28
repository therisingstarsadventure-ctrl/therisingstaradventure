import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { prisma } from './db.js';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Clean existing records
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.review.deleteMany();
    await prisma.trek.deleteMany();
    await prisma.user.deleteMany();
    await prisma.contactMessage.deleteMany();
    await prisma.newsletterSubscriber.deleteMany();

    console.log('🧹 Cleaned existing database tables.');

    // 2. Create Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin1234', salt);
    const leaderHash = await bcrypt.hash('leader1234', salt);
    const userHash = await bcrypt.hash('user1234', salt);

    const admin = await prisma.user.create({
      data: {
        name: 'The Rising Stars Admin',
        email: 'admin@risingstars.com',
        phone: '9373011627',
        passwordHash,
        role: 'ADMIN',
      },
    });

    const leader = await prisma.user.create({
      data: {
        name: 'Amit Trek Leader',
        email: 'leader@risingstars.com',
        phone: '9876543210',
        passwordHash: leaderHash,
        role: 'LEADER',
      },
    });

    const customer = await prisma.user.create({
      data: {
        name: 'Rahul Sharma',
        email: 'rahul@gmail.com',
        phone: '9988776655',
        passwordHash: userHash,
        role: 'USER',
      },
    });

    console.log('👤 Seeded Default Users (Admin, Trip Leader, User).');

    // 3. Dynamically read treks from frontend js/data.js
    const dataJsPath = path.resolve('../js/data.js');
    if (!fs.existsSync(dataJsPath)) {
      throw new Error(`Frontend data file not found at: ${dataJsPath}`);
    }

    const fileContent = fs.readFileSync(dataJsPath, 'utf-8');
    // Extract array content using regex or string splits
    const arrayStartIndex = fileContent.indexOf('const TREKS_DATA = [');
    if (arrayStartIndex === -1) {
      throw new Error('Could not parse TREKS_DATA from js/data.js');
    }

    // Write a temporary file converting global declaration to export
    const tempFileContent = fileContent.replace('const TREKS_DATA =', 'export const TREKS_DATA =');
    const tempFilePath = path.resolve('./src/utils/temp_data.js');
    fs.writeFileSync(tempFilePath, tempFileContent, 'utf-8');

    // Dynamic import of temp file
    const { TREKS_DATA } = await import('./temp_data.js');
    
    // Clean up temporary file
    fs.unlinkSync(tempFilePath);

    console.log(`📂 Read ${TREKS_DATA.length} treks from frontend data.`);

    // 4. Seed Treks and create active Trips
    const trekIds = [];
    for (const t of TREKS_DATA) {
      // Parse price, e.g. "₹1,499" -> 1499
      const numericPrice = parseFloat(t.price.replace(/[^\d.]/g, '')) || 0;

      await prisma.trek.create({
        data: {
          id: t.id,
          title: t.name,
          location: t.zoneLabel,
          price: numericPrice,
          days: t.duration.split('/')[0].trim(),
          description: t.description,
          images: JSON.stringify(t.gallery || []),
          zone: t.zone,
          difficulty: t.difficulty,
          duration: t.duration,
          elevation: t.elevation,
          groupSize: t.groupSize,
          bestSeason: t.bestSeason,
          meetingPoint: t.meetingPoint,
          inclusions: JSON.stringify(t.inclusions || []),
          exclusions: JSON.stringify(t.exclusions || []),
          timeline: JSON.stringify(t.timeline || []),
        },
      });
      trekIds.push(t.id);
    }
    console.log('🏔️ Seeded Adventure Treks.');

    // 5. Create upcoming departures (Trips)
    const tripDepartures = [
      { trekId: 'kalsubai', daysOffset: 6, totalSeats: 30 },
      { trekId: 'sandhan', daysOffset: 7, totalSeats: 20 },
      { trekId: 'andharban', daysOffset: 13, totalSeats: 25 },
      { trekId: 'tadoba', daysOffset: 14, totalSeats: 12 },
      { trekId: 'pachmarhi', daysOffset: 20, totalSeats: 15 },
      { trekId: 'doodhsagar', daysOffset: 21, totalSeats: 30 },
    ];

    const seededTrips = [];
    for (const [index, dep] of tripDepartures.entries()) {
      const tripDate = new Date();
      tripDate.setDate(tripDate.getDate() + dep.daysOffset);
      tripDate.setHours(6, 0, 0, 0); // Morning starts

      // Generate a mock tracking token e.g. TR-TOKEN-kalsubai-123
      const trackingToken = `TR-TOKEN-${dep.trekId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const tripId = `TRIP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const trip = await prisma.trip.create({
        data: {
          id: tripId,
          trekId: dep.trekId,
          date: tripDate,
          totalSeats: dep.totalSeats,
          bookedSeats: 0,
          status: index === 0 ? 'STARTING' : 'UPCOMING', // Make first trip Active/Starting for testing
          tripLeaderId: leader.id,
          trackingToken,
          currentLat: index === 0 ? 19.6105 : 0.0, // Bari Village (Base Camp of Kalsubai)
          currentLng: index === 0 ? 73.7198 : 0.0,
          lastLocationUpdate: index === 0 ? new Date() : null,
        },
      });
      seededTrips.push(trip);
    }
    console.log('🚐 Seeded Upcoming Departures (Trips) with unique tracking tokens.');

    // 6. Seed mock Reviews
    const reviews = [
      { trekId: 'kalsubai', rating: 5, comment: 'Breathtaking sunrise. The leaders were extremely supportive!' },
      { trekId: 'kalsubai', rating: 4, comment: 'Well organized, Kasara pickup was on time. Heavy crowds but beautiful.' },
      { trekId: 'sandhan', rating: 5, comment: 'Rappelling down the canyon is an unforgettable experience. A must do!' },
      { trekId: 'andharban', rating: 5, comment: 'Lush green valleys and mist. Completely dark canopy trek. Loved it!' },
    ];

    for (const r of reviews) {
      await prisma.review.create({
        data: {
          userId: customer.id,
          trekId: r.trekId,
          rating: r.rating,
          comment: r.comment,
        },
      });
    }
    console.log('⭐ Seeded Customer Reviews.');

    // 7. Seed one booking & payment for testing
    const testBooking = await prisma.booking.create({
      data: {
        userId: customer.id,
        tripId: seededTrips[0].id, // Kalsubai
        members: 2,
        totalAmount: 2998.00,
        status: 'CONFIRMED',
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: testBooking.id,
        amount: 2998.00,
        paymentStatus: 'PAID',
        transactionId: 'TXN-KALS-TEST1234',
        method: 'UPI',
      },
    });

    // Update booked seats
    await prisma.trip.update({
      where: { id: seededTrips[0].id },
      data: { bookedSeats: 2 },
    });

    console.log('💳 Seeded mock Booking & payment transaction.');

    console.log('🎉 Seeding successfully completed!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
