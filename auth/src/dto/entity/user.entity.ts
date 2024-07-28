import { Schema, model, Document } from 'mongoose';

interface UserDocument extends Document {
  email: string;
  password: string;
  name: string;
  followers: string[];
  following: string[];
  phoneNumber: string;
}

const UserSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  followers: {
    type: [String],
    default: [],
  },
  following: {
    type: [String],
    default: [],
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
});

const UserModel = model<UserDocument>('User', UserSchema);

export { UserModel, UserDocument };
