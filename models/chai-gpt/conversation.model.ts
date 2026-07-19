import mongoose, { Document, models, Schema } from "mongoose";

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId; 
  title: string;
  model?: string;
  systemPrompt?: string;
  isPinned: boolean;
  isArchived: boolean;

  parentConversationId?: mongoose.Types.ObjectId;
  branchedFromMessageId?: mongoose.Types.ObjectId;
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
      index: true, 
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
    // Phase 2: Branching Tracking
    parentConversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },
    branchedFromMessageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
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
conversationSchema.index({ userId: 1, isArchived: 1, lastMessageAt: -1 });
conversationSchema.index({ userId: 1, isPinned: 1, lastMessageAt: -1 });

// Phase 2: Quickly find all branches belonging to a specific parent chat
conversationSchema.index({ parentConversationId: 1 });

const Conversation = models?.Conversation || mongoose.model<IConversation>("Conversation", conversationSchema);
export default Conversation;