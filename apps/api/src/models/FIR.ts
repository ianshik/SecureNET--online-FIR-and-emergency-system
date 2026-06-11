import mongoose, { Schema, Document } from 'mongoose';

export enum FIRStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  FINALIZED = 'FINALIZED',
  COURT_SUBMITTED = 'COURT_SUBMITTED',
}

export interface IFIR extends Document {
  firNumber: string; // Format: FIR/STATE/YYYY/NNNNNN
  complaintId: mongoose.Types.ObjectId;
  complainantId: mongoose.Types.ObjectId;
  accusedDetails: string;
  incidentDetails: string;
  witnesses: string[];
  evidenceIds: mongoose.Types.ObjectId[];
  officerRemarks: string;
  draftedBy: mongoose.Types.ObjectId;
  status: FIRStatus;
  digitalSignature?: string; // Hash of officer badge + timestamp
  amendments: {
    amendedBy: mongoose.Types.ObjectId;
    timestamp: Date;
    changes: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const firSchema = new Schema(
  {
    firNumber: { type: String, required: true, unique: true, index: true },
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true },
    complainantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    accusedDetails: { type: String, default: '' },
    incidentDetails: { type: String, required: true },
    witnesses: [{ type: String }],
    evidenceIds: [{ type: Schema.Types.ObjectId, ref: 'Evidence' }],
    officerRemarks: { type: String, default: '' },
    draftedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(FIRStatus), default: FIRStatus.DRAFT },
    digitalSignature: { type: String },
    amendments: [
      {
        amendedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        changes: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const FIR = mongoose.model<IFIR>('FIR', firSchema);
