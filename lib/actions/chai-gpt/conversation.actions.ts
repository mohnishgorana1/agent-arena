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

      console.log("new conv", newConversation._id)

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
  console.log("adding new msg to chat")
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
    console.log("new msg aadded", newMessage._id)
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

    const messages = dbMessages.map((msg: any) => ({
      id: msg._id.toString(),
      role: msg.role.toLowerCase(), 
      content: msg.content,
    }));

    // ✨ UPDATE: Yahan title bhi return karna hai
    return { success: true, messages, title: conversation.title };
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


// 7. Delete a conversation and ALL its messages
export async function deleteChatAction(chatId: string) {
  try {
    await dbConnect();
    const mongoUserId = await getMongoUserId();
    
    if (!mongoUserId) return { success: false, error: "Unauthorized" };

    // Pehle check karo ki chat exist karti hai aur isi user ki hai
    const conversation = await Conversation.findOne({ _id: chatId, userId: mongoUserId });
    if (!conversation) return { success: false, error: "Chat not found or unauthorized" };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Delete all messages associated with this chat
      await Message.deleteMany({ conversationId: chatId }, { session });
      
      // 2. Delete the actual conversation document
      await Conversation.deleteOne({ _id: chatId }, { session });

      await session.commitTransaction();
      session.endSession();

      return { success: true };
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }
  } catch (error: any) {
    console.error("Delete chat error:", error);
    return { success: false, error: error.message };
  }
}


// 8. branching
export async function branchChatAction(oldChatId: string, messageIdToBranchFrom: string) {
  try {
    await dbConnect();
    const mongoUserId = await getMongoUserId();
    if (!mongoUserId) return { success: false, error: "Unauthorized" };

    // 1. Original conversation find karo
    const oldConversation = await Conversation.findOne({ _id: oldChatId, userId: mongoUserId });
    if (!oldConversation) return { success: false, error: "Original chat not found" };

    // 2. Jis message se branch karna hai, usey find karo
    const branchMessage = await Message.findById(messageIdToBranchFrom);
    if (!branchMessage) return { success: false, error: "Message not found" };

    // 3. Branching point tak ke saare messages fetch karo (Chronological order me)
    const messagesToCopy = await Message.find({
      conversationId: oldChatId,
      createdAt: { $lte: branchMessage.createdAt } // Is time tak ke saare messages
    }).sort({ createdAt: 1 }).lean();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 4. Ek nayi conversation (Branch) create karo
      const [newConversation] = await Conversation.create(
        [{ 
          userId: mongoUserId, 
          title: `${oldConversation.title} (Branch)`, 
          model: oldConversation.model,
          parentConversationId: oldChatId, // Tracking original chat
          branchedFromMessageId: messageIdToBranchFrom // Tracking branch point
        }],
        { session }
      );

      // 5. Purane messages ko naye chat id ke sath clone karo
      const clonedMessages = messagesToCopy.map((msg: any) => ({
        conversationId: newConversation._id,
        role: msg.role,
        content: msg.content,
        parts: msg.parts,
        status: msg.status,
        createdAt: msg.createdAt, // Original timeline maintain karne ke liye
      }));

      await Message.insertMany(clonedMessages, { session });

      await session.commitTransaction();
      session.endSession();

      return { success: true, newChatId: newConversation._id.toString() };
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }
  } catch (error: any) {
    console.error("Branching error:", error);
    return { success: false, error: error.message };
  }
}