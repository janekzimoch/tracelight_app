import { OpenAI } from "openai";
import dotenv from "dotenv";

import { AgentSpan, Milestone, TestResult, TestSample } from "@/app/dashboard/api/testSamples/route";
import { v4 as uuidv4 } from "uuid";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

export type TestResultData = {
  trace_id: string;
  milestone_id: string;
  result: TestResult;
};

interface InitialReference {
  agent_span_id: number;
  reference_text: string;
}

interface FeedbackItem {
  thought_process: string;
  pass: boolean;
  feedback_message: string;
  test_title: string;
  span_references: InitialReference[];
}

dotenv.config();

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey });
}
const openai = getOpenAIClient();
let openaiModel = "gpt-4o";

async function callOpenai(messages: ChatCompletionMessageParam[], json: boolean = false): Promise<string> {
  const response = await openai.chat.completions.create({
    model: openaiModel,
    messages: messages,
    max_tokens: 3000,
    response_format: { type: json ? "json_object" : "text" },
  });
  console.log("response:", response);
  const message = response.choices[0].message;
  if (message.content === null) {
    throw new Error("content is null");
  }
  return message.content as string;
}

function processTrace(spans: AgentSpan[]): { trace: string; idList: string[] } {
  const traceList: string[] = [];

  for (let index = 0; index < spans.length; index++) {
    const span = spans[index];
    const messages = span.messages
      .map((message) => `{type: ${message.type},\ncontent: ${message.content},\tool_use: ${JSON.stringify(message.tool_execution)}}`)
      .join(",\n");
    const spanTrace = `<${index}> - ${span.name}\n[${messages}]`;
    traceList.push(spanTrace);
  }

  const trace = traceList.join("\n\n");
  return { trace, idList: spans.map((span) => span.id) };
}

function processMilestones(milestones: Milestone[]): string {
  const milestoneString = milestones.map((m, index) => `${index}. ${m.text}`).join("\n");
  return milestoneString;
}

function getEvaluationMessages(userRequest: string, trace: string, milestones: string): ChatCompletionMessageParam[] {
  // 1. system prompt - decide what the agents is supposed to do and what ouptu is it supposed ot give
  // 2. user prompt - present variables and highlight your expectations

  const systemPrompt = `You are a useful assistant for evaluation of agentic traces. 
  
  Let me give you some context, the agentic trace you are about to see comes from a system where an autonomous agent performs soem arbitrary tasks (i.e. user request). That agent may do a planning step to break down problem into sub problesm and then will execute those steps one by one. It's really difficult for a developer to evaluate whether an agent was succesful or not, becasue the traces are so long. This is why the developer needs you, they defined a list of requirements they want to check the agentictrqaces against and your job is to assist them with that.    
  
  You will do this by inspecting the trace of logs of actions of that assistant, then, based on this trace, you will evaluate whether a user defined requirement  was succesfully executed, by outputing a boolean 'pass' variable. You will also provide 'feedback_message' variable, where you explain why you believe the requirement was or wasn't succesfully fulfiled based on the trace. You must support this feedback with references to the trace. Inline as you make relevant feedback quote the span which support swhat you are saying, you mujst conform to a schema when doing the references (you must wrap this object it in double angle brackets): <<{agent_span_id: int, reference_text: string}>> (make sure ot include key names and angle brakcets, e.g. <<{agent_span_id: 0, reference_text: "request failed"}>>)) 'agent_span_id' is an ID of a span related to your feedback and 'reference_text' is an exact, continuse, case sensitive exerpt from that span (make sure it maches letter for letter). Prioritise multiple shorter references. Teference are important as they allow the user to easily cross check and understand your reasoning. Be quite exhaustive in your feedback, feedback_message can take up to 5-10 sentences. Finally, you need to generate a short 3-4 words long 'test_title' object to describe w the feedback. 

  You will generate such feedback object for each of the requirements given to you as a list. 

  Before generating any of these fields, start by completing, 'thought_process' field where you will first plan your thought and reasoning process for a particular requirement. Such that you lay some thoughts for your answers to those fields. 'thought_process' field won't be displayed to the end user, so don't make references to it. 
  
  You will ouptut Json adhearing to the following schema:
  
  {evaluation: [
    {
    thought_process: string, 
    pass: boolean, 
    feedback_message: string, 
    test_title: string, 
    },
    {...},
    ...
  ]
}
`;
  const userPrompt = `User request: ${userRequest}
  
  Agentic trace: ${trace}
  
  Requirements to evaluate against: ${milestones}
  
  Evaluate completion of each of the requirements by inspecting the trace. Make sure to evaluate each requirement independently. Make sure to output a json file in a required format. `;
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
  return messages;
}

