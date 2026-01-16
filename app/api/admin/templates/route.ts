import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function format(tpl: any) {
  return {
    _id: tpl._id?.toString(),
    title: tpl.title || "Untitled Template",
    description: tpl.description || "",
    category: tpl.category || "General",
    status: tpl.status || "draft",
    timeLimit: Number(tpl.timeLimit) || 30,
    questions: Array.isArray(tpl.questions) ? tpl.questions : [],
    questionsCount: Array.isArray(tpl.questions) ? tpl.questions.length : 0,
    createdAt: tpl.createdAt || new Date(),
    updatedAt: tpl.updatedAt || new Date(),
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
    const formatted = templates.map(format);

    return NextResponse.json({ success: true, templates: formatted, total: formatted.length });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to load templates", templates: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const category = String(body.category || "").trim();
    const timeLimit = Number(body.timeLimit ?? 30);
    const questions = Array.isArray(body.questions) ? body.questions : [];

    if (!title) {
      return NextResponse.json({ success: false, error: "Title required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");
    const collection = db.collection("templates");

    const doc = {
      title,
      description,
      category,
      status: "draft",
      timeLimit: Number.isFinite(timeLimit) ? timeLimit : 30,
      questions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    const inserted = await collection.findOne({ _id: result.insertedId });

    return NextResponse.json({ success: true, template: format(inserted) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to add template" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = String(body.id || "").trim();
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid template ID" }, { status: 400 });
    }

    const fields: any = {};
    if (body.title !== undefined) fields.title = String(body.title);
    if (body.description !== undefined) fields.description = String(body.description);
    if (body.category !== undefined) fields.category = String(body.category);
    if (body.timeLimit !== undefined) fields.timeLimit = Number(body.timeLimit);
    if (body.questions !== undefined && Array.isArray(body.questions)) fields.questions = body.questions;
    fields.updatedAt = new Date();

    const client = await clientPromise;
    const db = client.db("main");
    const collection = db.collection("templates");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: fields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    const updated = await collection.findOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, template: format(updated) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = String(body.id || "").trim();
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid template ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");
    const collection = db.collection("templates");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to delete template" }, { status: 500 });
  }
}

