import { NextResponse } from "next/server";

let sessions = []; // demo in-memory store

export async function POST(req) {
  const { userId, feedback } = await req.json();
  const entry = { id: Date.now(), userId, feedback };
  sessions.push(entry);
  return NextResponse.json({ success: true, entry });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const userSessions = sessions.filter((s) => s.userId === userId);
  return NextResponse.json(userSessions);
}