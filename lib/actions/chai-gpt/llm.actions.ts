"use server";

import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/chai-gpt/message.model";
import Conversation from "@/models/chai-gpt/conversation.model";

// 1. Web Search Tool (Tavily)
const tavilyTool = tool({
  name: "tavily_search",
  description:
    "Search the internet for real-time information and factual updates.",
  parameters: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    console.log(`🔍 Tavily Search -> ${query}`);
    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: query || "latest technology news",
          search_depth: "advanced",
          include_answer: false,
          max_results: 3,
        }),
      });
      if (!response.ok) return { error: `Tavily API Error ${response.status}` };
      const json = await response.json();
      return json.results.map((res: any) => ({
        title: res.title,
        url: res.url,
        content: res.content,
      }));
    } catch (err) {
      console.error("Tavily Error:", err);
      return { error: "Failed to fetch information." };
    }
  },
});

// 2. Define the Chai GPT Agent
const chaiGptAgent = new Agent({
  name: "ChaiGPT",
  model: "gpt-4o-mini",
  instructions:
    "You are Chai GPT, a highly skilled Full-Stack Web Developer expert in MERN and Next.js architectures. Provide clean, production-ready code. Focus on direct, highly accurate, and practical solutions. If web search is available, use it for real-time accurate answers.",
});

export async function generateChatResponseAction(
  chatId: string,
  messages: any[],
  useWebSearch: boolean = false,
) {
  console.log(
    "Generating response via @openai/agents. Web Search:",
    useWebSearch,
  );

  // Formatting history for the agent context
  const historyContext = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");
  const input = `CONVERSATION HISTORY:\n${historyContext}\n\nRespond to the last user message as ASSISTANT:`;

  // Custom Async Generator to handle streaming manually
  async function* streamGenerator() {
    try {
      // If web search is active, emit a tool-call event to UI
      if (useWebSearch) {
        yield JSON.stringify({
          type: "tool-call",
          toolName: "tavily_search",
          query: "Searching the web...",
        });
        chaiGptAgent.tools = [tavilyTool];
      } else {
        chaiGptAgent.tools = [];
      }

      // Execute the agent (This waits for the agent to finish thinking and searching)
      const result = await run(chaiGptAgent, input);
      const finalOutput =
        result.finalOutput || "I couldn't generate a response.";

      // Emit tool-result to turn off loading spinner in UI
      if (useWebSearch) {
        yield JSON.stringify({ type: "tool-result" });
      }

      // Fake streaming the text output for a smooth UI typing effect (REPLACE THIS SECTION)
      const chunkSize = 15; // characters per chunk
      for (let i = 0; i < finalOutput.length; i += chunkSize) {
        const chunk = finalOutput.slice(i, i + chunkSize);
        yield JSON.stringify({ type: "text-delta", textDelta: chunk });
        await new Promise((resolve) => setTimeout(resolve, 10)); // 10ms delay per chunk
      }


      // Save final result to DB
      await dbConnect();
      const savedAiMsg = await Message.create({
        conversationId: chatId,
        role: "ASSISTANT",
        content: finalOutput,
        status: "COMPLETE",
      });
      await Conversation.findByIdAndUpdate(chatId, { lastMessageAt: new Date() });

      yield JSON.stringify({ type: 'message-id', id: savedAiMsg._id.toString() });

    } catch (error: any) {
      console.error("Agent Execution Error:", error);
      yield JSON.stringify({ type: 'text-delta', textDelta: "Error generating response." });
    }
  }

  return streamGenerator();
}