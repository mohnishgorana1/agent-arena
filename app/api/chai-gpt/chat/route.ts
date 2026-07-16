import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/chai-gpt/conversation.model";
import Message from "@/models/chai-gpt/message.model";
import { getMongoUserId } from "@/lib/helpers/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();

    // Get the authenticated user's MongoDB ObjectId
    const mongoUserId = await getMongoUserId();
    if (!mongoUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    // Chat ka title generate karte hain (First 4 words of the message)
    const title = content.split(" ").slice(0, 4).join(" ") + "...";

    // 🚀 Start MongoDB Session & Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Create a new Conversation
      // Transaction me .create() array expect karta hai
      const [newConversation] = await Conversation.create(
        [
          {
            userId: mongoUserId,
            title: title,
            model: "chai-gpt",
          },
        ],
        { session }
      );

      // 2. Create the initial User Message linked to the new Conversation
      await Message.create(
        [
          {
            conversationId: newConversation._id,
            role: "USER",
            content: content,
            status: "COMPLETE",
          },
        ],
        { session }
      );

      // Agar dono operation successful rahe, toh commit karo
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json(
        {
          success: true,
          chatId: newConversation._id, // Return actual MongoDB ObjectId
        },
        { status: 201 }
      );
    } catch (transactionError) {
      // Agar kuch bhi fail hua, toh dono operations revert ho jayenge
      await session.abortTransaction();
      session.endSession();
      throw transactionError; // Catch block catch karega
    }
  } catch (error) {
    console.error("Failed to create chat:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}