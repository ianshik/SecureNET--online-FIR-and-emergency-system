import { Request, Response } from 'express';
import { User, Role } from '../../models/User';
import mongoose from 'mongoose';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role provided' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // Since Mongoose discriminators are based on the 'role' field,
    // we use updateOne on the base collection to change the discriminator key.
    const updateData: any = { role };

    // If upgrading to OFFICER, ensure they have a badge number
    if (role === Role.OFFICER) {
      const existingUser = await User.findById(id);
      if (existingUser && !(existingUser as any).badgeNumber) {
        updateData.badgeNumber = `OFF-${Math.floor(Math.random() * 10000)}`;
      }
    }

    await User.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateData }
    );

    // Fetch the newly updated document to return it
    const updatedUser = await User.findById(id).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error: any) {
    console.error('Update role error:', error);
    res.status(500).json({ success: false, message: 'Server error updating user role' });
  }
};
