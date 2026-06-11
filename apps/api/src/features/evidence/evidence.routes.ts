import express from 'express';
import { getUploadUrl, viewEvidence } from './evidence.controller';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/upload-url', getUploadUrl);
router.get('/:id/view', viewEvidence);

export default router;
