// /models/conversation.model.ts
import mongoose, { Document, models, Schema } from "mongoose";


export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId; 
  title: string;
  model?: string;
  systemPrompt?: string;
  isPinned: boolean;
  isArchived: boolean;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Foreign key lookup fast karne ke liye
    },
    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },
    model: {
      type: String,
      default: null,
    },
    systemPrompt: {
      type: String,
      default: null,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// --- Scalability & Query Performance Indexes ---
// 1. Sidebar/Chat List Fetching query optimized (Get active, unarchived chats first)
conversationSchema.index({ userId: 1, isArchived: 1, lastMessageAt: -1 });

// 2. Pinned chats lookup query optimized
conversationSchema.index({ userId: 1, isPinned: 1, lastMessageAt: -1 });

const Conversation = models?.Conversation || mongoose.model<IConversation>("Conversation", conversationSchema);
export default Conversation;