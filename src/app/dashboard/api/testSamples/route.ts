import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Database } from "sqlite";
import { NextResponse } from "next/server";

async function openDB(): Promise<Database> {
  return open({
    filename: "./data.db",
    driver: sqlite3.Database,
  });
}

export interface MessageSpan {
  id: string;
  sequence_index: number;
  content: string;
  type: string;
  tool_execution: object | null;
}

export interface AgentSpan {
  id: string;
  name: string;
  sequence_index: number;
  messages: MessageSpan[];
}

export interface TestSample {
  test_sample_id: string;
  trace_id: string;
  user_request: string;
  spans: AgentSpan[];
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  sequence_index: number;
  text: string;
  test_results: TestResult[];
}

export interface TestResult {
  id: string;
  test_title: string;
  feedback_message: string;
  span_references: SpanReference[];
}

export interface SpanReference {
  id: string;
  agent_span_id: string;
  reference_text: string;
}

interface QueryResult {
  test_sample_id: string;
  user_request: string;
  trace_id: string;
  agent_span_id: string;
  agent_span_name: string;
  agent_span_index: number;
  message_span_id: string | null;
  message_span_index: number | null;
  content: string | null;
  type: string | null;
  tool_execution: string | null;
  milestone_id: string | null;
  milestone_index: number | null;
  milestone_text: string | null;
  test_result_id: string | null;
  test_result_title: string | null;
  test_result_feedback: string | null;
  span_reference_id: string | null;
  reference_text: string | null;
}

export async function GET() {
  try {
    const db = await openDB();

    const results = await db.all<QueryResult[]>(`
      SELECT 
        ts.id as test_sample_id,
        ts.user_request,
        t.id as trace_id,
        asp.id as agent_span_id,
        asp.name as agent_span_name,
        asp.sequence_index as agent_span_index,
        msp.id as message_span_id,
        msp.sequence_index as message_span_index,
        msp.content,
        msp.type,
        msp.tool_execution,
        ml.id as milestone_id,
        ml.sequence_index as milestone_index,
        ml.text as milestone_text,
        tr.id as test_result_id,
        tr.test_title as test_result_title,
        tr.feedback_message as test_result_feedback,
        sr.id as span_reference_id,
        sr.reference_text,
        sr.agent_span_id as span_reference_agent_span_id
      FROM 
        TestSample ts
      JOIN 
        Trace t ON ts.trace_id = t.id
      LEFT JOIN 
        AgentSpan asp ON t.id = asp.trace_id
      LEFT JOIN 
        MessageSpan msp ON asp.id = msp.agent_span_id
      LEFT JOIN 
        Milestone ml ON ts.id = ml.test_sample_id
      LEFT JOIN 
        TestResult tr ON ml.id = tr.milestone_id
      LEFT JOIN 
        SpanReference sr ON tr.id = sr.test_result_id
      ORDER BY 
        ts.id, asp.sequence_index, msp.sequence_index, ml.sequence_index, tr.id, sr.id
    `);

    await db.close();

    const groupedResults: Record<string, TestSample> = results.reduce((acc, row) => {
      if (!acc[row.test_sample_id]) {
        acc[row.test_sample_id] = {
          test_sample_id: row.test_sample_id,
          trace_id: row.trace_id,
          user_request: row.user_request,
          spans: [],
          milestones: [],
        };
      }

      let currentSpan = acc[row.test_sample_id].spans.find((span) => span.id === row.agent_span_id);
      if (!currentSpan) {
        currentSpan = {
          id: row.agent_span_id,
          name: row.agent_span_name,
          sequence_index: row.agent_span_index,
          messages: [],
        };
        acc[row.test_sample_id].spans.push(currentSpan);
      }

      if (row.message_span_id) {
        currentSpan.messages.push({
          id: row.message_span_id,
          sequence_index: row.message_span_index!,
          content: row.content!,
          type: row.type!,
          tool_execution: row.tool_execution ? JSON.parse(row.tool_execution) : null,
        });
      }

      let currentMilestone = acc[row.test_sample_id].milestones.find((milestone) => milestone.id === row.milestone_id);
      if (!currentMilestone && row.milestone_id) {
        currentMilestone = {
          id: row.milestone_id,
          sequence_index: row.milestone_index!,
          text: row.milestone_text!,
          test_results: [],
        };
        acc[row.test_sample_id].milestones.push(currentMilestone);
      }

      let currentTestResult = currentMilestone?.test_results.find((result) => result.id === row.test_result_id);
      if (!currentTestResult && row.test_result_id) {
        currentTestResult = {
          id: row.test_result_id,
          test_title: row.test_result_title!,
          feedback_message: row.test_result_feedback!,
          span_references: [],
        };
        currentMilestone?.test_results.push(currentTestResult);
      }

      if (row.span_reference_id) {
        currentTestResult?.span_references.push({
          id: row.span_reference_id,
          agent_span_id: row.agent_span_id!,
          reference_text: row.reference_text!,
        });
      }

      return acc;
    }, {} as Record<string, TestSample>);

    // Sort spans, messages, milestones, test results, and references by their sequence_index or ID
    Object.values(groupedResults).forEach((testSample: TestSample) => {
      testSample.spans.sort((a, b) => a.sequence_index - b.sequence_index);
      testSample.spans.forEach((span: AgentSpan) => {
        span.messages.sort((a, b) => a.sequence_index - b.sequence_index);
      });
      testSample.milestones.sort((a, b) => a.sequence_index - b.sequence_index);
      testSample.milestones.forEach((milestone: Milestone) => {
        milestone.test_results.sort((a, b) => a.id.localeCompare(b.id));
        milestone.test_results.forEach((result: TestResult) => {
          result.span_references.sort((a, b) => a.id.localeCompare(b.id));
        });
      });
    });

    return NextResponse.json(Object.values(groupedResults), { status: 200 });
  } catch (error) {
    console.error("Error fetching test samples:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
