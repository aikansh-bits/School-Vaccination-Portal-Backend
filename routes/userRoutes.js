import { Router } from 'express';
import { signupUser, loginUser, getProfile } from '../controllers/userController.js';

const router = Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/profile/:userId', getProfile);

export default router;
