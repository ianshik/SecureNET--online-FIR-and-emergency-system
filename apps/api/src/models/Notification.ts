import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  READ = 'READ',
}

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  channel: NotificationChannel;
  title: string;
  message: string;
  status: NotificationStatus;
  retryCount: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    channel: { type: String, enum: Object.values(NotificationChannel), required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: Object.values(NotificationStatus), default: NotificationStatus.PENDING },
    retryCount: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
