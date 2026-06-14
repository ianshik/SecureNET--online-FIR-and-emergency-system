import mongoose, { Schema, Document } from 'mongoose';

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
  SOS_SENT = 'SOS_SENT',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  UNIT_DISPATCHED = 'UNIT_DISPATCHED',
  UNIT_EN_ROUTE = 'UNIT_EN_ROUTE',
  UNIT_ON_SCENE = 'UNIT_ON_SCENE',
  RESOLVED = 'RESOLVED',
  FALSE_ALARM = 'FALSE_ALARM',
}

export interface IIncident extends Document {
  citizenId: mongoose.Types.ObjectId;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  servicesRequired: ('POLICE' | 'AMBULANCE' | 'FIRE' | 'MEDICAL')[];
  severity: IncidentSeverity;
  status: IncidentStatus;
  dispatchedUnits: mongoose.Types.ObjectId[]; // References to DispatchRequest
  createdAt: Date;
  updatedAt: Date;
}

const incidentSchema = new Schema(
  {
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    servicesRequired: [{ type: String, enum: ['POLICE', 'AMBULANCE', 'FIRE', 'MEDICAL'] }],
    severity: { type: String, enum: Object.values(IncidentSeverity), default: IncidentSeverity.HIGH },
    status: { type: String, enum: Object.values(IncidentStatus), default: IncidentStatus.SOS_SENT, index: true },
    dispatchedUnits: [{ type: Schema.Types.ObjectId, ref: 'DispatchRequest' }],
  },
  { timestamps: true }
);

incidentSchema.index({ location: '2dsphere' });

export const Incident = mongoose.model<IIncident>('Incident', incidentSchema);
