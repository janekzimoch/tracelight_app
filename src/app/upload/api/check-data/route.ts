import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Database } from "sqlite";

async function openDB(): Promise<Database> {
  const db = await open({
    filename: "./data.db",
    driver: sqlite3.Database,
  });
  await db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

async function checkDataExists(): Promise<boolean> {
  const db = await openDB();
  try {
    const result = await db.get("SELECT COUNT(*) as count FROM TestSample");
    return result.count > 0;
  } catch {
    return false;
  } finally {
    await db.close();
  }
}

export async function GET() {
  const dataExists = await checkDataExists();
  return NextResponse.json({ dataExists });
}
