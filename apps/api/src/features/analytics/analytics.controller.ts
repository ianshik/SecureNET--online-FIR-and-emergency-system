import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { Complaint } from '../../models/Complaint';
import { Incident } from '../../models/Incident';
import { FIR } from '../../models/FIR';
import { Officer } from '../../models/User';
import { AuditLog } from '../../models/AuditLog';
import { DispatchRequest } from '../../models/DispatchRequest';

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
    const officers = await Officer.find().select('firstName lastName badgeNumber status _id');

    // Aggregate completed dispatches per officer
    const dispatchStats = await DispatchRequest.aggregate([
      { $match: { status: 'COMPLETED' } },
      {
        $group: {
          _id: '$unitId',
          casesResolved: { $sum: 1 },
          avgTimeMs: { $avg: { $subtract: ['$completedAt', '$createdAt'] } }
        }
      }
    ]);

    const statsMap = new Map();
    dispatchStats.forEach(stat => {
      statsMap.set(stat._id.toString(), {
        casesResolved: stat.casesResolved,
        avgTime: stat.avgTimeMs ? Math.floor(stat.avgTimeMs / (1000 * 60)) : 0
      });
    });

    const performance = officers.map(o => {
      const stats = statsMap.get(o._id.toString()) || { casesResolved: 0, avgTime: 0 };
      return {
        name: `${o.firstName} ${o.lastName}`,
        badge: o.badgeNumber,
        status: o.status,
        casesResolved: stats.casesResolved,
        avgTime: stats.avgTime,
      };
    });

    res.status(200).json({ success: true, data: performance });
  } catch (error) {
    console.error('Officer performance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await AuditLog.find()
      .populate('actor', 'firstName lastName role')
      .sort({ timestamp: -1 })
      .limit(limit);

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTimeTrends = async (req: AuthRequest, res: Response) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const incidents = await Incident.find({ createdAt: { $gte: sevenDaysAgo } }).select('createdAt');

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trendMap = new Map<string, number>();

    // Pre-fill the map with the last 7 days in order
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      trendMap.set(dayName, 0);
    }

    // Populate incidents count
    incidents.forEach(inc => {
      const dayName = days[inc.createdAt.getDay()];
      if (trendMap.has(dayName)) {
        trendMap.set(dayName, trendMap.get(dayName)! + 1);
      }
    });

    const data = Array.from(trendMap, ([date, incidents]) => ({ date, incidents }));
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Time trends error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTopHeroes = async (req: Request, res: Response) => {
  try {
    const officers = await Officer.find().select('firstName lastName officerType _id');

    // Aggregate completed dispatches per officer
    const dispatchStats = await DispatchRequest.aggregate([
      { $match: { status: 'COMPLETED' } },
      {
        $group: {
          _id: '$unitId',
          casesResolved: { $sum: 1 },
        }
      }
    ]);

    const statsMap = new Map();
    dispatchStats.forEach(stat => {
      statsMap.set(stat._id.toString(), stat.casesResolved);
    });

    const heroes = {
      POLICE: { name: '', casesResolved: -1, type: 'Police' },
      FIRE: { name: '', casesResolved: -1, type: 'Fire' },
      AMBULANCE: { name: '', casesResolved: -1, type: 'Medic' },
    };

    officers.forEach(o => {
      if (!o.officerType) return;

      const casesResolved = statsMap.get(o._id.toString()) || 0;

      if (heroes[o.officerType] && casesResolved > heroes[o.officerType].casesResolved) {
        heroes[o.officerType] = {
          name: `${o.firstName} ${o.lastName}`,
          casesResolved,
          type: heroes[o.officerType].type,
        };
      }
    });

    // Format for frontend
    const heroesList = Object.values(heroes).map(h => ({
      name: h.name || 'Pending Data',
      type: h.type,
      casesResolved: h.casesResolved === -1 ? 0 : h.casesResolved,
    }));

    res.status(200).json({ success: true, data: heroesList });
  } catch (error) {
    console.error('Heroes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// just fot the daily checkin
