import express from 'express';
import { authorization } from '../middleware/authorization.js';
import { getMessages, getUsers, readMessage, sendMessage } from '../controllers/chat.controller.js';

const router = express.Router();

router.get('/users', authorization, getUsers);
router.get('/:id', authorization, getMessages);

router.post('/send/:id', authorization, sendMessage);
router.patch('/message/read/:id', authorization, readMessage);

export default router;
