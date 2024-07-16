import { redirect } from "next/navigation";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Database } from "sqlite";

async function openDB(): Promise<Database> {
  return open({
    filename: "./traces.db",
    driver: sqlite3.Database,
  });
}

async function checkDataExists(): Promise<boolean> {
  const db = await openDB();
  try {
    const result = await db.get("SELECT COUNT(*) as count FROM traces");
    return result.count > 0;
  } catch {
    return false;
  } finally {
    await db.close();
  }
}

export default async function Home() {
  const dataExists = await checkDataExists();

  if (dataExists) {
    redirect("/dashboard");
  } else {
    redirect("/upload");
  }

  return null;
}
