import express from 'express';
import { respondToDispatch, getMyDispatches, getAllActiveIncidents } from './dispatch.controller';
import { protect, authorize } from '../../middleware/auth';
import { Role } from '../../models/User';

const router = express.Router();

router.use(protect);

router.get('/my-dispatches', authorize(Role.OFFICER), getMyDispatches);
router.patch('/:id/respond', authorize(Role.OFFICER), respondToDispatch);

// Control Room
router.get('/active-incidents', authorize(Role.CONTROL_ROOM, Role.AUTHORITY), getAllActiveIncidents);

export default router;
