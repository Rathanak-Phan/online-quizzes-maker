import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function formatTemplateResponse(tpl: any) {
  return {
    _id: tpl._id?.toString(),
    title: tpl.title || "Untitled Template",
    description: tpl.description || "",
    category: tpl.category || "General",
    status: tpl.status || "draft",
    timeLimit: tpl.timeLimit || 30,
    questions: Array.isArray(tpl.questions) ? tpl.questions : [],
    questionsCount: Array.isArray(tpl.questions) ? tpl.questions.length : 0,
    createdAt: tpl.createdAt || new Date(),
    updatedAt: tpl.updatedAt || new Date(),
    teacherId: tpl.teacherId?.toString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const collection = db.collection("templates");

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "newest";

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "all") {
      query.category = category;
    }

    let sortQuery: any = {};
    switch (sort) {
      case "title":
        sortQuery = { title: 1 };
        break;
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const templates = await collection.find(query).sort(sortQuery).limit(100).toArray();
    const formatted = templates.map(formatTemplateResponse);

    return NextResponse.json({
      success: true,
      templates: formatted,
      total: formatted.length,
      source: "main.templates",
    });
  } catch (error: any) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load templates", templates: [] },
      { status: 500 }
    );
  }
}
