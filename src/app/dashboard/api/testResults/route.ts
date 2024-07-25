import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Database } from "sqlite";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { TestResultData, runTests } from "@/backend/milestoneEvaluation";

async function openDB(): Promise<Database> {
  return open({
    filename: "./data.db",
    driver: sqlite3.Database,
  });
}

export async function POST(request: NextRequest) {
  try {
    const db = await openDB();
    const { testSamples } = await request.json();

    if (!testSamples || !Array.isArray(testSamples)) {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const testResults: TestResultData[] = await runTests(testSamples);

    // Save test results to database
    for (const result of testResults) {
      const testResultId = uuidv4();

      // Insert into TestResult table
      await db.run("INSERT INTO TestResult (id, milestone_id, trace_id, test_title, feedback_message, pass) VALUES (?, ?, ?, ?, ?)", [
        testResultId,
        result.milestone_id,
        result.trace_id,
        result.result.test_title,
        result.result.feedback_message,
        result.result.pass,
      ]);

      // Insert span references
      for (const spanRef of result.result.span_references) {
        await db.run("INSERT INTO SpanReference (id, test_result_id, agent_span_id, reference_text) VALUES (?, ?, ?, ?)", [
          uuidv4(),
          testResultId,
          spanRef.agent_span_id,
          spanRef.reference_text,
        ]);
      }
    }

    await db.close();

    return NextResponse.json({ message: "Tests run successfully", results: testResults }, { status: 200 });
  } catch (error) {
    console.error("Error running tests:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
