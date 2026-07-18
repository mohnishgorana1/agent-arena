"use server";

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/chai-gpt/message.model";
import Conversation from "@/models/chai-gpt/conversation.model";

export async function generateChatResponseAction(chatId: string, messages: any[]) {
  console.log("generating chat response")
  
  console.log("++++++++++++\messags\n", messages, "\n+++++++++++++++")

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: "You are Chai GPT, a highly skilled Full-Stack Web Developer expert in MERN and Next.js architectures. Provide clean, production-ready code and explain serverless concepts simply.",
    messages: messages,
    async onFinish({ text }) {
      try {
        await dbConnect();
        
        await Message.create({
          conversationId: chatId,
          role: "ASSISTANT",
          content: text,
          status: "COMPLETE",
        });

        await Conversation.findByIdAndUpdate(chatId, {
          lastMessageAt: new Date(),
        });
      } catch (error) {
        console.error("Failed to save AI response to DB:", error);
      }
    },
  });


  console.log("result", result.textStream);
  return result.textStream;
}





// alright see how sluggy the app is 


// sabse phle to mene new chat me gya or msg type krkr send kra 
// jese hi send kra url me change dikha lekin sidebar me koi halchal nhi or backend me jese hi conversation doc bana hoga sidebar me dikh gya lekin chat interaface me kuch nhi dikha fir or der baad mene sidebar pr click kra tab jakr llm ka response dikha lekin mere send msg tab bhi nhi dikha 
// or fir jab page reload kra tab jakr sare msgs dikhe 


// note : abhi mujhe response ke format par koi load nhi h