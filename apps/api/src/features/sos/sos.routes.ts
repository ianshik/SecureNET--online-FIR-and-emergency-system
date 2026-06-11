import express from 'express';
import { triggerSOS } from './sos.controller';
import { protect, authorize } from '../../middleware/auth';
import { Role } from '../../models/User';

const router = express.Router();

router.use(protect);

router.post('/trigger', authorize(Role.CITIZEN), triggerSOS);

export default router;
