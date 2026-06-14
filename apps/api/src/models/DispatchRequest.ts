import mongoose, { Schema, Document } from 'mongoose';

export enum DispatchStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EN_ROUTE = 'EN_ROUTE',
  ON_SCENE = 'ON_SCENE',
  COMPLETED = 'COMPLETED',
}

export interface IDispatchRequest extends Document {
  incidentId: mongoose.Types.ObjectId;
  unitId: mongoose.Types.ObjectId; // Reference to Officer, Ambulance, or FireStation
  unitType: 'POLICE' | 'AMBULANCE' | 'FIRE' | 'MEDICAL';
  status: DispatchStatus;
  etaMinutes?: number;
  acceptedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const dispatchRequestSchema = new Schema(
  {
    incidentId: { type: Schema.Types.ObjectId, ref: 'Incident', required: true, index: true },
    unitId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // Using User for Officer for now
    unitType: { type: String, enum: ['POLICE', 'AMBULANCE', 'FIRE', 'MEDICAL'], required: true },
    status: { type: String, enum: Object.values(DispatchStatus), default: DispatchStatus.PENDING },
    etaMinutes: { type: Number },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const DispatchRequest = mongoose.model<IDispatchRequest>('DispatchRequest', dispatchRequestSchema);
