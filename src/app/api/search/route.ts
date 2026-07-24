import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { normalizeArabic, searchRecipes } from "@/lib/searchEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESPONSE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
  "Content-Type": "application/json; charset=utf-8",
};

export function GET(request: NextRequest) {
  const query = String(request.nextUrl.searchParams.get("q") ?? "")
    .trim()
    .slice(0, 80);

  if (normalizeArabic(query).length < 2) {
    return NextResponse.json({ results: [] }, { headers: RESPONSE_HEADERS });
  }

  try {
    return NextResponse.json(
      { results: searchRecipes(query, 10) },
      { headers: RESPONSE_HEADERS },
    );
  } catch (error) {
    console.error("Search route failed:", error);

    return NextResponse.json(
      { results: [], error: "SEARCH_FAILED" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }
}
