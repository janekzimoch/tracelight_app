import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Database } from "sqlite";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { parseLangSmithTraces } from "@/backend/parseLangSmithTraces";

async function openDB(): Promise<Database> {
  const db = await open({
    filename: "./data.db",
    driver: sqlite3.Database,
  });
  await db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

type NewTestSample = {
  user_request: string;
  traces: {
    name: string;
    messages: {
      content: string | null;
      type: string;
      tool_execution?: {
        query: string;
        tool: string;
        arguments: Record<string, any>;
      } | null;
    }[];
  }[];
};

function isNewTestSample(obj: any): obj is NewTestSample {
  if (typeof obj !== "object" || obj === null) {
    console.error("Object is not an object or is null");
    return false;
  }

  if (typeof obj.user_request !== "string") {
    console.error("user_request is not a string");
    console.error("Value of user_request:", JSON.stringify(obj.user_request));
    return false;
  }

  if (!Array.isArray(obj.traces)) {
    console.error("traces is not an array");
    return false;
  }

  for (let i = 0; i < obj.traces.length; i++) {
    const trace = obj.traces[i];
    if (typeof trace !== "object" || trace === null) {
      console.error(`trace at index ${i} is not an object or is null`);
      return false;
    }

    if (typeof trace.name !== "string") {
      console.error(`trace.name at index ${i} is not a string`);
      return false;
    }

    if (!Array.isArray(trace.messages)) {
      console.error(`trace.messages at index ${i} is not an array`);
      return false;
    }

    for (let j = 0; j < trace.messages.length; j++) {
      const message = trace.messages[j];
      if (typeof message !== "object" || message === null) {
        console.error(`message at trace ${i}, index ${j} is not an object or is null`);
        return false;
      }

      if (typeof message.content !== "string" && message.content !== null) {
        console.error(`message.content at trace ${i}, index ${j} is not a string or null`);
        return false;
      }

      if (typeof message.type !== "string") {
        console.error(`message.type at trace ${i}, index ${j} is not a string`);
        return false;
      }

      if (message.tool_execution !== undefined && message.tool_execution !== null) {
        if (typeof message.tool_execution !== "object") {
          console.error(`message.tool_execution at trace ${i}, index ${j} is not an object or null`);
          return false;
        }

        if (typeof message.tool_execution.query !== "string") {
          console.error(`message.tool_execution.query at trace ${i}, index ${j} is not a string`);
          return false;
        }

        if (typeof message.tool_execution.tool !== "string") {
          console.error(`message.tool_execution.tool at trace ${i}, index ${j} is not a string`);
          return false;
        }

        if (typeof message.tool_execution.arguments !== "object" || message.tool_execution.arguments === null) {
          console.error(`message.tool_execution.arguments at trace ${i}, index ${j} is not an object`);
          return false;
        }
      }
    }
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const db = await openDB();

    // Create tables if they don't exist
    await db.exec(`
    PRAGMA foreign_keys = ON;
  
    CREATE TABLE IF NOT EXISTS TestSample (
      id TEXT PRIMARY KEY,
      user_request TEXT
    );
  
    CREATE TABLE IF NOT EXISTS Trace (
      id TEXT PRIMARY KEY,
      test_sample_id TEXT,
      upload_timestamp TEXT,
      FOREIGN KEY (test_sample_id) REFERENCES TestSample(id) ON DELETE CASCADE
    );
  
    CREATE TABLE IF NOT EXISTS AgentSpan (
      id TEXT PRIMARY KEY,
      sequence_index INTEGER,
      trace_id TEXT,
      name TEXT,
      FOREIGN KEY (trace_id) REFERENCES Trace(id) ON DELETE CASCADE
    );
  
    CREATE TABLE IF NOT EXISTS MessageSpan (
      id TEXT PRIMARY KEY,
      sequence_index INTEGER,
      agent_span_id TEXT,
      content TEXT,
      type TEXT,
      tool_execution TEXT,
      FOREIGN KEY (agent_span_id) REFERENCES AgentSpan(id) ON DELETE CASCADE
    );
  
    CREATE TABLE IF NOT EXISTS Milestone (
      id TEXT PRIMARY KEY,
      test_sample_id TEXT,
      sequence_index INTEGER,
      text TEXT,
      FOREIGN KEY (test_sample_id) REFERENCES TestSample(id) ON DELETE CASCADE
    );
  
    CREATE TABLE IF NOT EXISTS TestResult (
      id TEXT PRIMARY KEY,
      milestone_id TEXT,
      trace_id TEXT,
      test_title TEXT,
      feedback_message TEXT,
      pass INTEGER,
      FOREIGN KEY (milestone_id) REFERENCES Milestone(id) ON DELETE CASCADE,
      FOREIGN KEY (trace_id) REFERENCES Trace(id) ON DELETE CASCADE
    );
  
    CREATE TABLE IF NOT EXISTS SpanReference (
      id TEXT PRIMARY KEY,
      test_result_id TEXT,
      agent_span_id TEXT,
      reference_text TEXT,
      FOREIGN KEY (test_result_id) REFERENCES TestResult(id) ON DELETE CASCADE,
      FOREIGN KEY (agent_span_id) REFERENCES AgentSpan(id) ON DELETE CASCADE
    );
  `);

    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (files.length === 0) {
      console.error("No files provided in the request");
      return NextResponse.json({ message: "At least one file is required" }, { status: 400 });
    }

    const jsonDataList = [];
    for (const file of files) {
      const fileData = await file.text();
      try {
        const jsonData = JSON.parse(fileData);
        jsonDataList.push(jsonData);
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        return NextResponse.json({ message: "Invalid JSON format" }, { status: 400 });
      }
    }

    const langSmithTraces = parseLangSmithTraces(jsonDataList);

    if (!Array.isArray(langSmithTraces) || !langSmithTraces.every(isNewTestSample)) {
      console.error("JSON data does not match expected schema");
      return NextResponse.json({ message: "Invalid JSON format: does not match expected schema" }, { status: 400 });
    }

    console.log(`Processing ${langSmithTraces.length} test samples`);

    for (const testSample of langSmithTraces) {
      const testSampleId = uuidv4();
      const traceId = uuidv4();
      const uploadTimestamp = new Date().toISOString();

      // Insert the TestSample
      await db.run("INSERT INTO TestSample (id, user_request) VALUES (?, ?)", testSampleId, testSample.user_request);

      // Insert the Trace
      await db.run("INSERT INTO Trace (id, test_sample_id, upload_timestamp) VALUES (?, ?, ?)", traceId, testSampleId, uploadTimestamp);

      console.log(`Inserted TestSample with ID: ${testSampleId} and Trace with ID: ${traceId}`);

      for (let agentIndex = 0; agentIndex < testSample.traces.length; agentIndex++) {
        const trace = testSample.traces[agentIndex];
        const agentSpanId = uuidv4();

        // Insert the AgentSpan with sequence_index
        await db.run("INSERT INTO AgentSpan (id, sequence_index, trace_id, name) VALUES (?, ?, ?, ?)", agentSpanId, agentIndex, traceId, trace.name);

        console.log(`Inserted AgentSpan: ${trace.name} with ID: ${agentSpanId} and sequence_index: ${agentIndex}`);

        // Insert each message within the trace as a MessageSpan
        for (let messageIndex = 0; messageIndex < trace.messages.length; messageIndex++) {
          const message = trace.messages[messageIndex];
          const messageSpanId = uuidv4();
          const toolExecution = message.tool_execution ? JSON.stringify(message.tool_execution) : null;

          await db.run(
            "INSERT INTO MessageSpan (id, sequence_index, agent_span_id, content, type, tool_execution) VALUES (?, ?, ?, ?, ?, ?)",
            messageSpanId,
            messageIndex,
            agentSpanId,
            message.content,
            message.type,
            toolExecution
          );

          console.log(`Inserted MessageSpan for AgentSpan: ${agentSpanId} with sequence_index: ${messageIndex}`);
        }
      }
    }

    await db.close();

    return NextResponse.json({ message: "File uploaded successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error handling the request:", error);
    return NextResponse.json({ message: "Internal Server Error", error: String(error) }, { status: 500 });
  }
}
