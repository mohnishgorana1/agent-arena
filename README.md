# 🏟️ Agent Arena: Consensus (Self-Consistency Answer Engine)

**Consensus** is a core module within the **Agent Arena** ecosystem (alongside *Risk Analyser* and *Chai-GPT*). It is a GenAI-powered application designed to deliver highly refined and accurate answers by leveraging the **self-consistency technique**.

## 🔗 Live Demo
**Live Deployed Project:** [https://agent-arena-mg.vercel.app/](https://agent-arena-mg.vercel.app/)

## 📖 How It Works
Instead of relying on a single AI model's output, Consensus orchestrates a multi-model evaluation workflow:
1. **User Prompt:** The user inputs a query via the UI.
2. **Parallel Generation:** The prompt is simultaneously dispatched to multiple leading LLMs (OpenAI, Claude, and Gemini).
3. **Aggregation:** The system collects the diverse responses from all models.
4. **Evaluation & Synthesis:** A final evaluator model (Claude) analyzes the aggregated responses, identifies the strongest arguments/facts, and synthesizes them into a single, superior final answer.
5. **Display:** The user is presented with the individual model responses as well as the final synthesized output, complete with loading states and error handling.

## 🛠️ Technical Details
* **Project Type:** UI-based Web Application
* **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion
* **AI Providers Used:** 
  * OpenAI (GPT-series)
  * Anthropic (Claude 3.5 Sonnet) - *Used for both initial response and Final Evaluation*
  * Google (Gemini 1.5 Pro)

## 🔄 The Self-Consistency Flow Implementation
The orchestration is handled through asynchronous API calls using `Promise.all` to fetch responses from OpenAI, Gemini, and Claude concurrently. Once all promises resolve, the raw outputs are concatenated and passed into a specialized synthesis prompt directed at Claude. This prompt specifically instructs the model to act as an impartial judge, cross-reference the facts, discard hallucinations, and output a structured, refined final response. 

## 🚀 Quick Start
```bash
# Clone the repository
git clone <your-repo-link>

# Navigate to the project directory
cd agent-arena

# Install dependencies
npm install

# Set up environment variables (.env.local)
# OPENAI_API_KEY=...
# ANTHROPIC_API_KEY=...
# GEMINI_API_KEY=...

# Run the development server
npm run dev
```