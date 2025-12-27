import { NextResponse } from "next/server";

export async function GET() {
  const quizzes = [
    { id: 1, title: "Math Quiz 1", categoryId: 1 },
    { id: 2, title: "Science Quiz 1", categoryId: 2 },
    { id: 3, title: "History Quiz 1", categoryId: 3 },
  ];
  return NextResponse.json(quizzes);
}
