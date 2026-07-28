import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/db.js';
import bcrypt from 'bcryptjs';

let testToken = '';
let adminToken = '';
let testUserId = null;

beforeAll(async () => {
  // Ensure test user exists
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('test123456', salt);

  try {
    const user = await prisma.user.upsert({
      where: { email: 'testuser@test.com' },
      update: {},
      create: { name: 'Test User', email: 'testuser@test.com', phone: '9999999999', passwordHash: hash, role: 'USER' },
    });
    testUserId = user.id;

    await prisma.user.upsert({
      where: { email: 'testadmin@test.com' },
      update: {},
      create: { name: 'Test Admin', email: 'testadmin@test.com', phone: '8888888888', passwordHash: hash, role: 'ADMIN' },
    });
  } catch (e) {
    // Tables may not exist in CI — skip
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('API Health', () => {
  it('GET /api should return status online', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'online');
    expect(res.body).toHaveProperty('version', '2.0.0');
  });
});

describe('Auth - Registration', () => {
  it('POST /api/auth/register should register a new user', async () => {
    const email = `jest_${Date.now()}@test.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jest User', email, phone: '7777777777', password: 'jestpass123' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(email);
    testToken = res.body.token;
  });

  it('POST /api/auth/register should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Dup User', email: 'testuser@test.com', phone: '6666666666', password: 'password123' });

    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/register should reject invalid data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'bad', phone: '1', password: '1' });

    expect(res.statusCode).toBe(400);
  });
});

describe('Auth - Login', () => {
  it('POST /api/auth/login should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@test.com', password: 'test123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    testToken = res.body.token;
  });

  it('POST /api/auth/login with admin should return admin token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testadmin@test.com', password: 'test123456' });

    expect(res.statusCode).toBe(200);
    adminToken = res.body.token;
  });

  it('POST /api/auth/login should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@test.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
  });
});

describe('Auth - Profile', () => {
  it('GET /api/auth/profile should return user profile with token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty('email', 'testuser@test.com');
  });

  it('GET /api/auth/profile should reject without token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.statusCode).toBe(401);
  });
});
