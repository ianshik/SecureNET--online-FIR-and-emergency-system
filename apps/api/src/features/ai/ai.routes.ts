import express from 'express';
import { classifyComplaint } from './ai.controller';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/classify', classifyComplaint);

export default router;
