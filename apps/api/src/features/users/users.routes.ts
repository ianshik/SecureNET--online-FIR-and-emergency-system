import express from 'express';
import { getAllUsers, updateUserRole } from './users.controller';
import { protect, authorize } from '../../middleware/auth';
import { Role } from '../../models/User';

const router = express.Router();

// Only authorities can manage users
router.use(protect, authorize(Role.AUTHORITY));

router.route('/')
  .get(getAllUsers);

router.route('/:id/role')
  .patch(updateUserRole);

export default router;
