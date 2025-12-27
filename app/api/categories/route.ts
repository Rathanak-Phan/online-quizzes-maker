import { NextResponse } from "next/server";

export async function GET() {
  const categories = [
    { id: 1, name: "Math" },
    { id: 2, name: "Science" },
    { id: 3, name: "History" },
  ];
  return NextResponse.json(categories);
}
