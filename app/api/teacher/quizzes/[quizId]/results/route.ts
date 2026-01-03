import { NextRequest, NextResponse } from "next/server";

// Mock data
const mockResults = [
  {
    _id: "1",
    studentName: "John Doe",
    percentage: 85.5,
    score: 17,
    totalQuestions: 20,
    timeSpent: 1250,
    submittedAt: new Date().toISOString(),
    answers: [],
  },
];

export async function GET(
  request: NextRequest,
  context: { params: { quizId: string } } // must be plain object, not a promise
) {
  try {
    const { quizId } = context.params;

    // simulate delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return NextResponse.json({
      quizId,
      quizTitle: `Quiz ${quizId.substring(0, 8)}...`,
      results: mockResults,
      total: mockResults.length,
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
