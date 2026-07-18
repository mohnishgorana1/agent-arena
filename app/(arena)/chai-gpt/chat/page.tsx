import ChatInterface from "@/components/chai-gpt/ChatInterface";
import LockedState from "@/components/LockedState";


export const metadata = {
  title: "Chai GPT | Agent Arena",
};

// TODO: Change later
const IS_LOCKED = true;


export default function ChaiGPTPage() {
  if (IS_LOCKED) {
    return <LockedState moduleName="Chai GPT" />;
  }
  return <ChatInterface />;
}