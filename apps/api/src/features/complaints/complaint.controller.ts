import { Request, Response } from 'express';
import { Complaint, ComplaintType, Priority, ComplaintStatus } from '../../models/Complaint';
import { AuthRequest } from '../../middleware/auth';
import { z } from 'zod';

const createComplaintSchema = z.object({
  type: z.nativeEnum(ComplaintType),
  title: z.string().min(5),
  description: z.string().min(20),
  incidentDate: z.string().datetime(),
  location: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
    address: z.string().optional(),
  }),
  evidenceUrls: z.array(z.string()).optional(),
});

// Auto-score priority based on type and keywords
const calculatePriority = (type: ComplaintType, description: string): Priority => {
  if ([ComplaintType.WOMEN_SAFETY, ComplaintType.CHILD_SAFETY, ComplaintType.DOMESTIC_VIOLENCE].includes(type)) {
    return Priority.CRITICAL;
  }
  
  const descLower = description.toLowerCase();
  if (descLower.includes('murder') || descLower.includes('kidnap') || descLower.includes('weapon') || descLower.includes('gun')) {
    return Priority.CRITICAL;
  }
  
  if (type === ComplaintType.CRIMINAL || type === ComplaintType.MISSING_PERSON) {
    return Priority.HIGH;
  }
  
  if (type === ComplaintType.CYBER_CRIME) {
    return Priority.MEDIUM;
  }
  
  return Priority.LOW; // Traffic, Civil
};

export const createComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createComplaintSchema.parse(req.body);
    
    const priority = calculatePriority(validatedData.type, validatedData.description);
    
    const complaint = await Complaint.create({
      ...validatedData,
      citizenId: req.user!.id,
      priority,
      status: ComplaintStatus.SUBMITTED,
      timeline: [
        {
          status: ComplaintStatus.SUBMITTED,
          updatedBy: req.user!.id,
          remarks: 'Complaint successfully submitted by citizen',
        }
      ]
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMyComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const complaints = await Complaint.find({ citizenId: req.user!.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getComplaintById = async (req: AuthRequest, res: Response) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('assignedOfficerId', 'firstName lastName badgeNumber');
      
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    
    // Ensure citizen can only see their own complaint
    if (req.user!.role === 'CITIZEN' && complaint.citizenId.toString() !== req.user!.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
    }
    
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
