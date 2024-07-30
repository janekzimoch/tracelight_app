import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Database } from "sqlite";
import { NextResponse } from "next/server";

async function openDB(): Promise<Database> {
  const db = await open({
    filename: "./data.db",
    driver: sqlite3.Database,
  });
  await db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

export type MessageSpan = {
  id: string;
  sequence_index: number;
  content: string;
  type: string;
  tool_execution: object | null;
};

export type AgentSpan = {
  id: string;
  name: string;
  sequence_index: number;
  messages: MessageSpan[];
};

export type TestSample = {
  test_sample_id: string;
  trace_id: string;
  user_request: string;
  spans: AgentSpan[];
  milestones: Milestone[];
};

export type Milestone = {
  id: string;
  sequence_index: number;
  text: string;
  test_result: TestResult | null;
};

export type TestResult = {
  id: string;
  test_title: string;
  feedback_message: string;
  pass: boolean;
  span_references: SpanReference[];
};

export type SpanReference = {
  id: string;
  agent_span_id: string;
  reference_text: string;
};

type QueryResult = {
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
  test_is_passed: boolean | null;
  span_reference_id: string | null;
  reference_text: string | null;
};

export async function GET() {
  try {
    const db = await openDB();

    // Fetch TestSamples, Traces, AgentSpans, MessageSpans, and Milestones
    const mainQuery = `
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
        ml.text as milestone_text
      FROM 
        TestSample ts
      JOIN 
        Trace t ON ts.id = t.test_sample_id
      LEFT JOIN 
        AgentSpan asp ON t.id = asp.trace_id
      LEFT JOIN 
        MessageSpan msp ON asp.id = msp.agent_span_id
      LEFT JOIN 
        Milestone ml ON ts.id = ml.test_sample_id
      ORDER BY 
        ts.id, asp.sequence_index, msp.sequence_index, ml.sequence_index
    `;

    const results = await db.all(mainQuery);

    // Fetch TestResults separately
    const testResultsQuery = `
      SELECT 
        tr.id,
        tr.milestone_id,
        tr.test_title,
        tr.feedback_message,
        tr.pass
      FROM 
        TestResult tr
      JOIN 
        Milestone ml ON tr.milestone_id = ml.id
      JOIN 
        TestSample ts ON ml.test_sample_id = ts.id
    `;

    const testResults = await db.all(testResultsQuery);

    // Fetch SpanReferences separately
    const spanReferencesQuery = `
      SELECT 
        sr.id,
        sr.test_result_id,
        sr.agent_span_id,
        sr.reference_text
      FROM 
        SpanReference sr
      JOIN 
        TestResult tr ON sr.test_result_id = tr.id
      JOIN 
        Milestone ml ON tr.milestone_id = ml.id
      JOIN 
        TestSample ts ON ml.test_sample_id = ts.id
    `;

    const spanReferences = await db.all(spanReferencesQuery);

    await db.close();

    const groupedResults: Record<string, TestSample> = {};

    results.forEach((row) => {
      if (!groupedResults[row.test_sample_id]) {
        groupedResults[row.test_sample_id] = {
          test_sample_id: row.test_sample_id,
          trace_id: row.trace_id,
          user_request: row.user_request,
          spans: [],
          milestones: [],
        };
      }

      let currentSpan = groupedResults[row.test_sample_id].spans.find((span) => span.id === row.agent_span_id);
      if (!currentSpan && row.agent_span_id) {
        currentSpan = {
          id: row.agent_span_id,
          name: row.agent_span_name,
          sequence_index: row.agent_span_index,
          messages: [],
        };
        groupedResults[row.test_sample_id].spans.push(currentSpan);
      }

      if (row.message_span_id && currentSpan) {
        const existingMessage = currentSpan.messages.find((msg) => msg.id === row.message_span_id);
        if (!existingMessage) {
          currentSpan.messages.push({
            id: row.message_span_id,
            sequence_index: row.message_span_index!,
            content: row.content!,
            type: row.type!,
            tool_execution: row.tool_execution ? JSON.parse(row.tool_execution) : null,
          });
        }
      }

      if (row.milestone_id) {
        const existingMilestone = groupedResults[row.test_sample_id].milestones.find((m) => m.id === row.milestone_id);
        if (!existingMilestone) {
          groupedResults[row.test_sample_id].milestones.push({
            id: row.milestone_id,
            sequence_index: row.milestone_index!,
            text: row.milestone_text!,
            test_result: null,
          });
        }
      }
    });

    // Add TestResults to Milestones
    testResults.forEach((testResult) => {
      Object.values(groupedResults).forEach((testSample) => {
        const milestone = testSample.milestones.find((m) => m.id === testResult.milestone_id);
        if (milestone) {
          milestone.test_result = {
            id: testResult.id,
            test_title: testResult.test_title,
            feedback_message: testResult.feedback_message,
            pass: testResult.pass,
            span_references: [],
          };
        }
      });
    });

    // Add SpanReferences to TestResults
    spanReferences.forEach((spanReference) => {
      Object.values(groupedResults).forEach((testSample) => {
        testSample.milestones.forEach((milestone) => {
          if (milestone.test_result && milestone.test_result.id === spanReference.test_result_id) {
            milestone.test_result.span_references.push({
              id: spanReference.id,
              agent_span_id: spanReference.agent_span_id,
              reference_text: spanReference.reference_text,
            });
          }
        });
      });
    });

    // Sort spans, messages, milestones, and span references
    Object.values(groupedResults).forEach((testSample: TestSample) => {
      testSample.spans.sort((a, b) => a.sequence_index - b.sequence_index);
      testSample.spans.forEach((span: AgentSpan) => {
        span.messages.sort((a, b) => a.sequence_index - b.sequence_index);
      });
      testSample.milestones.sort((a, b) => a.sequence_index - b.sequence_index);
      testSample.milestones.forEach((milestone: Milestone) => {
        if (milestone.test_result) {
          milestone.test_result.span_references.sort((a, b) => a.id.localeCompare(b.id));
        }
      });
    });

    return NextResponse.json(Object.values(groupedResults), { status: 200 });
  } catch (error) {
    console.error("Error fetching test samples:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
