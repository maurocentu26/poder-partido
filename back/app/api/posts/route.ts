import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { corsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

function clampInt(value: string | null, def: number, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const page = clampInt(url.searchParams.get('page'), 1, 1, 10_000);
  const pageSize = clampInt(url.searchParams.get('pageSize'), 10, 1, 50);

  const includeUnpublished = url.searchParams.get('all') === '1' || url.searchParams.get('all') === 'true';
  const includeContent = url.searchParams.get('includeContent') === '1' || url.searchParams.get('includeContent') === 'true';

  const user = await getSessionUser();
  const isAdmin = user?.role === 'ADMIN';

  const where = includeUnpublished && isAdmin ? {} : { published: true };

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      images: { orderBy: { createdAt: 'asc' } },
    },
  });

  const items = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    content: includeContent && isAdmin ? p.content : undefined,
    published: p.published,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    images: p.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      createdAt: img.createdAt,
    })),
  }));

  return NextResponse.json(
    {
      page,
      pageSize,
      items,
    },
    {
      headers: {
        ...corsHeaders(req),
        'Cache-Control': 'no-store',
      },
    },
  );
}
