import { Server } from 'socket.io';
import http from 'http';
import express, { Application } from 'express';

export const app: Application = express();
export const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('User connected: ', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected: ', socket.id);
  });
});

export default { io, app, server };
