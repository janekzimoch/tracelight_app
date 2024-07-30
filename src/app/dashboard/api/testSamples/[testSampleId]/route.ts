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

export async function DELETE(request: NextRequest, { params }: { params: { testSampleId: string } }) {
  try {
    const db = await openDB();
    const { testSampleId } = params;

    if (!testSampleId) {
      return NextResponse.json({ message: "testSample ID is required" }, { status: 400 });
    }

    const deleteStatement = await db.prepare("DELETE FROM TestSample WHERE id = ?");
    const result = await deleteStatement.run(testSampleId);
    await deleteStatement.finalize();

    await db.close();

    if (result.changes === 0) {
      return NextResponse.json({ message: "TestSample not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "TestSample deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting TestSample:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
