import mongoose, { Schema, Document } from 'mongoose';

export enum Role {
  CITIZEN = 'CITIZEN',
  OFFICER = 'OFFICER',
  CONTROL_ROOM = 'CONTROL_ROOM',
  AUTHORITY = 'AUTHORITY',
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: Role;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), required: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true, discriminatorKey: 'role' }
);

export const User = mongoose.model<IUser>('User', userSchema);

// Discriminators

// 1. Citizen
export interface ICitizen extends IUser {
  govtIdType: 'AADHAAR' | 'PAN' | 'PASSPORT';
  govtIdNumber: string;
  govtIdVerified: boolean;
  trustedContacts: string[];
}

const citizenSchema = new Schema({
  govtIdType: { type: String, enum: ['AADHAAR', 'PAN', 'PASSPORT'] },
  govtIdNumber: { type: String },
  govtIdVerified: { type: Boolean, default: false },
  trustedContacts: [{ type: String }],
});

export const Citizen = User.discriminator<ICitizen>(Role.CITIZEN, citizenSchema);

// 2. Officer
export interface IOfficer extends IUser {
  badgeNumber: string;
  stationId: mongoose.Types.ObjectId;
  status: 'AVAILABLE' | 'DISPATCHED' | 'ON_SCENE' | 'OFF_DUTY';
  currentLocation: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

const officerSchema = new Schema({
  badgeNumber: { type: String, required: true, unique: true, sparse: true },
  stationId: { type: Schema.Types.ObjectId, ref: 'Station' },
  status: { type: String, enum: ['AVAILABLE', 'DISPATCHED', 'ON_SCENE', 'OFF_DUTY'], default: 'AVAILABLE' },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
});
officerSchema.index({ currentLocation: '2dsphere' });

export const Officer = User.discriminator<IOfficer>(Role.OFFICER, officerSchema);

// 3. Control Room Operator
export interface IControlRoomOperator extends IUser {
  zoneId: string;
}

const controlRoomOperatorSchema = new Schema({
  zoneId: { type: String },
});

export const ControlRoomOperator = User.discriminator<IControlRoomOperator>(Role.CONTROL_ROOM, controlRoomOperatorSchema);

// 4. Authority
export interface IAuthority extends IUser {
  level: 'STATE' | 'DISTRICT';
  jurisdiction: string;
}

const authoritySchema = new Schema({
  level: { type: String, enum: ['STATE', 'DISTRICT'] },
  jurisdiction: { type: String },
});

export const Authority = User.discriminator<IAuthority>(Role.AUTHORITY, authoritySchema);
