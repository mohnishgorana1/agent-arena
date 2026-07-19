# 🏟️ Agent Arena

Agent Arena is a robust, multi-module GenAI ecosystem built to demonstrate advanced AI orchestration, tool calling, and conversation management. It currently features two core modules: **Consensus** (A Self-Consistency Answer Engine) and **Chai-GPT** (A production-grade intelligent chat interface).

🔗 **Live Demo:** [https://agent-arena-mg.vercel.app/](https://agent-arena-mg.vercel.app/)

---

## 🧩 Module 1: Chai-GPT (Advanced AI Chat)

Chai-GPT is a powerful chat interface engineered to mimic modern AI products by incorporating external tool execution, custom data streaming, and complex conversation state management.

### ✨ Key Features
*   **Real-Time Web Search (AI Tools):** Integrated with the Tavily API, the model can dynamically decide to search the web for up-to-date information. Includes a custom asynchronous stream parser to display real-time "Searching web..." UI badges before streaming the final synthesized text.
*   **Conversation Branching (Time-Travel):** Users can branch out from any previous message in the chat history. The backend securely clones the context up to the branching point into a new MongoDB document, allowing users to explore parallel conversation timelines without losing their original chat.
*   **Developer-Grade UI:** Fully responsive chat interface featuring Markdown support, GitHub Flavored Markdown (GFM), and a custom `react-syntax-highlighter` implementation that renders code blocks with a VS Code Dark theme and functional "Copy Code" buttons.
*   **Database Persistence:** Robust tracking of pinned chats, archived states, and complex branching hierarchies using MongoDB and Mongoose.

---

## 🧩 Module 2: Consensus (Self-Consistency Engine)

Consensus is designed to deliver highly refined and accurate answers by leveraging the self-consistency technique across multiple top-tier LLMs.

### 📖 How It Works
Instead of relying on a single AI model's output, Consensus orchestrates a multi-model evaluation workflow:
1.  **User Prompt:** The user inputs a query via the UI.
2.  **Parallel Generation:** The prompt is simultaneously dispatched to multiple leading LLMs (OpenAI, Claude, and Gemini) using `Promise.all` for speed.
3.  **Aggregation:** The system collects the diverse responses from all models.
4.  **Evaluation & Synthesis:** A final evaluator model (Claude) acts as an impartial judge. It cross-references facts, discards hallucinations, and synthesizes the strongest arguments into a single, superior final answer.
5.  **Display:** The user sees individual model responses alongside the final synthesized output, complete with loading states.

---

## 🛠️ Technical Details

*   **Framework:** Next.js (App Router), React, Server Actions
*   **Language:** TypeScript
*   **Styling & UI:** Tailwind CSS, Framer Motion, Lucide Icons
*   **Database:** MongoDB (Mongoose)
*   **AI Architecture:** `@openai/agents`, Custom Async Generators for UI Streaming
*   **AI Providers & Tools:** 
    *   OpenAI (GPT-4o-mini)
    *   Anthropic (Claude 3.5 Sonnet)
    *   Google (Gemini 1.5 Pro)
    *   Tavily (Real-time Web Search API)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-link>
cd agent-arena
2. Install dependencies
Bash
npm install

3. Set up environment variables
Create a .env.local file in the root directory and add the following keys:

Code snippet
# AI Providers
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key

# Tools & Database
TAVILY_API_KEY=your_tavily_key
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
4. Run the development server
Bash
npm run dev
