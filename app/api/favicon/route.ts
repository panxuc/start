import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const MIN_SIZE = 16;
const MAX_SIZE = 128;
const DEFAULT_SIZE = 64;
const FETCH_TIMEOUT_MS = 2500;

function clampSize(rawSize: string | null): number {
  const parsed = Number.parseInt(rawSize ?? "", 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_SIZE;
  }
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, parsed));
}

function normalizeDomain(rawDomain: string | null): string | null {
  if (!rawDomain) {
    return null;
  }

  const candidate = rawDomain.trim();
  if (!candidate) {
    return null;
  }

  try {
    const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    if (!hostname || hostname.length > 253) {
      return null;
    }
    if (!/^[a-z0-9.-]+$/.test(hostname) || hostname.startsWith(".") || hostname.includes("..")) {
      return null;
    }
    return hostname;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  const domain = normalizeDomain(request.nextUrl.searchParams.get("domain"));
  if (!domain) {
    return NextResponse.json({ error: "Invalid domain param" }, { status: 400 });
  }

  const size = clampSize(request.nextUrl.searchParams.get("size"));
  const providers = [
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`,
    `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`,
  ];

  for (const providerUrl of providers) {
    try {
      const response = await fetchWithTimeout(providerUrl);
      if (!response.ok) {
        continue;
      }

      const contentType = response.headers.get("content-type") || "image/x-icon";
      const arrayBuffer = await response.arrayBuffer();

      if (arrayBuffer.byteLength === 0) {
        continue;
      }

      return new NextResponse(arrayBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400",
        },
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: "Icon not found" }, { status: 404 });
}
