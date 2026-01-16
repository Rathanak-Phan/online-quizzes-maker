import clientPromise from "@/lib/mongodb";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";

// --- Types for MongoDB Documents ---
interface QuizDocument {
  _id: ObjectId;
  title?: string;
  category?: string;
  status?: string;
  timeLimit?: number;
  questions?: any[];
  questionsCount?: number;
  createdAt: Date;
}

interface ClassDocument {
  _id: ObjectId;
  name?: string;
  code?: string;
  type?: string;
  students?: any[] | number;
  quizzes?: any[] | number;
  createdAt: Date;
}

interface TemplateDocument {
  _id: ObjectId;
  title?: string;
  category?: string;
  timeLimit?: number;
  questions?: any[];
  createdAt: Date;
}

// --- Server Action ---
async function deleteData(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const type = String(formData.get("type") || "");
  const curTab = String(formData.get("tab") || "quizzes");

  if (!id || !ObjectId.isValid(id)) {
    redirect(`/admin/templates?tab=${curTab}`);
  }

  try {
    const client = await clientPromise;
    const db = client.db("main");
    const collection =
      type === "quizzes" ? "quizzes" : type === "classes" ? "classes" : "templates";
    
    await db.collection(collection).deleteOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("Failed to delete item:", error);
    // You might want to handle this error more gracefully in a real app
  }
  
  redirect(`/admin/templates?tab=${curTab}`);
}

