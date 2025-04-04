import { Document, model, Schema } from 'mongoose';

export interface IUser extends Document {
	email: string;
	type: "user" | "farmer";
	userName: string;
	location: string;
	createdAt: Date;
	password: string;
}

const userSchema: Schema = new Schema({
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  profileImage: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['client', 'farmer'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
  }
});

export default model<IUser>('User', userSchema);