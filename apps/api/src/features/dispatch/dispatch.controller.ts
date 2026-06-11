import { Request, Response } from 'express';
import { DispatchRequest, DispatchStatus } from '../../models/DispatchRequest';
import { Incident, IncidentStatus } from '../../models/Incident';
import { Officer } from '../../models/User';
import { AuthRequest } from '../../middleware/auth';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'EN_ROUTE', 'ON_SCENE', 'COMPLETED']),
});

export const respondToDispatch = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // Dispatch Request ID
    const validatedData = updateStatusSchema.parse(req.body);
    
    const dispatchReq = await DispatchRequest.findById(id);
    if (!dispatchReq) {
      return res.status(404).json({ success: false, message: 'Dispatch request not found' });
    }

    if (dispatchReq.unitId.toString() !== req.user!.id) {
      return res.status(403).json({ success: false, message: 'Not authorized for this dispatch' });
    }

    dispatchReq.status = validatedData.status as DispatchStatus;
    
    if (validatedData.status === 'ACCEPTED') {
      dispatchReq.acceptedAt = new Date();
      await Officer.findByIdAndUpdate(req.user!.id, { status: 'DISPATCHED' });
    } else if (validatedData.status === 'REJECTED') {
      await Officer.findByIdAndUpdate(req.user!.id, { status: 'AVAILABLE' });
      // In a real app, this should trigger the fallback logic to find next unit
    } else if (validatedData.status === 'ON_SCENE') {
      await Officer.findByIdAndUpdate(req.user!.id, { status: 'ON_SCENE' });
      await Incident.findByIdAndUpdate(dispatchReq.incidentId, { status: IncidentStatus.UNIT_ON_SCENE });
    } else if (validatedData.status === 'COMPLETED') {
      dispatchReq.completedAt = new Date();
      await Officer.findByIdAndUpdate(req.user!.id, { status: 'AVAILABLE' });
      await Incident.findByIdAndUpdate(dispatchReq.incidentId, { status: IncidentStatus.RESOLVED });
    }

    await dispatchReq.save();

    res.status(200).json({ success: true, data: dispatchReq });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMyDispatches = async (req: AuthRequest, res: Response) => {
  try {
    const dispatches = await DispatchRequest.find({ unitId: req.user!.id })
      .populate('incidentId')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, count: dispatches.length, data: dispatches });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Control Room endpoints
export const getAllActiveIncidents = async (req: AuthRequest, res: Response) => {
  try {
    const incidents = await Incident.find({ status: { $ne: IncidentStatus.RESOLVED } })
      .populate({
        path: 'dispatchedUnits',
        populate: { path: 'unitId', select: 'firstName lastName badgeNumber' }
      })
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, count: incidents.length, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
