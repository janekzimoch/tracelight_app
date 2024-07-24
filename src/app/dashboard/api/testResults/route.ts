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
    const { testSamples } = await request.json();

    if (!testSamples || !Array.isArray(testSamples)) {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    // Prepare data for business logic function
    const preparedData = testSamples.map((sample) => ({
      user_request: sample.user_request,
      milestones: sample.milestones,
      spans: sample.spans,
      trace_id: sample.trace_id,
    }));

    // TODO: Call business logic function to run tests
    // const testResults = await runTests(preparedData);

    const testResults = [
      {
        trace_id: "trace1",
        milestone_id: "milestone1",
        test_title: "Sample Test 1 for Trace 1, Milestone 1",
        feedback_message: "This is a sample feedback message for test 1.",
        span_references: [
          { agent_span_id: "span1", reference_text: "Reference 1" },
          { agent_span_id: "span2", reference_text: "Reference 2" },
        ],
      },
      {
        trace_id: "trace1",
        milestone_id: "milestone2",
        test_title: "Sample Test 2 for Trace 1, Milestone 2",
        feedback_message: "This is a sample feedback message for test 2.",
        span_references: [
          { agent_span_id: "span3", reference_text: "Reference 3" },
          { agent_span_id: "span4", reference_text: "Reference 4" },
        ],
      },
      {
        trace_id: "trace2",
        milestone_id: "milestone3",
        test_title: "Sample Test 3 for Trace 2, Milestone 1",
        feedback_message: "This is a sample feedback message for test 3.",
        span_references: [
          { agent_span_id: "span5", reference_text: "Reference 5" },
          { agent_span_id: "span6", reference_text: "Reference 6" },
        ],
      },
      {
        trace_id: "trace2",
        milestone_id: "milestone4",
        test_title: "Sample Test 4 for Trace 2, Milestone 2",
        feedback_message: "This is a sample feedback message for test 4.",
        span_references: [
          { agent_span_id: "span7", reference_text: "Reference 7" },
          { agent_span_id: "span8", reference_text: "Reference 8" },
        ],
      },
    ];

    // Save test results to database
    for (const result of testResults) {
      const testResultId = uuidv4();

      // Insert into TestResult table
      await db.run("INSERT INTO TestResult (id, milestone_id, trace_id, test_title, feedback_message) VALUES (?, ?, ?, ?, ?)", [
        testResultId,
        result.milestone_id,
        result.trace_id,
        result.test_title,
        result.feedback_message,
      ]);

      // Insert span references
      for (const spanRef of result.span_references) {
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
