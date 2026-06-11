import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const generateToken = (userId: mongoose.Types.ObjectId, role: string, isRefresh = false) => {
  const secret = isRefresh ? process.env.JWT_REFRESH_SECRET! : process.env.JWT_SECRET!;
  const expiresIn = isRefresh ? '7d' : '15m'; // 15 mins for access, 7 days for refresh
  
  return jwt.sign({ id: userId, role }, secret, { expiresIn });
};

export const verifyToken = (token: string, isRefresh = false): any => {
  const secret = isRefresh ? process.env.JWT_REFRESH_SECRET! : process.env.JWT_SECRET!;
  return jwt.verify(token, secret);
};
