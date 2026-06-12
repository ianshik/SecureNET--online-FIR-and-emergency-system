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

export const getMyFIRs = async (req: AuthRequest, res: Response) => {
  try {
    const firs = await FIR.find({ draftedBy: req.user!.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: firs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

import PDFDocument from 'pdfkit';

// Generate PDF
export const exportFIRToPDF = async (req: AuthRequest, res: Response) => {
  try {
    const fir = await FIR.findById(req.params.id);
    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="FIR-${fir.firNumber.replace(/\//g, '-')}.pdf"`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('SECURENET POLICE DEPARTMENT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text('FIRST INFORMATION REPORT (F.I.R)', { align: 'center', underline: true });
    doc.moveDown(2);

    // Metadata
    doc.fontSize(12).font('Helvetica-Bold').text('FIR Number: ', { continued: true }).font('Helvetica').text(fir.firNumber);
    doc.font('Helvetica-Bold').text('Date: ', { continued: true }).font('Helvetica').text(new Date(fir.createdAt).toLocaleString());
    doc.font('Helvetica-Bold').text('Status: ', { continued: true }).font('Helvetica').text(fir.status);
    doc.moveDown();

    // Incident Details
    doc.font('Helvetica-Bold').text('Incident Details:');
    doc.font('Helvetica').text(fir.incidentDetails, { align: 'justify' });
    doc.moveDown();

    // Accused Details
    if (fir.accusedDetails) {
      doc.font('Helvetica-Bold').text('Accused Details:');
      doc.font('Helvetica').text(fir.accusedDetails);
      doc.moveDown();
    }

    // Witnesses
    if (fir.witnesses && fir.witnesses.length > 0) {
      doc.font('Helvetica-Bold').text('Witnesses:');
      doc.font('Helvetica').text(fir.witnesses.join(', '));
      doc.moveDown();
    }

    // Remarks
    if (fir.officerRemarks) {
      doc.font('Helvetica-Bold').text('Officer Remarks (IPC Sections):');
      doc.font('Helvetica').text(fir.officerRemarks);
      doc.moveDown();
    }

    // Signature
    doc.moveDown(3);
    doc.font('Helvetica-Bold').text('Digital Signature / Verification Hash:');
    doc.font('Courier').fontSize(10).text(fir.digitalSignature || 'PENDING FINALIZATION');

    doc.end();

  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ success: false, message: 'Server error generating PDF' });
  }
};

import { GoogleGenAI, Type, Schema } from '@google/genai';

const aiDraftSchema = z.object({
  informalDescription: z.string().min(10),
});

export const generateAIDraft = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = aiDraftSchema.parse(req.body);
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        formalIncidentDetails: {
          type: Type.STRING,
          description: "A formal, chronological, and legally sound description of the incident based on the user's input.",
        },
        accusedDetails: {
          type: Type.STRING,
          description: "A detailed physical description or identification details of the accused (if any mentioned), otherwise leave empty.",
        },
        witnesses: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of witnesses mentioned in the input, otherwise empty.",
        },
        suggestedIPCSections: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of relevant Indian Penal Code (IPC) sections based on the crime described, along with a short explanation (e.g., 'Section 379 - Theft').",
        },
      },
      required: ["formalIncidentDetails", "accusedDetails", "witnesses", "suggestedIPCSections"],
    };

    const prompt = `You are a senior police officer drafting a First Information Report (FIR). 
Transform the following informal citizen statement into a structured, formal legal draft.

CITIZEN STATEMENT:
"${validatedData.informalDescription}"`;
    console.log("Gemini API Key Present:", !!process.env.GEMINI_API_KEY);
    console.log("Gemini Key Prefix:", process.env.GEMINI_API_KEY?.substring(0, 10));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.2,
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const draft = JSON.parse(response.text);

    res.status(200).json({
      success: true,
      data: draft,
    });

  } catch (error) {
    console.error('AI Draft Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Server error generating AI draft' });
  }
};

