import { NextResponse } from 'next/server';

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const response = await fetch(`https://www.baidu.com/sugrec?prod=pc&wd=${encodeURIComponent(query)}`);
    if (!response.ok) {
      console.warn('Failed to fetch suggestions, proceeding without suggestions');
      return NextResponse.json({ suggestions: [] });
    }
    const data = await response.json();

    let suggestions = data.g ? data.g.map((item: { q: string }) => item.q) : [];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
