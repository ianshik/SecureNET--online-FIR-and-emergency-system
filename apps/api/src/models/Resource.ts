import mongoose, { Schema, Document } from 'mongoose';

export interface IStation extends Document {
  name: string;
  type: 'POLICE' | 'FIRE';
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  coverageRadiusKm: number;
  availableUnits: number;
}

const stationSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['POLICE', 'FIRE'], required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    coverageRadiusKm: { type: Number, default: 10 },
    availableUnits: { type: Number, default: 0 },
  },
  { timestamps: true }
);

stationSchema.index({ location: '2dsphere' });
export const Station = mongoose.model<IStation>('Station', stationSchema);

export interface IAmbulance extends Document {
  licensePlate: string;
  status: 'AVAILABLE' | 'DISPATCHED' | 'ON_SCENE';
  currentLocation: {
    type: 'Point';
    coordinates: [number, number];
  };
  assignedTo?: mongoose.Types.ObjectId; // Incident
}

const ambulanceSchema = new Schema(
  {
    licensePlate: { type: String, required: true, unique: true },
    status: { type: String, enum: ['AVAILABLE', 'DISPATCHED', 'ON_SCENE'], default: 'AVAILABLE' },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Incident' },
  },
  { timestamps: true }
);

ambulanceSchema.index({ currentLocation: '2dsphere' });
export const Ambulance = mongoose.model<IAmbulance>('Ambulance', ambulanceSchema);
