import { redirect } from "next/navigation";
import ChatInterface from "@/components/chai-gpt/ChatInterface";
import { getChatMessagesAction } from "@/lib/actions/chai-gpt/conversation.actions";

export default async function ExistingChaiGPTChat({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;

  const result = await getChatMessagesAction(chatId);

  // Agar unauthorized hai ya chat exist nahi karti toh fallback karo
  if (!result.success || !result.messages) {
    redirect("/chai-gpt/chat");
  }

  return <ChatInterface chatId={chatId} initialMessages={result.messages} />;
}