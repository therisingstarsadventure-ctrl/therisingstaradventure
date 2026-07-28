import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/db.js';
import bcrypt from 'bcryptjs';

let userToken = '';
let adminToken = '';
let testTripId = '';

beforeAll(async () => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('test123456', salt);

  try {
    await prisma.user.upsert({
      where: { email: 'bookinguser@test.com' },
      update: {},
      create: { name: 'Booking User', email: 'bookinguser@test.com', phone: '5555555555', passwordHash: hash, role: 'USER' },
    });

    await prisma.user.upsert({
      where: { email: 'bookingadmin@test.com' },
      update: {},
      create: { name: 'Booking Admin', email: 'bookingadmin@test.com', phone: '4444444444', passwordHash: hash, role: 'ADMIN' },
    });

    const leader = await prisma.user.upsert({
      where: { email: 'bookingleader@test.com' },
      update: {},
      create: { name: 'Booking Leader', email: 'bookingleader@test.com', phone: '3333333333', passwordHash: hash, role: 'LEADER' },
    });

    // Create test trek
    await prisma.trek.upsert({
      where: { id: 'test-trek' },
      update: {},
      create: {
        id: 'test-trek', title: 'Test Trek', location: 'Test Location', price: 1500,
        days: '1 Day', description: 'Test description', zone: 'maharashtra',
        difficulty: 'Easy', duration: '1 Day', elevation: '1000 ft',
        groupSize: '10', bestSeason: 'All Year', meetingPoint: 'Test Point',
      },
    });

    // Create test trip
    const trip = await prisma.trip.upsert({
      where: { id: 'test-trip-booking' },
      update: {},
      create: {
        id: 'test-trip-booking', trekId: 'test-trek',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), totalSeats: 20,
        bookedSeats: 0, status: 'UPCOMING', tripLeaderId: leader.id,
        trackingToken: `TR-TEST-${Date.now()}`,
      },
    });
    testTripId = trip.id;

    // Login
    const userRes = await request(app).post('/api/auth/login').send({ email: 'bookinguser@test.com', password: 'test123456' });
    userToken = userRes.body.token;
    const adminRes = await request(app).post('/api/auth/login').send({ email: 'bookingadmin@test.com', password: 'test123456' });
    adminToken = adminRes.body.token;
  } catch (e) {
    console.error('Booking test setup error:', e.message);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Packages', () => {
  it('GET /api/packages should return array', async () => {
    const res = await request(app).get('/api/packages');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/packages/test-trek should return package details', async () => {
    const res = await request(app).get('/api/packages/test-trek');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('title', 'Test Trek');
  });

  it('GET /api/packages/nonexistent should return 404', async () => {
    const res = await request(app).get('/api/packages/does-not-exist-12345');
    expect(res.statusCode).toBe(404);
  });
});

describe('Trips', () => {
  it('GET /api/trips/upcoming should return upcoming trips', async () => {
    const res = await request(app).get('/api/trips/upcoming');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/trips (admin) should return all trips', async () => {
    const res = await request(app).get('/api/trips').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('GET /api/trips without token should be rejected', async () => {
    const res = await request(app).get('/api/trips');
    expect(res.statusCode).toBe(401);
  });
});

describe('Bookings', () => {
  let testBookingId = null;

  it('POST /api/bookings should create a booking', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ tripId: testTripId, members: 2 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('booking');
    expect(res.body.booking).toHaveProperty('id');
    testBookingId = res.body.booking.id;
  });

  it('POST /api/bookings should reject without auth', async () => {
    const res = await request(app).post('/api/bookings').send({ tripId: testTripId, members: 1 });
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/bookings/my should return user bookings', async () => {
    const res = await request(app).get('/api/bookings/my').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/bookings (admin) should return all bookings', async () => {
    const res = await request(app).get('/api/bookings').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('POST /api/payments should process payment', async () => {
    if (!testBookingId) return;
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ bookingId: testBookingId, transactionId: `TXN-TEST-${Date.now()}`, method: 'UPI' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('payment');
  });
});

describe('Search', () => {
  it('GET /api/search should return results with pagination', async () => {
    const res = await request(app).get('/api/search?q=trek');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('treks');
    expect(res.body).toHaveProperty('pagination');
  });
});

describe('Contact & Newsletter', () => {
  it('POST /api/contact should submit a message', async () => {
    const res = await request(app).post('/api/contact').send({
      name: 'Jest Contact', email: 'jestcontact@test.com', message: 'Test message from Jest',
    });
    expect(res.statusCode).toBe(201);
  });

  it('POST /api/newsletter should subscribe', async () => {
    const email = `newsletter_${Date.now()}@test.com`;
    const res = await request(app).post('/api/newsletter').send({ email });
    expect(res.statusCode).toBe(201);
  });
});

describe('Admin', () => {
  it('GET /api/admin/stats should return stats for admin', async () => {
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalTreks');
    expect(res.body).toHaveProperty('totalRevenue');
  });

  it('GET /api/admin/stats should reject non-admin', async () => {
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });
});
