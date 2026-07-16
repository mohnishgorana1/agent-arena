"use server";

import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/chai-gpt/conversation.model";
import Message from "@/models/chai-gpt/message.model";
import { getMongoUserId } from "@/lib/helpers/auth";

// 1. Create a fresh chat with the first message
export async function createNewChatAction(content: string) {
  try {
    await dbConnect();
    const mongoUserId = await getMongoUserId();
    
    if (!mongoUserId) {
      return { success: false, error: "Unauthorized" };
    }

    const title = content.split(" ").slice(0, 4).join(" ") + "...";
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [newConversation] = await Conversation.create(
        [{ userId: mongoUserId, title: title, model: "chai-gpt" }],
        { session }
      );

      await Message.create(
        [{ conversationId: newConversation._id, role: "USER", content: content, status: "COMPLETE" }],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return { success: true, chatId: newConversation._id.toString() };
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }
  } catch (error: any) {
    console.error("Failed to create chat:", error);
    return { success: false, error: error.message };
  }
}

// 2. Add a new user message to an existing chat
export async function addMessageToChatAction(chatId: string, content: string) {
  try {
    await dbConnect();
    const mongoUserId = await getMongoUserId();
    
    if (!mongoUserId) return { success: false, error: "Unauthorized" };

    const conversation = await Conversation.findOne({ _id: chatId, userId: mongoUserId });
    if (!conversation) return { success: false, error: "Chat not found or unauthorized" };

    const newMessage = await Message.create({
      conversationId: chatId,
      role: "USER",
      content: content,
      status: "COMPLETE",
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return { success: true, messageId: newMessage._id.toString() };
  } catch (error: any) {
    console.error("Failed to add message:", error);
    return { success: false, error: error.message };
  }
}

// 3. Fetch all messages for a specific chat (Used in Server Components)
export async function getChatMessagesAction(chatId: string) {
  try {
    await dbConnect();
    const mongoUserId = await getMongoUserId();
    
    if (!mongoUserId) return { success: false, error: "Unauthorized" };

    const conversation = await Conversation.findOne({ _id: chatId, userId: mongoUserId }).lean();
    if (!conversation) return { success: false, error: "Chat not found" };

    const dbMessages = await Message.find({ conversationId: chatId })
      .sort({ createdAt: 1 })
      .lean();

    // Serialize object for client component
    const messages = dbMessages.map((msg: any) => ({
      id: msg._id.toString(),
      role: msg.role.toLowerCase(), 
      content: msg.content,
    }));

    return { success: true, messages };
  } catch (error: any) {
    console.error("Fetch error:", error);
    return { success: false, error: error.message };
  }
}


// 4. Fetch all conversations for the sidebar
export async function getUserConversationsAction(model: string = "chai-gpt") {
  try {
    await dbConnect();
    const mongoUserId = await getMongoUserId();
    
    if (!mongoUserId) return { success: false, error: "Unauthorized" };

    // Sorted by pinned first, then by last message time
    const conversations = await Conversation.find({ userId: mongoUserId, model })
      .sort({ isPinned: -1, lastMessageAt: -1 }) 
      .select("_id title isPinned") // isPinned ko select list me add kiya
      .lean();

    const formatted = conversations.map((c: any) => ({
      id: c._id.toString(),
      title: c.title,
      isPinned: c.isPinned || false,
    }));

    return { success: true, conversations: formatted };
  } catch (error: any) {
    console.error("Fetch conversations error:", error);
    return { success: false, error: error.message };
  }
}

// 5. Rename a specific chat
export async function renameChatAction(chatId: string, newTitle: string) {
  try {
    await dbConnect();
    const mongoUserId = await getMongoUserId();
    
    if (!mongoUserId) return { success: false, error: "Unauthorized" };
    if (!newTitle.trim()) return { success: false, error: "Title cannot be empty" };

    const conversation = await Conversation.findOneAndUpdate(
      { _id: chatId, userId: mongoUserId },
      { title: newTitle.trim() },
      { new: true }
    );

    if (!conversation) return { success: false, error: "Chat not found or unauthorized" };

    return { success: true, title: conversation.title };
  } catch (error: any) {
    console.error("Rename chat error:", error);
    return { success: false, error: error.message };
  }
}

// 6. Toggle Pin status of a chat
export async function togglePinChatAction(chatId: string, isPinned: boolean) {
  try {
    await dbConnect();
    const mongoUserId = await getMongoUserId();
    
    if (!mongoUserId) return { success: false, error: "Unauthorized" };

    const conversation = await Conversation.findOneAndUpdate(
      { _id: chatId, userId: mongoUserId },
      { isPinned: isPinned },
      { new: true }
    );

    if (!conversation) return { success: false, error: "Chat not found or unauthorized" };

    return { success: true, isPinned: conversation.isPinned };
  } catch (error: any) {
    console.error("Toggle pin chat error:", error);
    return { success: false, error: error.message };
  }
}