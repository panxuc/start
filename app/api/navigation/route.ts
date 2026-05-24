import { NextResponse } from "next/server";
import { loadNavigation } from "../../lib/navigation-store";

export async function GET() {
  const data = await loadNavigation();
  return NextResponse.json(data);
}
