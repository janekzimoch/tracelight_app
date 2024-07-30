import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Database } from "sqlite";
import { NextRequest, NextResponse } from "next/server";

async function openDB(): Promise<Database> {
  const db = await open({
    filename: "./data.db",
    driver: sqlite3.Database,
  });
  await db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

export async function PUT(request: NextRequest, { params }: { params: { testId: string } }) {
  try {
    const db = await openDB();
    const { testId } = params;

    if (!testId) {
      return NextResponse.json({ message: "Test ID is required" }, { status: 400 });
    }

    const { description, executable_code } = await request.json();

    const updateStatement = await db.prepare("UPDATE tests SET description = ?, executable_code = ? WHERE id = ?");
    await updateStatement.run(description, executable_code, testId);
    await updateStatement.finalize();

    await db.close();

    return NextResponse.json({ message: "Test updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating test:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { testId: string } }) {
  try {
    const db = await openDB();
    const { testId } = params;

    if (!testId) {
      return NextResponse.json({ message: "Test ID is required" }, { status: 400 });
    }

    const deleteStatement = await db.prepare("DELETE FROM tests WHERE id = ?");
    await deleteStatement.run(testId);
    await deleteStatement.finalize();

    await db.close();

    return NextResponse.json({ message: "Test deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting test:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
