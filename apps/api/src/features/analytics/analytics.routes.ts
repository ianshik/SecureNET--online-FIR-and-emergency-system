import express from 'express';
import { getDashboardKPIs, getCrimeTrends, getOfficerPerformance } from './analytics.controller';
import { protect, authorize } from '../../middleware/auth';
import { Role } from '../../models/User';

const router = express.Router();

router.use(protect);
router.use(authorize(Role.AUTHORITY, Role.CONTROL_ROOM));

router.get('/kpis', getDashboardKPIs);
router.get('/trends', getCrimeTrends);
router.get('/officers', getOfficerPerformance);

export default router;
