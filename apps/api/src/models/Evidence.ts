import mongoose, { Schema, Document } from 'mongoose';

export interface IEvidence extends Document {
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Key: string;
  s3Url: string;
  uploadedBy: mongoose.Types.ObjectId;
  complaintId?: mongoose.Types.ObjectId;
  incidentId?: mongoose.Types.ObjectId;
  firId?: mongoose.Types.ObjectId;
  chainOfCustody: {
    actorId: mongoose.Types.ObjectId;
    action: 'UPLOADED' | 'VIEWED' | 'DOWNLOADED';
    timestamp: Date;
    ipAddress: string;
  }[];
  isDeleted: boolean; // Soft delete flag
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const evidenceSchema = new Schema(
  {
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    s3Key: { type: String, required: true },
    s3Url: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    incidentId: { type: Schema.Types.ObjectId, ref: 'Incident' },
    firId: { type: Schema.Types.ObjectId, ref: 'FIR' },
    chainOfCustody: [
      {
        actorId: { type: Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, enum: ['UPLOADED', 'VIEWED', 'DOWNLOADED'] },
        timestamp: { type: Date, default: Date.now },
        ipAddress: { type: String },
      },
    ],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export const Evidence = mongoose.model<IEvidence>('Evidence', evidenceSchema);
