import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Database } from "sqlite";
import { NextRequest, NextResponse } from "next/server";

async function openDB(): Promise<Database> {
  return open({
    filename: "./data.db",
    driver: sqlite3.Database,
  });
}

export async function DELETE(request: NextRequest, { params }: { params: { milestoneId: string } }) {
  try {
    const db = await openDB();
    const { milestoneId } = params;

    if (!milestoneId) {
      return NextResponse.json({ message: "Milestone ID is required" }, { status: 400 });
    }

    const deleteStatement = await db.prepare("DELETE FROM Milestone WHERE id = ?");
    const result = await deleteStatement.run(milestoneId);
    await deleteStatement.finalize();

    await db.close();

    if (result.changes === 0) {
      return NextResponse.json({ message: "Milestone not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Milestone deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { milestoneId: string } }) {
  try {
    const db = await openDB();
    const { milestoneId } = params;

    if (!milestoneId) {
      return NextResponse.json({ message: "Milestone ID is required" }, { status: 400 });
    }

    const { text } = await request.json();

    const updateStatement = await db.prepare("UPDATE Milestone SET text = ? WHERE id = ?");
    const result = await updateStatement.run(text, milestoneId);
    await updateStatement.finalize();

    await db.close();

    if (result.changes === 0) {
      return NextResponse.json({ message: "Milestone not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Milestone updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
