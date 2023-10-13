import { NextResponse } from "next/server";
import { loadSiteSettings } from "../../lib/site-settings";

export async function GET() {
  const data = await loadSiteSettings();
  return NextResponse.json(data);
}
