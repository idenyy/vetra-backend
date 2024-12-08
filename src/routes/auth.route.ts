import express from 'express';
import { checkAuth, login, logout, signup, signupVerify } from '../controllers/auth.controller.js';
import { authorization } from '../middleware/authorization.js';

const router = express.Router();

router.get('/check', authorization, checkAuth);

router.post('/signup', signup);
router.post('/signup/verify', signupVerify);
router.post('/login', login);

router.delete('/logout', logout);

export default router;
