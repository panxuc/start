import { NextRequest, NextResponse } from "next/server";

const MAX_QUERY_LENGTH = 100;
const MAX_SUGGESTIONS = 10;
const FETCH_TIMEOUT_MS = 2500;

function normalizeQuery(rawQuery: string | null): string {
  if (!rawQuery) {
    return "";
  }
  return rawQuery.trim().slice(0, MAX_QUERY_LENGTH);
}

function extractSuggestions(payload: unknown): string[] {
  if (!Array.isArray(payload) || !Array.isArray(payload[1])) {
    return [];
  }

  const deduped = new Set<string>();

  for (const item of payload[1]) {
    if (typeof item !== "string") {
      continue;
    }
    const normalizedItem = item.trim();
    if (!normalizedItem) {
      continue;
    }
    deduped.add(normalizedItem);
    if (deduped.size >= MAX_SUGGESTIONS) {
      break;
    }
  }

  return Array.from(deduped);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const query = normalizeQuery(req.nextUrl.searchParams.get("query"));
  if (!query) {
    return NextResponse.json({ suggestions: [] });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.bing.com/osjson.aspx?query=${encodeURIComponent(query)}`, {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const payload: unknown = await response.json();
    const suggestions = extractSuggestions(payload);
    return NextResponse.json(
      { suggestions },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      return NextResponse.json({ suggestions: [] });
    }
    return NextResponse.json({ suggestions: [] });
  } finally {
    clearTimeout(timeout);
  }
}
