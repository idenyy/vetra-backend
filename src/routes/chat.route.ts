import express from 'express';
import { authorization } from '../middleware/authorization.js';
import { getMessages, getUsers, sendMessage } from '../controllers/chat.controller.js';

const router = express.Router();

router.get('/users', authorization, getUsers);
router.get('/:id', authorization, getMessages);

router.post('/send', authorization, sendMessage);

export default router;
