import { Document } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  email?: string;
  password?: string | null;
  profilePic?: string;
  role?: string;
}
