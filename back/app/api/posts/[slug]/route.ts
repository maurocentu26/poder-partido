import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { corsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const user = await getSessionUser();
  const isAdmin = user?.role === 'ADMIN';

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!post) {
    return NextResponse.json(
      { error: 'Post no encontrado.' },
      { status: 404, headers: corsHeaders(_req) },
    );
  }

  if (!post.published && !isAdmin) {
    return NextResponse.json(
      { error: 'Post no encontrado.' },
      { status: 404, headers: corsHeaders(_req) },
    );
  }

  return NextResponse.json(
    {
      id: post.id,
      slug: post.slug,
      title: post.title,
      content: post.content,
      published: post.published,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      images: post.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        createdAt: img.createdAt,
      })),
    },
    {
      headers: {
        ...corsHeaders(_req),
        'Cache-Control': 'no-store',
      },
    },
  );
}
