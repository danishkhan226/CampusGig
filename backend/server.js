import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { initSocket } from './src/socket/index.js';

// ─── Vercel Serverless Export ────────────────────────────────────────────────
// On Vercel, the module is imported by the runtime — no server.listen() needed.
// We still connect to MongoDB lazily (once per cold start).
let isConnected = false;

const ensureDB = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Vercel calls this as a serverless function handler
export default async function handler(req, res) {
  await ensureDB();
  return app(req, res);
}

// ─── Local Development Server ─────────────────────────────────────────────────
// Only run when executed directly (not imported by Vercel)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;

  const startServer = async () => {
    try {
      await connectDB();

      const server = http.createServer(app);
      initSocket(server);

      server.listen(PORT, () => {
        console.log(`[CampusGig Backend] Server running on port ${PORT}`);
        console.log(`[CampusGig Backend] Health: http://localhost:${PORT}/api/health`);
      });

      const gracefulShutdown = () => {
        console.log('\n[CampusGig Backend] Shutting down gracefully...');
        server.close(() => {
          console.log('[CampusGig Backend] HTTP server closed.');
          process.exit(0);
        });
      };

      process.on('SIGTERM', gracefulShutdown);
      process.on('SIGINT', gracefulShutdown);
    } catch (err) {
      console.error('[CampusGig Backend] Failed to start server:', err);
      process.exit(1);
    }
  };

  startServer();
}
