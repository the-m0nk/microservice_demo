import { Schema, model, Document } from "mongoose";

interface postDocument extends Document {
  content: string;
  userId: string;
  image: string;
  like: string[];
  tags: [];
  createdAt: Date;
}

const postSchema = new Schema<postDocument>({
  content: {
    type: String,
  },
  userId: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  like: {
    type: [String],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postModel = model<postDocument>("post", postSchema);

export { postModel, postDocument };
