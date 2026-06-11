import express from 'express';
import { draftFIR, finalizeFIR, exportFIRToPDF } from './fir.controller';
import { protect, authorize } from '../../middleware/auth';
import { Role } from '../../models/User';

const router = express.Router();

router.use(protect);

router.post('/draft', authorize(Role.OFFICER), draftFIR);
router.patch('/:id/finalize', authorize(Role.OFFICER), finalizeFIR);
router.get('/:id/export', exportFIRToPDF);

export default router;
