import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { connectDB } from './src/config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[CampusGig Backend] Server running on port ${PORT}`);
      console.log(`[CampusGig Backend] Health check available at http://localhost:${PORT}/api/health`);
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
