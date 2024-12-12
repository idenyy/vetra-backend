import { Request, Response } from 'express';
import { Op } from 'sequelize';

import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import cloudinary from '../config/cloudinary.js';

export const getUsers = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id;
  try {
    const filteredUsers = await User.findAll({
      where: { id: userId },
      attributes: { exclude: ['password'] }
    });

    res.status(200).json(filteredUsers);
  } catch (error: any) {
    console.error(`Error in [getUsers] controller: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getMessages = async (
  req: Request,
  res: Response
): Promise<any> => {
  const senderId = req.user?.id;
  const { receiverId } = req.params;
  try {
    if (!senderId || !receiverId) {
      return res.status(400).json({ error: 'Both user IDs must be provided' });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      },
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json(messages);
  } catch (error: any) {
    console.error(`Error in [getMessages] controller: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<any> => {
  const senderId = req.user?.id;
  const { id: receiverId } = req.params;
  const { content } = req.body;

  try {
    if (!senderId || !receiverId || !content)
      return res
        .status(400)
        .json({ error: 'Sender ID, receiver ID and content must be provided' });

    let imageUrl: string = '';
    if (content.image) {
      const uploadPicture = await cloudinary.uploader.upload(content.image);
      imageUrl = uploadPicture.secure_url;
    }

    const newMessage = await Message.create({
      senderId: senderId,
      receiverId: receiverId,
      content: {
        text: content.text,
        image: imageUrl
      },
      createdAt: new Date()
    });

    res.status(201).json(newMessage);
  } catch (error: any) {
    console.error(`Error in [sendMessage] controller: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
