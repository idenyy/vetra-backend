import express from 'express';
import { deleteProfile, getProfile, updateProfile } from '../controllers/user.controller.js';
import { authorization } from '../middleware/authorization.js';

const router = express.Router();

router.get('/', authorization, getProfile);
router.put('/', authorization, updateProfile);
router.delete('/', authorization, deleteProfile);

export default router;
