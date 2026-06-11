import mongoose, { Schema, Document } from 'mongoose';

export enum ComplaintType {
  CIVIL = 'CIVIL',
  CRIMINAL = 'CRIMINAL',
  CYBER_CRIME = 'CYBER_CRIME',
  MISSING_PERSON = 'MISSING_PERSON',
  TRAFFIC = 'TRAFFIC',
  WOMEN_SAFETY = 'WOMEN_SAFETY',
  CHILD_SAFETY = 'CHILD_SAFETY',
  DOMESTIC_VIOLENCE = 'DOMESTIC_VIOLENCE',
}

export enum ComplaintStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface IComplaint extends Document {
  citizenId: mongoose.Types.ObjectId;
  type: ComplaintType;
  title: string;
  description: string;
  incidentDate: Date;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  priority: Priority;
  status: ComplaintStatus;
  assignedOfficerId?: mongoose.Types.ObjectId;
  evidenceUrls: string[];
  timeline: {
    status: ComplaintStatus;
    updatedBy: mongoose.Types.ObjectId;
    timestamp: Date;
    remarks?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema(
  {
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: Object.values(ComplaintType), required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    incidentDate: { type: Date, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
      address: { type: String },
    },
    priority: { type: String, enum: Object.values(Priority), default: Priority.LOW },
    status: { type: String, enum: Object.values(ComplaintStatus), default: ComplaintStatus.SUBMITTED, index: true },
    assignedOfficerId: { type: Schema.Types.ObjectId, ref: 'User' },
    evidenceUrls: [{ type: String }],
    timeline: [
      {
        status: { type: String, enum: Object.values(ComplaintStatus) },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        remarks: { type: String },
      },
    ],
  },
  { timestamps: true }
);

complaintSchema.index({ location: '2dsphere' });

export const Complaint = mongoose.model<IComplaint>('Complaint', complaintSchema);
