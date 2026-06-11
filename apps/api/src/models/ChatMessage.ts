import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  roomId: string; // Typically caseId or incidentId
  senderId: mongoose.Types.ObjectId;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'LOCATION';
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const chatMessageSchema = new Schema(
  {
    roomId: { type: String, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    messageType: { type: String, enum: ['TEXT', 'IMAGE', 'LOCATION'], default: 'TEXT' },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: { updatedAt: false } }
);

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
