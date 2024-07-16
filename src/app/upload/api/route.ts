import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Database } from "sqlite";
import { NextRequest, NextResponse } from "next/server";

async function openDB(): Promise<Database> {
  return open({
    filename: "./traces.db",
    driver: sqlite3.Database,
  });
}

export async function POST(request: NextRequest) {
  try {
    const db = await openDB();

    // Create table if it doesn't exist
    await db.exec("CREATE TABLE IF NOT EXISTS traces (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)");

    // Extract the file data from the request
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "File is required" }, { status: 400 });
    }

    const fileData = await file.text();

    // Insert the file data into the database
    await db.run("INSERT INTO traces (data) VALUES (?)", fileData);

    // Close the database connection
    await db.close();

    return NextResponse.json({ message: "File uploaded successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error handling the request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
