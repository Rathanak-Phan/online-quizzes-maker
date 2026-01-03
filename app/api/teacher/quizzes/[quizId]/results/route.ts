import { NextRequest, NextResponse } from "next/server";

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

// Correct type: Next.js 16 expects `params` to possibly be a Promise
type ParamsType = { params: { quizId: string } | Promise<{ quizId: string }> };

export async function GET(
  request: NextRequest,
  context: ParamsType
) {
  try {
    // Resolve params if it’s a promise
    const resolvedParams =
      context.params instanceof Promise
        ? await context.params
        : context.params;

    const { quizId } = resolvedParams;

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