export default async function AdminDataPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const tab = searchParams?.tab || "quizzes";
  let quizzes: any[] = [];
  let classes: any[] = [];
  let templates: any[] = [];
  let errorMsg = null;

  try {
    const client = await clientPromise;
    const db = client.db("main");

    // Optimized: Only fetch data for the active tab
    if (tab === "quizzes") {
      const raw = await db.collection("quizzes")
        .find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray() as unknown as QuizDocument[];

      quizzes = raw.map((q) => ({
        _id: q._id.toString(),
        title: q.title || "Untitled Quiz",
        category: q.category || "General",
        status: q.status || "draft",
        timeLimit: Number(q.timeLimit) || 30,
        questionsCount: Array.isArray(q.questions) ? q.questions.length : Number(q.questionsCount) || 0,
      }));
    } else if (tab === "classes") {
      const raw = await db.collection("classes")
        .find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray() as unknown as ClassDocument[];

      classes = raw.map((c) => ({
        _id: c._id.toString(),
        name: c.name || "Unnamed Class",
        code: c.code || "",
        type: c.type || "public",
        studentCount: Array.isArray(c.students) ? c.students.length : Number(c.students) || 0,
        quizzesCount: Array.isArray(c.quizzes) ? c.quizzes.length : Number(c.quizzes) || 0,
      }));
    } else if (tab === "templates") {
      const raw = await db.collection("templates")
        .find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray() as unknown as TemplateDocument[];

      templates = raw.map((t) => ({
        _id: t._id.toString(),
        title: t.title || "Untitled Template",
        category: t.category || "General",
        timeLimit: Number(t.timeLimit) || 30,
        questionsCount: Array.isArray(t.questions) ? t.questions.length : 0,
      }));
    }

  } catch (err: any) {
    console.error("Data loading error:", err);
    errorMsg = err.message || "Failed to load data";
  }

  if (errorMsg) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <h2 className="text-lg font-semibold mb-2">Error Loading Data</h2>
          <p>{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Link
            href="/admin/templates?tab=quizzes"
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${
              tab === "quizzes"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Quizzes
          </Link>
          <Link
            href="/admin/templates?tab=classes"
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${
              tab === "classes"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Classes
          </Link>
          <Link
            href="/admin/templates?tab=templates"
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${
              tab === "templates"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Templates
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* --- QUIZZES TAB --- */}
        {tab === "quizzes" && (
          <>
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4 sm:col-span-3">Title</div>
              <div className="col-span-3 sm:col-span-3">Category</div>
              <div className="col-span-2 hidden sm:block">Time</div>
              <div className="col-span-2 hidden sm:block">Questions</div>
              <div className="col-span-3 sm:col-span-2 text-right">Actions</div>
            </div>
            {quizzes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No quizzes found.</div>
            ) : (
              quizzes.map((q) => (
                <div key={q._id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 last:border-none text-sm items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-4 sm:col-span-3 font-medium text-gray-900 truncate" title={q.title}>{q.title}</div>
                  <div className="col-span-3 sm:col-span-3 text-gray-600 truncate">{q.category}</div>
                  <div className="col-span-2 hidden sm:block text-gray-600">{q.timeLimit} min</div>
                  <div className="col-span-2 hidden sm:block text-gray-600">{q.questionsCount}</div>
                  <div className="col-span-3 sm:col-span-2 flex justify-end">
                    <form action={deleteData}>
                      <input type="hidden" name="id" value={q._id} />
                      <input type="hidden" name="type" value="quizzes" />
                      <input type="hidden" name="tab" value={tab} />
                      <DeleteButton />
                    </form>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* --- CLASSES TAB --- */}
        {tab === "classes" && (
          <>
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4 sm:col-span-3">Name</div>
              <div className="col-span-3 sm:col-span-3">Code</div>
              <div className="col-span-2 hidden sm:block">Students</div>
              <div className="col-span-2 hidden sm:block">Quizzes</div>
              <div className="col-span-3 sm:col-span-2 text-right">Actions</div>
            </div>
            {classes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No classes found.</div>
            ) : (
              classes.map((c) => (
                <div key={c._id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 last:border-none text-sm items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-4 sm:col-span-3 font-medium text-gray-900 truncate" title={c.name}>{c.name}</div>
                  <div className="col-span-3 sm:col-span-3 text-gray-600 font-mono text-xs bg-gray-100 px-2 py-1 rounded w-fit">{c.code}</div>
                  <div className="col-span-2 hidden sm:block text-gray-600">{c.studentCount}</div>
                  <div className="col-span-2 hidden sm:block text-gray-600">{c.quizzesCount}</div>
                  <div className="col-span-3 sm:col-span-2 flex justify-end">
                    <form action={deleteData}>
                      <input type="hidden" name="id" value={c._id} />
                      <input type="hidden" name="type" value="classes" />
                      <input type="hidden" name="tab" value={tab} />
                      <DeleteButton />
                    </form>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* --- TEMPLATES TAB --- */}
        {tab === "templates" && (
          <>
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4 sm:col-span-3">Title</div>
              <div className="col-span-3 sm:col-span-3">Category</div>
              <div className="col-span-2 hidden sm:block">Time</div>
              <div className="col-span-2 hidden sm:block">Questions</div>
              <div className="col-span-3 sm:col-span-2 text-right">Actions</div>
            </div>
            {templates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No templates found.</div>
            ) : (
              templates.map((t) => (
                <div key={t._id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 last:border-none text-sm items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-4 sm:col-span-3 font-medium text-gray-900 truncate" title={t.title}>{t.title}</div>
                  <div className="col-span-3 sm:col-span-3 text-gray-600 truncate">{t.category}</div>
                  <div className="col-span-2 hidden sm:block text-gray-600">{t.timeLimit} min</div>
                  <div className="col-span-2 hidden sm:block text-gray-600">{t.questionsCount}</div>
                  <div className="col-span-3 sm:col-span-2 flex justify-end">
                    <form action={deleteData}>
                      <input type="hidden" name="id" value={t._id} />
                      <input type="hidden" name="type" value="templates" />
                      <input type="hidden" name="tab" value={tab} />
                      <DeleteButton />
                    </form>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DeleteButton() {
  return (
    <button 
      type="submit"
      className="px-3 py-1.5 text-xs font-medium text-red-700 hover:text-red-800 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-md transition-colors"
    >
      Delete
    </button>
  );
}