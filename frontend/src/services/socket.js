import { io } from 'socket.io-client';

let socket = null;

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, '');
  }
  return window.location.origin;
};

export const initSocketClient = () => {
  if (!socket) {
    const url = getSocketUrl();
    let token = null;
    try {
      token = localStorage.getItem('campusgig_token');
    } catch (e) {}

    socket = io(url, {
      withCredentials: true,
      auth: { token },
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocketClient();
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};
