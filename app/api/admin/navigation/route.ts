import { NextRequest, NextResponse } from "next/server";
import {
  applyAndValidateNavigationOperation,
  type AdminOperation,
} from "../../../lib/navigation-admin";
import { isCategoryMap, validateCategoryMap } from "../../../lib/navigation";
import { loadNavigation, saveNavigation } from "../../../lib/navigation-store";

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
    { error: "未授权：请检查 Admin Token 是否正确，或服务端是否已配置 NAVIGATION_ADMIN_TOKEN。" },
    { status: 401 }
  );
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  const data = await loadNavigation();
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

  if (!isCategoryMap(payload)) {
    return NextResponse.json(
      {
        error: "导航数据格式不正确，应为 { 分类名: [{ name, url, icon? }] }。",
      },
      { status: 400 }
    );
  }

  try {
    const validatedPayload = validateCategoryMap(payload);
    const saved = await saveNavigation(validatedPayload);
    return NextResponse.json({
      ok: true,
      source: saved.source,
      blobUrl: saved.url,
      filePath: saved.path,
      categories: validatedPayload,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "导航数据保存失败";
    const status = /只读配置|START_STORAGE_DRIVER|BLOB_READ_WRITE_TOKEN/.test(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || !("action" in payload)) {
    return NextResponse.json({ error: "Invalid payload. Missing action." }, { status: 400 });
  }

  const operation = payload as AdminOperation;
  const { categories } = await loadNavigation();

  try {
    const result = applyAndValidateNavigationOperation(categories, operation);
    const saved = await saveNavigation(result.next);
    return NextResponse.json({
      ok: true,
      message: result.message,
      source: saved.source,
      blobUrl: saved.url,
      filePath: saved.path,
      categories: result.next,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply operation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
