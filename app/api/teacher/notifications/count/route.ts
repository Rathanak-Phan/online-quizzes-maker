// app/api/teacher/notifications/count/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock count for now
    return NextResponse.json({
      count: 0
    });
  } catch (error) {
    console.error("Error fetching notifications count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}