import { NextResponse } from "next/server";

export async function GET() {
  const leaderboard = [
    { id: 1, name: "Alice", score: 95 },
    { id: 2, name: "Bob", score: 90 },
    { id: 3, name: "Charlie", score: 85 },
  ];
  return NextResponse.json(leaderboard);
}
