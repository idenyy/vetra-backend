import { Server } from 'socket.io';
import http from 'http';
import express, { Application } from 'express';
import Message from '../models/message.model.js';

export const app: Application = express();
export const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'https://vetra-pi.vercel.app'],
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

  socket.on('readMessage', async (data) => {
    const { messageId, userId } = data;

    try {
      const message = await Message.findById(messageId);
      if (message && message.receiverId === userId) {
        message.isRead = true;
        await message.save();

        const senderSocketId = getReceiverSocketId(message.senderId.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('messageRead', {
            messageId,
            recipientId: userId
          });
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected: ', socket.id);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export default { io, app, server };
