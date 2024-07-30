import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Database } from "sqlite";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

async function openDB(): Promise<Database> {
  const db = await open({
    filename: "./data.db",
    driver: sqlite3.Database,
  });
  await db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

export async function GET(request: NextRequest, { params }: { params: { spanId: string } }) {
  const { spanId } = params;

  if (!spanId) {
    return NextResponse.json({ message: "span_id is required" }, { status: 400 });
  }

  try {
    const db = await openDB();

    // Create the tests table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS tests (
          id TEXT PRIMARY KEY,
          executable_code TEXT,
          description TEXT,
          span_id TEXT,
          FOREIGN KEY (span_id) REFERENCES spans(id)
        )
      `);

    const tests = await db.all("SELECT id, executable_code, description FROM tests WHERE span_id = ?", spanId);

    await db.close();

    return NextResponse.json(tests.length > 0 ? tests : [], { status: 200 });
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { spanId: string } }) {
  try {
    const db = await openDB();
    const { spanId } = params;

    // Create table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tests (
        id TEXT PRIMARY KEY,
        executable_code TEXT,
        description TEXT,
        span_id TEXT,
        FOREIGN KEY (span_id) REFERENCES spans(id)
      )
    `);

    // Extract the span_id from the request
    console.log(spanId);
    if (!spanId) {
      return NextResponse.json({ message: "span_id is required" }, { status: 400 });
    }

    // Generate a new UUID for the test
    const id = uuidv4();

    // Insert the new test record
    const insertStatement = await db.prepare("INSERT INTO tests (id, executable_code, description, span_id) VALUES (?, ?, ?, ?)");
    await insertStatement.run(id, null, null, spanId);

    // Finalize the statement
    await insertStatement.finalize();

    // Close the database connection
    await db.close();

    return NextResponse.json({ id, message: "Test added successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error handling the request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
