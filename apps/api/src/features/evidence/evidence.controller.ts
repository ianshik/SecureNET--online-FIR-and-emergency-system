import { Request, Response } from 'express';
import { Evidence } from '../../models/Evidence';
import { AuthRequest } from '../../middleware/auth';
import AWS from 'aws-sdk';
import crypto from 'crypto';

// Setup AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1',
});

export const getUploadUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { fileName, fileType, fileSize, complaintId, incidentId, firId } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ success: false, message: 'FileName and FileType are required' });
    }

    const key = `evidence/${req.user!.id}/${crypto.randomBytes(16).toString('hex')}-${fileName}`;

    // Generate pre-signed URL
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || 'securenet-evidence-bucket',
      Key: key,
      ContentType: fileType,
      Expires: 60 * 5, // URL valid for 5 minutes
    };

    const uploadUrl = s3.getSignedUrl('putObject', params);
    const s3Url = `https://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${key}`;

    const evidence = await Evidence.create({
      fileName,
      fileType,
      fileSize: fileSize || 0,
      s3Key: key,
      s3Url,
      uploadedBy: req.user!.id,
      complaintId,
      incidentId,
      firId,
      chainOfCustody: [{
        actorId: req.user!.id,
        action: 'UPLOADED',
        timestamp: new Date(),
        ipAddress: req.ip
      }]
    });

    res.status(200).json({ success: true, data: { uploadUrl, evidenceId: evidence._id, s3Url } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const viewEvidence = async (req: AuthRequest, res: Response) => {
  try {
    const evidence = await Evidence.findById(req.params.id);
    if (!evidence || evidence.isDeleted) {
      return res.status(404).json({ success: false, message: 'Evidence not found' });
    }

    // Add to chain of custody
    evidence.chainOfCustody.push({
      actorId: req.user!.id as any,
      action: 'VIEWED',
      timestamp: new Date(),
      ipAddress: req.ip as any,
    });
    await evidence.save();

    const params = {
      Bucket: process.env.AWS_S3_BUCKET || 'securenet-evidence-bucket',
      Key: evidence.s3Key,
      Expires: 60 * 15, // Read access for 15 mins
    };

    const viewUrl = s3.getSignedUrl('getObject', params);

    res.status(200).json({ success: true, data: { viewUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
