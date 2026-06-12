import express from 'express';
import { getDashboardKPIs, getCrimeTrends, getOfficerPerformance, getAuditLogs, getTimeTrends } from './analytics.controller';
import { protect, authorize } from '../../middleware/auth';
import { Role } from '../../models/User';

const router = express.Router();

router.use(protect);
router.use(authorize(Role.AUTHORITY, Role.CONTROL_ROOM));

router.get('/kpis', getDashboardKPIs);
router.get('/trends', getCrimeTrends);
router.get('/time-trends', getTimeTrends);
router.get('/officers', getOfficerPerformance);
router.get('/audit-logs', authorize(Role.AUTHORITY), getAuditLogs);

export default router;
