"use server";

import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/conversation.model";
import Message from "@/models/message.model";
import { getMongoUserId } from "@/lib/helpers/auth"; 

export async function createNewChat(firstMessageContent: string) {
  try {
    // 1. Get the authenticated Mongo User ID
    const mongoUserId = await getMongoUserId();

    await dbConnect();

    // 2. Create a new Conversation
    const newChat = await Conversation.create({
      userId: mongoUserId,
      title: firstMessageContent.substring(0, 40) + "...", 
      model: "gpt-4o",
    });

    // 3. Save the user's first message
    await Message.create({
      conversationId: newChat._id,
      role: "USER",
      content: firstMessageContent,
      status: "COMPLETE",
    });

    return { success: true, chatId: newChat._id.toString() };
  } catch (error) {
    console.error("Error creating chat:", error);
    return { success: false, error: "Failed to create chat" };
  }
}