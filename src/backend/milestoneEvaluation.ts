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

dotenv.config();
const openai = new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });
let openaiModel = "gpt-4o";

async function callOpenai(messages: ChatCompletionMessageParam[], json: boolean = false): Promise<string> {
  const response = await openai.chat.completions.create({
    model: openaiModel,
    messages: messages,
    max_tokens: 3000,
    response_format: { type: json ? "json_object" : "text" },
  });
  const message = response.choices[0].message;
  if (message.content === null) {
    throw new Error("content is null");
  }
  return message.content as string;
}

function processTrace(spans: AgentSpan[]): { trace: string; idList: string[] } {
  const traceList = spans.map((span, index) => `<${index}> - ${span.name}\n${span.messages}`);
  const trace = traceList.join("\n\n\n");
  return { trace, idList: spans.map((span) => span.id) };
}

function processMilestones(milestones: Milestone[]): string {
  const milestoneString = milestones.map((m, index) => `${index}. ${m.text}`).join("\n");
  return milestoneString;
}

function getEvaluationMessages(userRequest: string, trace: string, milestones: string): ChatCompletionMessageParam[] {
  // 1. system prompt - decide what the agents is supposed to do and what ouptu is it supposed ot give
  // 2. user prompt - present variables and highlight your expectations
  const systemPrompt = `You are a useful assistant for evaluation of agentic traces. Your job is to evalaute whether another assistant has accomplished specified milestones which are neccesary for fulfiling a user request. You will do this by inspecting the trace of logs of actions of that assistant, then, based on this trace, you will evaluate whether the milestone was fulfiled or not, by outputing a boolean 'pass' variable. You will also provide 'feedback_message' variable, where you explain why you believe the milestone was or wasn't succesfully fulfiled based on the trace. You must support this feedback with references to the trace. This will be done by adding placeholder ref inside of curly brackets {ref[i]} within the feedback_message (i.e. "some-feedback {ref0} later-part-of-feedback {ref1} more-feedback {ref2} ... and so on "). Once you generate your output, these will be later populated with the actual references, also generated by you but in a seperate field 'span_reference' as a list of SpanReference objects. SpanReference object consists of 'agent_span_id' which refers to the ID of a span you are making reference to (number within angle brackets <>, from the begining of each span), and 'reference_text' which must be exact case-sensitive quote of part of the text in the span that you are making reference to. Once you generate all of these, you will also generate a short 3-4 words long'test_title' object to summarise the feedback. 

  You will generate such feedback object for each of the milestones given to you as a list. 

  Before generating any of these fields, start by completing, 'thought_process' field where you will first plan your thought and reasoning process for a particular milestone. Such that you lay some thoughts for your answers to those fields. 'thought_process' field won't be displayed to the end user, so don't make references to it. 
  
  You will ouptut Json adhearing to the following schema:
  
  {evaluation: [
    {
    thought_process: string, 
    pass: boolean, 
    feedback_message: string, 
    test_title: string, 
    span_references: [
      {
        agent_span_id: string, 
        reference_text: string
      }, 
      {...},
      ...
    ]
    },
    {...},
    ...
  ]
`;
  const userPrompt = `User request: ${userRequest}
  
  Agentic trace: ${trace}
  
  Milestones to evaluate against: ${milestones}
  
  Evaluate completion of each of the milestones by inspecting the trace. Make sure to evaluate each milestone independently. Make sure to output a json file in a required format. `;
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
  return messages;
}

function replaceAgentSpanIds(evaluationResult: TestResult[], idList: string[]): void {
  evaluationResult.forEach((res) => {
    res.span_references.forEach((ref) => {
      const index = parseInt(ref.agent_span_id, 10);
      if (!isNaN(index) && index >= 0 && index < idList.length) {
        ref.agent_span_id = idList[index];
      }
    });
  });
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
    const evaluationResult: TestResult[] = JSON.parse(evaluationString).evaluation;
    replaceAgentSpanIds(evaluationResult, idList);

    // 2. augument output data with Ids
    for (let i = 0; i < testSample.milestones.length; i++) {
      const testResultId = uuidv4();
      const result: TestResult = {
        id: testResultId,
        test_title: evaluationResult[i].test_title,
        feedback_message: evaluationResult[i].feedback_message,
        pass: evaluationResult[i].pass,
        span_references: [],
      };
      for (const reference of evaluationResult[i].span_references) {
        const refId = uuidv4();
        result.span_references.push({ ...reference, id: refId });
      }
      testResults.push({
        trace_id: testSample.trace_id,
        milestone_id: testSample.milestones[i].id,
        result,
      });
    }
  }

  return testResults;
}
