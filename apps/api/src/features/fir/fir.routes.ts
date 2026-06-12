import express from 'express';
import { draftFIR, finalizeFIR, exportFIRToPDF, generateAIDraft, getMyFIRs } from './fir.controller';
import { protect, authorize } from '../../middleware/auth';
import { Role } from '../../models/User';

const router = express.Router();

router.use(protect);

router.get('/my-firs', authorize(Role.OFFICER), getMyFIRs);
router.post('/ai-draft', authorize(Role.OFFICER), generateAIDraft);
router.post('/draft', authorize(Role.OFFICER), draftFIR);
router.patch('/:id/finalize', authorize(Role.OFFICER), finalizeFIR);
router.get('/:id/export', exportFIRToPDF);

export default router;
