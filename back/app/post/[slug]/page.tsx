import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { createCommentAction } from '../actions';

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { createdAt: 'desc' },
      },
      comments: {
        where: { approved: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!post || !post.published) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-semibold">No encontrado</h1>
        <p className="mt-2 text-sm text-muted">El artículo no existe o no está publicado.</p>
        <Link href="/" className="mt-6 inline-block underline">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Link href="/" className="text-sm underline">
        ← Volver
      </Link>

      <h1 className="mt-6 text-3xl font-semibold leading-tight">{post.title}</h1>
      <p className="mt-2 text-sm text-muted">Publicado el {post.createdAt.toLocaleDateString()}</p>

      {post.images.length > 0 ? (
        <section className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {post.images.map((img) => (
              <figure key={img.id} className="overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? ''} className="h-56 w-full object-cover" />
                {img.alt ? <figcaption className="p-3 text-sm text-muted">{img.alt}</figcaption> : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <article className="mt-8 whitespace-pre-wrap text-base leading-7 text-foreground">
        {post.content}
      </article>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Comentarios</h2>

        <form action={createCommentAction.bind(null, post.slug)} className="mt-6 space-y-3 rounded-lg border border-border p-4">
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <input name="authorName" required className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Comentario</label>
            <textarea name="body" required rows={4} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2" />
          </div>
          <button className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/90" type="submit">
            Enviar
          </button>
        </form>

        <div className="mt-6 space-y-4">
          {post.comments.length === 0 ? (
            <p className="text-sm text-muted">Todavía no hay comentarios.</p>
          ) : (
            post.comments.map((c) => (
              <div key={c.id} className="rounded-lg border border-border p-4">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-medium">{c.authorName}</p>
                  <p className="text-xs text-muted">{c.createdAt.toLocaleString()}</p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{c.body}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
