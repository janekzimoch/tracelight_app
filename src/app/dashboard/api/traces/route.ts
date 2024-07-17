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

export async function GET() {
  try {
    const db = await openDB();

    // Fetch all traces with their associated spans
    const traces = await db.all(`
      SELECT 
        t.id as trace_id,
        s.id as id,
        s.sequence_index,
        s.role,
        s.content,
        s.tool_calls
      FROM 
        traces t
      LEFT JOIN 
        spans s ON t.id = s.trace_id
      ORDER BY 
        t.id, s.sequence_index
    `);

    // Close the database connection
    await db.close();

    // Group spans by trace_id
    const groupedTraces = traces.reduce((acc, span) => {
      if (!acc[span.trace_id]) {
        acc[span.trace_id] = [];
      }
      acc[span.trace_id].push(span);
      return acc;
    }, {});

    return NextResponse.json(groupedTraces, { status: 200 });
  } catch (error) {
    console.error("Error fetching traces:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
