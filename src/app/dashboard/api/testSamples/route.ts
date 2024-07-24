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

interface MessageSpan {
  id: string;
  sequence_index: number;
  content: string;
  type: string;
  tool_execution: object | null;
}

interface AgentSpan {
  id: string;
  name: string;
  sequence_index: number;
  messages: MessageSpan[];
}

interface TestSample {
  test_sample_id: string;
  user_request: string;
  spans: AgentSpan[];
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
        msp.tool_execution
      FROM 
        TestSample ts
      JOIN 
        Trace t ON ts.trace_id = t.id
      LEFT JOIN 
        AgentSpan asp ON t.id = asp.trace_id
      LEFT JOIN 
        MessageSpan msp ON asp.id = msp.span_id
      ORDER BY 
        ts.id, asp.sequence_index, msp.sequence_index
    `);

    await db.close();

    const groupedResults: Record<string, TestSample> = results.reduce((acc, row) => {
      if (!acc[row.test_sample_id]) {
        acc[row.test_sample_id] = {
          test_sample_id: row.test_sample_id,
          user_request: row.user_request,
          spans: [],
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

      return acc;
    }, {} as Record<string, TestSample>);

    // Sort spans and messages by their sequence_index
    Object.values(groupedResults).forEach((testSample: TestSample) => {
      testSample.spans.sort((a, b) => a.sequence_index - b.sequence_index);
      testSample.spans.forEach((span: AgentSpan) => {
        span.messages.sort((a, b) => a.sequence_index - b.sequence_index);
      });
    });

    return NextResponse.json(Object.values(groupedResults), { status: 200 });
  } catch (error) {
    console.error("Error fetching test samples:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
