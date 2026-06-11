import { Request, Response } from 'express';
import { FIR, FIRStatus } from '../../models/FIR';
import { Complaint, ComplaintStatus } from '../../models/Complaint';
import { AuthRequest } from '../../middleware/auth';
import { z } from 'zod';
import crypto from 'crypto';

const createFIRSchema = z.object({
  complaintId: z.string(),
  accusedDetails: z.string().optional(),
  incidentDetails: z.string(),
  witnesses: z.array(z.string()).optional(),
  officerRemarks: z.string().optional(),
});

const generateFIRNumber = () => {
  const year = new Date().getFullYear();
  const randomStr = Math.floor(100000 + Math.random() * 900000);
  return `FIR/DL/${year}/${randomStr}`;
};

export const draftFIR = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createFIRSchema.parse(req.body);
    
    const complaint = await Complaint.findById(validatedData.complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const fir = await FIR.create({
      ...validatedData,
      firNumber: generateFIRNumber(),
      complainantId: complaint.citizenId,
      draftedBy: req.user!.id,
      status: FIRStatus.DRAFT,
    });

    complaint.status = ComplaintStatus.IN_PROGRESS;
    complaint.timeline.push({
      status: ComplaintStatus.IN_PROGRESS,
      updatedBy: req.user!.id as any,
      timestamp: new Date(),
      remarks: `FIR Drafted: ${fir.firNumber}`
    });
    await complaint.save();

    res.status(201).json({ success: true, data: fir });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const finalizeFIR = async (req: AuthRequest, res: Response) => {
  try {
    const fir = await FIR.findById(req.params.id);
    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }

    // Mock Digital Signature
    const hash = crypto.createHash('sha256').update(`${req.user!.id}-${Date.now()}`).digest('hex');

    fir.status = FIRStatus.FINALIZED;
    fir.digitalSignature = hash;
    await fir.save();

    res.status(200).json({ success: true, data: fir });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// MOCK: Generate PDF
export const exportFIRToPDF = async (req: AuthRequest, res: Response) => {
  try {
    const fir = await FIR.findById(req.params.id);
    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }

    // In a real app, use pdfkit or puppeteer to generate PDF buffer
    // For now, we return a mock URL
    res.status(200).json({ success: true, data: { pdfUrl: `https://mock-s3-bucket.s3.amazonaws.com/${fir.firNumber}.pdf` } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
