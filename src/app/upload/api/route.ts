import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Database } from "sqlite";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

async function openDB(): Promise<Database> {
  return open({
    filename: "./data.db",
    driver: sqlite3.Database,
  });
}

export async function POST(request: NextRequest) {
  try {
    const db = await openDB();

    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS traces (
        id TEXT PRIMARY KEY
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS spans (
        id TEXT PRIMARY KEY,
        trace_id TEXT,
        sequence_index INTEGER,
        role TEXT,
        content TEXT,
        tool_calls TEXT,
        FOREIGN KEY (trace_id) REFERENCES traces(id)
      );
    `);

    // Extract the file data from the request
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "File is required" }, { status: 400 });
    }

    const fileData = await file.text();
    const jsonData = JSON.parse(fileData);

    // Check if jsonData is a list of lists
    if (!Array.isArray(jsonData) || !jsonData.every(Array.isArray)) {
      return NextResponse.json({ message: "Invalid JSON format" }, { status: 400 });
    }

    for (const trace of jsonData) {
      const traceId = uuidv4();

      // Insert the trace
      await db.run("INSERT INTO traces (id) VALUES (?)", traceId);

      // Insert each span within the trace
      for (let i = 0; i < trace.length; i++) {
        const span = trace[i];
        const spanId = uuidv4();
        const sequenceIndex = i;
        const role = span.role || "";
        let content = span.content || "";
        const toolCalls = span.tool_calls ? JSON.stringify(span.tool_calls) : null;

        if (span.tool_call_id) {
          content = JSON.stringify({ tool_call_id: span.tool_call_id, content: span.content });
        }

        await db.run(
          "INSERT INTO spans (id, trace_id, sequence_index, role, content, tool_calls) VALUES (?, ?, ?, ?, ?, ?)",
          spanId,
          traceId,
          sequenceIndex,
          role,
          content,
          toolCalls
        );
      }
    }

    // Close the database connection
    await db.close();

    return NextResponse.json({ message: "File uploaded successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error handling the request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
