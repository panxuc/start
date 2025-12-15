import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return new NextResponse('Missing domain param', { status: 400 });
  }

  const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  try {
    const response = await fetch(googleFaviconUrl);

    if (!response.ok) {
      console.error(`Failed to fetch favicon for ${domain}: ${response.status}`);
      return new NextResponse('Icon not found', { status: 404 });
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        // 关键：设置强缓存
        // public: 允许 CDN 和浏览器缓存
        // max-age=604800: 浏览器缓存 7 天
        // s-maxage=2592000: CDN 缓存 30 天
        // stale-while-revalidate=86400: 缓存过期后 1 天内仍可使用旧缓存，同时后台更新
        'Cache-Control': 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching favicon:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
