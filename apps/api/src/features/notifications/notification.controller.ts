import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { Notification } from '../../models/Notification';

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user!.id },
      { status: 'READ' },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
