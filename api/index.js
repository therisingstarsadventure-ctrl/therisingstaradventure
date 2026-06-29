// Vercel Serverless Function Entry Point
// Note: Vercel injects env vars (DATABASE_URL, JWT_SECRET) automatically from dashboard settings
// dotenv is only needed for local dev - handled in server.js
import app from '../backend/src/app.js';

export default app;
