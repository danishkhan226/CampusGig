import mongoose from 'mongoose';

export const getSystemHealth = async () => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      connected: dbState === 1,
      name: mongoose.connection.name || 'campusgig'
    },
    environment: process.env.NODE_ENV || 'development'
  };
};
