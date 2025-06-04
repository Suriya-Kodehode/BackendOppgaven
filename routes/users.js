import express from 'express';
import { userGet } from '../controllers/userGet.js';
import { userProfile } from '../controllers/userProfile.js';
import { userEdit } from '../controllers/userEdit.js';
import { userLogin } from '../controllers/userLogin.js';
import { userSignup } from '../controllers/userSignup.js';
import authToken from '../middleware/authToken.js';

const router = express.Router();

// Public routes
router.post('/login', userLogin);
router.post('/signup', userSignup);

// Protected routes
router.get('/', authToken, userGet);
router.get('/profile', authToken, userProfile);
router.put('/edit', authToken, userEdit);

export default router;