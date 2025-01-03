import { Request, Response } from 'express';

import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import cloudinary from '../config/cloudinary.js';
import { io } from '../config/socket.js';
import { getReceiverSocketId } from '../config/socket.js';

export const getUsers = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id;
  try {
    const users = await User.find({ _id: { $ne: userId } }).select('-password');

    res.status(200).json(users);
  } catch (error: any) {
    console.error(`Error in [getUsers] controller: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getMessages = async (req: Request, res: Response): Promise<any> => {
  const senderId = req.user?.id;
  const { id: receiverId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    });

    res.status(200).json(messages);
  } catch (error: any) {
    console.error(`Error in [getMessages] controller: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<any> => {
  const senderId = req.user?.id;
  const { id: receiverId } = req.params;
  const { content } = req.body;

  try {
    if (!senderId || !receiverId || !content)
      return res.status(400).json({ error: 'Sender ID, receiver ID and content must be provided' });

    let imageUrl: string = '';
    if (content.image) {
      const uploadPicture = await cloudinary.uploader.upload(content.image);
      imageUrl = uploadPicture.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      content: {
        text: content.text,
        image: imageUrl
      }
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit('newMessage', newMessage);

    res.status(201).json(newMessage);
  } catch (error: any) {
    console.error(`Error in [sendMessage] controller: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const readMessage = async (req: Request, res: Response): Promise<any> => {
  const { id: messageId } = req.params;

  try {
    const updatedMessage = await Message.findByIdAndUpdate(messageId, { isRead: true }, { new: true });

    if (!updatedMessage) return res.status(404).json({ error: 'Message not found' });

    res.status(200).json(updatedMessage);
  } catch (error: any) {
    console.error(`Error in [readMessage] controller: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
