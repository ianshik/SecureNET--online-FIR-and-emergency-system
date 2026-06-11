import express from 'express';
import { createComplaint, getMyComplaints, getComplaintById } from './complaint.controller';
import { protect, authorize } from '../../middleware/auth';
import { Role } from '../../models/User';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', authorize(Role.CITIZEN), createComplaint);
router.get('/my-complaints', authorize(Role.CITIZEN), getMyComplaints);
router.get('/:id', getComplaintById); // Both citizen and officers can view

export default router;
