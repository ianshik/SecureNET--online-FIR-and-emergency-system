import nodemailer from 'nodemailer';
import { Notification, NotificationChannel, NotificationStatus } from '../../models/Notification';
import mongoose from 'mongoose';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendNotification = async (
  recipientId: mongoose.Types.ObjectId,
  channel: NotificationChannel,
  title: string,
  message: string,
  recipientContact: string // email or phone
) => {
  try {
    const notification = await Notification.create({
      recipientId,
      channel,
      title,
      message,
    });

    if (channel === NotificationChannel.EMAIL) {
      await transporter.sendMail({
        from: '"SecureNet" <noreply@securenet.gov>',
        to: recipientContact,
        subject: title,
        text: message,
      });
      console.log(`Email sent to ${recipientContact}`);
    } else if (channel === NotificationChannel.SMS) {
      // Mock SMS
      console.log(`[MOCK SMS] To: ${recipientContact} | Message: ${message}`);
    }

    notification.status = NotificationStatus.SENT;
    await notification.save();
    
    return true;
  } catch (error) {
    console.error('Notification failed:', error);
    return false;
  }
};
