import { NextRequest, NextResponse } from "next/server";
import {
  isSiteSettings,
  loadSiteSettings,
  normalizeSiteSettings,
  saveSiteSettings,
} from "../../../lib/site-settings";

const ADMIN_TOKEN_ENV_KEY = "NAVIGATION_ADMIN_TOKEN";

function isAuthorized(request: NextRequest): boolean {
  const expectedToken = process.env[ADMIN_TOKEN_ENV_KEY];
  if (!expectedToken) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return false;
  }

  const [scheme, token] = authHeader.split(" ");
  return scheme?.toLowerCase() === "bearer" && token === expectedToken;
}

function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: "Unauthorized. Use Authorization: Bearer <token>." },
    { status: 401 }
  );
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  const data = await loadSiteSettings();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isSiteSettings(payload)) {
    return NextResponse.json(
      {
        error:
          "Invalid payload. Expected { siteName, faviconUrl, copyrightText, beianText, beianUrl } as strings.",
      },
      { status: 400 }
    );
  }

  try {
    const normalized = normalizeSiteSettings(payload);
    const { url } = await saveSiteSettings(normalized);
    return NextResponse.json({
      ok: true,
      source: "blob",
      blobUrl: url,
      settings: normalized,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to write site settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
