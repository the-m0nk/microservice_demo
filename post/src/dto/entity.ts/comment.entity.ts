import { Schema, model, Document, Types } from "mongoose";

interface ReplyDocument extends Document {
  comment: string;
  userId: string;
  createdAt: Date;
}

const replySchema = new Schema<ReplyDocument>({
  comment: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

interface CommentDocument extends Document {
  comment: string;
  userId: string;
  postId: string;
  replies: Types.DocumentArray<ReplyDocument>;
  createdAt: Date;
}

const commentSchema = new Schema<CommentDocument>({
  comment: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
  replies: {
    type: [replySchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CommentModel = model<CommentDocument>("Comment", commentSchema);

export { CommentModel, CommentDocument, ReplyDocument };
