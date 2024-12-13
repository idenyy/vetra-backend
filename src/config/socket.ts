import { Server } from 'socket.io';
import http from 'http';
import express, { Application } from 'express';

export const app: Application = express();
export const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  }
});

export function getReceiverSocketId(userId: string) {
  return userSocketMap[userId];
}

const userSocketMap: any = {} as any;

io.on('connection', (socket) => {
  console.log('User connected: ', socket.id);

  const userId = socket.handshake.query.userId as string;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log('User disconnected: ', socket.id);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export default { io, app, server };
