import { NextResponse } from "next/server";
import { z } from "zod";
import { Agent, run } from "@openai/agents";

const RiskSchema = z.object({
  isValidScenario: z
    .boolean()
    .describe(
      "True if prompt describes a business/tech scenario. False if it's a greeting, joke, or unrelated.",
    ),
  agentMessage: z
    .string()
    .optional()
    .describe(
      "If isValidScenario is false, provide a crisp, slightly sharp rejection message here.",
    ),
  overallRisk: z.enum(["None", "Low", "Medium", "High"]),

  risks: z
    .array(
      z.object({
        description: z.string(),
        likelihood: z.enum(["Low", "Medium", "High"]),
        impact: z.enum(["Low", "Medium", "High"]),
        recommendation: z.string(),
      }),
    )
    .optional(), // Ab yeh array optional ho gaya hai if invalid

  summary: z.string(),
});

// --- 2. Upgraded System Prompt (The Gatekeeper) ---
const SystemPrompt = `
You are an elite, highly focused Risk Analyst AI.

CRITICAL INSTRUCTION - INPUT VALIDATION:
Your FIRST job is to determine if the user's prompt is a valid business, technical, or operational scenario requiring risk analysis.

- IF INVALID (e.g., greetings like "hello", jokes, essays, or unrelated questions):
  1. Set 'isValidScenario' to false.
  2. Set 'agentMessage' to a crisp, professional, but slightly blunt rejection. (e.g., "I am a specialized Risk Analyzer, not a casual chatbot. Please provide a concrete project, tech migration, or business scenario to evaluate.")
  3. Set 'overallRisk' to "None" and 'summary' to empty string. Leave 'risks' empty.

- IF VALID SCENARIO:
  1. Set 'isValidScenario' to true.
  2. OMIT 'agentMessage' entirely.
  3. Identify potential risks clearly.
  4. Assess likelihood and impact.
  5. Provide actionable recommendations.
  6. The Risks Description and Recommendations should be crisp and concise.
`;

const AgentGPT4o = new Agent({
  name: "GPT-4o Agent",
  instructions: SystemPrompt,
  model: "gpt-4o",
  outputType: RiskSchema,
});

const AgentGPT4oMini = new Agent({
  name: "GPT-4o-Mini Agent",
  instructions: SystemPrompt,
  model: "gpt-4o-mini",
  outputType: RiskSchema,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    // console.log("=============================================");
    // console.log("Received message:", message);

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const [result4o, resultMini] = await Promise.all([
      run(AgentGPT4o, message), // run is function provided by openai/agents sdk
      run(AgentGPT4oMini, message),
    ]);

    const parsed4o = result4o.activeAgent?.outputType.parse(
      result4o.finalOutput,
    );
    const parsedMini = resultMini.activeAgent?.outputType.parse(
      resultMini.finalOutput,
    );

    if (parsed4o === undefined || parsedMini === undefined) {
      console.error("Parsing failed for one of the agents.");
      return NextResponse.json(
        { error: "Failed to parse agent output" },
        { status: 500 },
      );
    }

    // console.log("\n\n=============================================\n");
    // console.log("GPT-4o Output:", parsed4o);
    // console.log("\n\n=============================================\n");
    // console.log("GPT-4o-Mini Output:", parsedMini);

    return NextResponse.json({
      gpt4o: parsed4o,
      gpt4oMini: parsedMini,
    });
  } catch (error) {
    console.error("Risk API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate risk analysis" },
      { status: 500 },
    );
  }
}
