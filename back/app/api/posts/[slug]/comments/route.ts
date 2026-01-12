import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { corsHeaders } from '@/lib/cors';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const commentSchema = z.object({
  authorName: z.string().trim().min(2).max(50),
  body: z.string().trim().min(2).max(1000),
});

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      id: true,
      published: true,
    },
  });

  if (!post || !post.published) {
    return NextResponse.json({ error: 'Post no encontrado.' }, { status: 404, headers: corsHeaders(req) });
  }

  const comments = await prisma.comment.findMany({
    where: { postId: post.id, approved: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      authorName: true,
      body: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    { items: comments },
    {
      headers: {
        ...corsHeaders(req),
        'Cache-Control': 'no-store',
      },
    },
  );
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400, headers: corsHeaders(req) });
  }

  const parsed = commentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos.', issues: parsed.error.issues },
      { status: 400, headers: corsHeaders(req) },
    );
  }

  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      id: true,
      published: true,
    },
  });

  // Solo permitir comentarios en posts publicados.
  if (!post || !post.published) {
    // Nota: no revelamos si existe pero no está publicado.
    return NextResponse.json({ error: 'Post no encontrado.' }, { status: 404, headers: corsHeaders(req) });
  }

  // Anti-abuso mínimo: si es un admin logueado, igual permite.
  // (No imponemos captcha/rate-limit en esta versión.)
  await getSessionUser();

  const created = await prisma.comment.create({
    data: {
      postId: post.id,
      authorName: parsed.data.authorName,
      body: parsed.data.body,
      approved: true,
    },
    select: {
      id: true,
      authorName: true,
      body: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    { item: created },
    {
      status: 201,
      headers: {
        ...corsHeaders(req),
        'Cache-Control': 'no-store',
      },
    },
  );
}
