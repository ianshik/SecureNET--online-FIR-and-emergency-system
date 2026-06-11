import { Request, Response } from 'express';
import { Incident, IncidentSeverity, IncidentStatus } from '../../models/Incident';
import { DispatchRequest, DispatchStatus } from '../../models/DispatchRequest';
import { Officer, Role } from '../../models/User';
import { Ambulance, Station } from '../../models/Resource';
import { AuthRequest } from '../../middleware/auth';
import { z } from 'zod';

const createSosSchema = z.object({
  coordinates: z.tuple([z.number(), z.number()]),
  servicesRequired: z.array(z.enum(['POLICE', 'AMBULANCE', 'FIRE'])).min(1),
});

// Helper for Smart Dispatch
const dispatchUnit = async (incidentId: any, unitId: any, unitType: 'POLICE' | 'AMBULANCE' | 'FIRE', etaMinutes: number) => {
  return await DispatchRequest.create({
    incidentId,
    unitId,
    unitType,
    status: DispatchStatus.PENDING,
    etaMinutes,
  });
};

export const triggerSOS = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createSosSchema.parse(req.body);
    
    // Create Incident
    const incident = await Incident.create({
      citizenId: req.user!.id,
      location: { type: 'Point', coordinates: validatedData.coordinates },
      servicesRequired: validatedData.servicesRequired,
      severity: IncidentSeverity.CRITICAL, // Default SOS to critical
      status: IncidentStatus.SOS_SENT,
      dispatchedUnits: [],
    });

    const [lon, lat] = validatedData.coordinates;
    const searchRadiusKm = 10;
    const earthRadiusKm = 6378.1;

    let dispatchedRequests = [];

    // Dispatch Police
    if (validatedData.servicesRequired.includes('POLICE')) {
      // Find nearest available officer
      const nearestOfficer = await Officer.findOne({
        status: 'AVAILABLE',
        currentLocation: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lon, lat] },
            $maxDistance: searchRadiusKm * 1000, // in meters
          }
        }
      });

      if (nearestOfficer) {
        // ETA mock: 1 min per km + 2 mins base
        const distanceObj = await Officer.aggregate([
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [lon, lat] },
              distanceField: "distance",
              maxDistance: searchRadiusKm * 1000,
              query: { _id: nearestOfficer._id },
              spherical: true
            }
          }
        ]);
        
        const distKm = distanceObj.length > 0 ? distanceObj[0].distance / 1000 : 5;
        const eta = Math.ceil(distKm * 1 + 2);
        
        const dispatchReq = await dispatchUnit(incident._id, nearestOfficer._id, 'POLICE', eta);
        dispatchedRequests.push(dispatchReq._id);
        
        // Update officer status to avoid multiple dispatches
        await Officer.findByIdAndUpdate(nearestOfficer._id, { status: 'DISPATCHED' });
      }
    }

    // Dispatch Ambulance
    if (validatedData.servicesRequired.includes('AMBULANCE')) {
      const nearestAmbulance = await Ambulance.findOne({
        status: 'AVAILABLE',
        currentLocation: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lon, lat] },
            $maxDistance: searchRadiusKm * 1000,
          }
        }
      });

      if (nearestAmbulance) {
        const dispatchReq = await dispatchUnit(incident._id, nearestAmbulance._id, 'AMBULANCE', 10); // Mock 10 min ETA
        dispatchedRequests.push(dispatchReq._id);
        await Ambulance.findByIdAndUpdate(nearestAmbulance._id, { status: 'DISPATCHED', assignedTo: incident._id });
      }
    }

    // Update incident with dispatch requests
    if (dispatchedRequests.length > 0) {
      incident.status = IncidentStatus.UNIT_DISPATCHED;
      incident.dispatchedUnits = dispatchedRequests as any;
      await incident.save();
    }

    // TODO: Emit Socket.io events to control room and specific officers

    res.status(201).json({
      success: true,
      message: 'SOS triggered successfully',
      data: incident
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
