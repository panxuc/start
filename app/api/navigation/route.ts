import { NextResponse } from "next/server";
import { loadNavigation } from "../../lib/navigation";

export async function GET() {
  const data = await loadNavigation();
  return NextResponse.json(data);
}
