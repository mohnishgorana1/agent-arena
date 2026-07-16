// /models/message.model.ts

import mongoose, { Document, models, Schema, Types } from "mongoose";

export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM" | "TOOL";
export type MessageStatus = "PENDING" | "COMPLETE" | "ERROR";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  role: MessageRole;
  status: MessageStatus;
  content: string;
  parts: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "ASSISTANT", "SYSTEM", "TOOL"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETE", "ERROR"],
      default: "COMPLETE",
    },
    content: {
      type: String,
      required: true,
    },
    parts: {
      type: Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// --- Scalability & Query Performance Index ---
// Chat History load karte waqt pure messages conversationId aur time ke basis par sort hote hain
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message =
  models?.Message || mongoose.model<IMessage>("Message", messageSchema);
export default Message;
