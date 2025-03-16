import { markdownTableToJson } from "@/lib/utils";
import { NextResponse } from "next/server";

interface StudentGrade {
  name: string;
  taskScores: (number | null)[];  // null represents missing scores ("-")
}

interface GradesData {
  timestamp: string;
  students: Array<StudentGrade & { 
    averageGrade: string;
    totalTasks: number;
  }>;
}


export async function POST(req: Request): Promise<NextResponse<unknown>> {
  try {
    const body = await req.json();
    if (!body.markdownTable) {
      throw new Error("Markdown table is required in request body");
    }

    const { markdownTable } = body;

    // Convert markdown table to JSON using utility
    const jsonResponse = markdownTableToJson(markdownTable);

    return NextResponse.json({ json:  JSON.parse(jsonResponse) });
  } catch (error) {
    console.error("Error in grades route:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: "Failed to process your request", message: errorMessage }, { status: 500 });
  }
}
