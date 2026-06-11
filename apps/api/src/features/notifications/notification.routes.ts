import express from 'express';
import { getMyNotifications, markAsRead } from './notification.controller';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);

export default router;
