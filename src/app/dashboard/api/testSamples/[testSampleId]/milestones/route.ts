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

export async function POST(request: NextRequest, { params }: { params: { testSampleId: string } }) {
  try {
    const db = await openDB();
    const { testSampleId } = params;

    if (!testSampleId) {
      return NextResponse.json({ message: "Test Sample ID is required" }, { status: 400 });
    }

    const { text } = await request.json();

    // Get the current maximum sequence_index for this test sample
    const maxSequenceIndexResult = await db.get("SELECT MAX(sequence_index) as maxIndex FROM Milestone WHERE test_sample_id = ?", testSampleId);
    const newSequenceIndex = (maxSequenceIndexResult.maxIndex || 0) + 1;

    const milestoneId = uuidv4();

    const insertStatement = await db.prepare("INSERT INTO Milestone (id, test_sample_id, text, sequence_index) VALUES (?, ?, ?, ?)");
    await insertStatement.run(milestoneId, testSampleId, text, newSequenceIndex);
    await insertStatement.finalize();

    await db.close();

    return NextResponse.json({ message: "Milestone added successfully", id: milestoneId }, { status: 201 });
  } catch (error) {
    console.error("Error adding milestone:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
