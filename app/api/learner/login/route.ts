import { NextResponse } from "next/server";
import { ApiError } from "thu-learn-lib";
import { login } from "../actions";

export async function POST(request: Request) {
  const { username, password, save } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
  }
  try {
    login(username, password, save);
  } catch (e) {
    const error = e as ApiError;
    return NextResponse.json({ message: 'Login failed: ' + (error.toString() ?? 'Unknown error') }, { status: 500 });
  }
  return NextResponse.json({ message: 'Login successful' });
}
