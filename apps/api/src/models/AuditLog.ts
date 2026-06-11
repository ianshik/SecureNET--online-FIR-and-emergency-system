import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId?: string;
  diff?: any;
  ipAddress: string;
  timestamp: Date;
}

const auditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String },
    diff: { type: Schema.Types.Mixed },
    ipAddress: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timeseries: {
      timeField: 'timestamp',
      metaField: 'resourceType',
      granularity: 'seconds',
    },
    expires: '7y', // Retention policy for audit logs
  }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
