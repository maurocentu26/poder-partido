import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold">
            Poder Blog
          </Link>
          <Link href="/admin" className="text-sm underline">
            Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Artículos</h1>
        <p className="mt-2 text-sm text-muted">Leé y dejá tu opinión en los comentarios.</p>

        <div className="mt-8 grid gap-4">
          {posts.length === 0 ? (
            <div className="rounded-lg border border-border p-6 text-sm text-muted">
              Todavía no hay artículos publicados.
            </div>
          ) : (
            posts.map((p) => (
              <Link
                key={p.id}
                href={`/post/${p.slug}`}
                className="block rounded-lg border border-border p-6 hover:bg-surface"
              >
                <h2 className="text-xl font-semibold">{p.title}</h2>
                <p className="mt-2 text-sm text-muted">
                  {p.createdAt.toLocaleDateString()} · /post/{p.slug}
                </p>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
