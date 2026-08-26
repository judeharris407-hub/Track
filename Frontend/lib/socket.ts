import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

export const getSocket = (): Socket => socket;

export default socket;
