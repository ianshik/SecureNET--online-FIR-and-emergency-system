import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { Complaint } from '../../models/Complaint';
import { Incident } from '../../models/Incident';
import { FIR } from '../../models/FIR';
import { Officer } from '../../models/User';

export const getDashboardKPIs = async (req: AuthRequest, res: Response) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const activeIncidents = await Incident.countDocuments({ status: { $ne: 'RESOLVED' } });
    const totalFIRs = await FIR.countDocuments();
    
    // Mock Response Time
    const avgResponseTimeMin = 14.5;
    
    // Resolution Rate Mock
    const resolvedComplaints = await Complaint.countDocuments({ status: 'RESOLVED' });
    const resolutionRate = totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalComplaints,
        activeIncidents,
        totalFIRs,
        avgResponseTimeMin,
        resolutionRate: resolutionRate.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCrimeTrends = async (req: AuthRequest, res: Response) => {
  try {
    // MongoDB Aggregation for Crime Types
    const trends = await Complaint.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedTrends = trends.map(t => ({ name: t._id, value: t.count }));

    res.status(200).json({ success: true, data: formattedTrends });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getOfficerPerformance = async (req: AuthRequest, res: Response) => {
  try {
    const officers = await Officer.find().select('firstName lastName badgeNumber status');
    // In a real scenario, we would aggregate completed dispatches per officer
    const performance = officers.map(o => ({
      name: `${o.firstName} ${o.lastName}`,
      badge: o.badgeNumber,
      status: o.status,
      casesResolved: Math.floor(Math.random() * 50), // Mock data
      avgTime: Math.floor(Math.random() * 30) + 10,  // Mock data
    }));

    res.status(200).json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