function processReferences(text: string): {
  processedText: string;
  references: InitialReference[]; // Changed to InitialReference
} {
  const references: InitialReference[] = [];
  let refIndex = 0;

  const processedText = text.replace(/<<{agent_span_id:\s*(\d+),\s*reference_text:\s*(.+?)}>>/g, (_, agent_span_id, reference_text) => {
    references.push({
      agent_span_id: parseInt(agent_span_id, 10),
      reference_text: reference_text.trim(),
    });
    return `{ref${refIndex++}}`;
  });

  return { processedText, references };
}

function processFeedbackJson(feedbackArray: FeedbackItem[]): FeedbackItem[] {
  return feedbackArray.map((item) => {
    const { processedText, references } = processReferences(item.feedback_message);
    return {
      ...item,
      feedback_message: processedText,
      span_references: references,
    };
  });
}

function convertReferences(feedbackItems: FeedbackItem[], idList: string[]): { id: string; agent_span_id: string; reference_text: string }[][] {
  return feedbackItems.map((item) =>
    item.span_references.map((ref) => ({
      id: uuidv4(), // Assuming you have uuidv4 imported
      agent_span_id: idList[ref.agent_span_id] || ref.agent_span_id.toString(),
      reference_text: ref.reference_text,
    }))
  );
}

export async function runTests(testData: TestSample[]) {
  // things to be decided:
  // 1 - function for each test sample should be triggered independently
  // 2 - LLM calls should be processed in parallel as much as possible
  // 3 - there should be some laoding state, that hydrates upon Promise resolution.

  const testResults: TestResultData[] = [];
  for (const testSample of testData) {
    if (testSample.milestones.length === 0) {
      continue;
    }
    // 1. handle evaluation generation
    const { trace, idList } = processTrace(testSample.spans);
    const milestoneString = processMilestones(testSample.milestones);
    const messages: ChatCompletionMessageParam[] = getEvaluationMessages(testSample.user_request, trace, milestoneString);
    const evaluationString = await callOpenai(messages, true);
    // console.log("evaluationString:", evaluationString, "\n\n\n");
    const evaluationResultRaw = JSON.parse(evaluationString).evaluation;

    const evaluationResult = processFeedbackJson(evaluationResultRaw);
    const convertedReferences = convertReferences(evaluationResult, idList);

    // console.log("testSample.milestones:", testSample.milestones);
    console.log("convertedReferences:", convertedReferences);
    // console.log("idList:", idList);
    // console.log("evaluationResult:", evaluationResult);
    // 2. augument output data with Ids
    for (let i = 0; i < testSample.milestones.length; i++) {
      const testResultId = uuidv4();
      const result: TestResult = {
        id: testResultId,
        test_title: evaluationResult[i].test_title,
        feedback_message: evaluationResult[i].feedback_message,
        pass: evaluationResult[i].pass,
        span_references: convertedReferences[i],
      };
      testResults.push({
        trace_id: testSample.trace_id,
        milestone_id: testSample.milestones[i].id,
        result,
      });
    }
  }
  console.log("testResults:", JSON.stringify(testResults, null, 2));
  return testResults;
}
