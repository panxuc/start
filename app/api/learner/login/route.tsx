import { NextResponse } from "next/server";
import { ApiError } from "thu-learn-lib";
import helper from "../helper";

export async function POST(request: Request) {
  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
  }
  // wait at most 5 seconds for timeout
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject({ reason: 'TIMEOUT' });
    }, 5000);
  });
  try {
    await Promise.race([helper.login(username, password), timeout]);
    await helper.login(username, password);
  } catch (e) {
    const error = e as ApiError;
    return NextResponse.json({ message: 'Login failed: ' + (error.toString() ?? 'Unknown error') }, { status: 500 });
  }
  return NextResponse.json({ message: 'Login successful' });
}