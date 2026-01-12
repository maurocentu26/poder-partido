import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deletePostImageAction, updatePostAction, uploadPostImageAction } from '../../../actions';

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; draft?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error, saved, draft } = await searchParams;

  const post = await prisma.post.findUnique({
    where: { id },
    include: { images: { orderBy: { createdAt: 'desc' } } },
  });
  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm text-muted">Artículo no encontrado.</p>
        <Link href="/admin" className="mt-4 inline-block underline">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Editar artículo</h1>
          <p className="mt-1 text-sm text-muted">ID: {post.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="btn-link">
            Volver
          </Link>
          <Link href={`/post/${post.slug}`} className="btn-link">
            Ver
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-md border border-skin/70 bg-skin/40 px-3 py-2 text-sm text-foreground">
          {error}
        </div>
      ) : null}

      {saved ? (
        <div className="mt-6 rounded-md border border-navy/20 bg-navy/10 px-3 py-2 text-sm text-navy">
          Guardado.
        </div>
      ) : null}

      {draft ? (
        <div className="mt-6 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground">
          Guardado como <span className="font-semibold">borrador</span>. Marcá “Publicado” y tocá “Guardar” para publicarlo.
        </div>
      ) : null}

      <form action={updatePostAction.bind(null, post.id)} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium">Título</label>
          <input
            name="title"
            required
            defaultValue={post.title}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input
            name="slug"
            required
            defaultValue={post.slug}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Contenido</label>
          <textarea
            name="content"
            required
            rows={14}
            defaultValue={post.content}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input name="published" type="checkbox" className="h-4 w-4" defaultChecked={post.published} />
          Publicado
        </label>

        <button className="btn btn-primary" type="submit">
          Guardar
        </button>
      </form>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Imágenes</h2>
        <p className="mt-1 text-sm text-muted">Subí imágenes para mostrar debajo del artículo.</p>

        <form
          action={uploadPostImageAction.bind(null, post.id)}
          className="mt-6 space-y-3 rounded-lg border border-border p-4"
        >
          <div>
            <label className="block text-sm font-medium">Imagen</label>
            <input name="image" type="file" accept="image/*" className="mt-1 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium">Alt (opcional)</label>
            <input name="alt" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2" placeholder="Descripción de la imagen" />
          </div>
          <button className="btn btn-primary" type="submit">
            Subir imagen
          </button>
        </form>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {post.images.length === 0 ? (
            <p className="text-sm text-muted">Todavía no hay imágenes.</p>
          ) : (
            post.images.map((img) => (
              <div key={img.id} className="overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? ''} className="h-48 w-full object-cover" />
                <div className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted">{img.url}</p>
                    {img.alt ? <p className="truncate text-sm">{img.alt}</p> : null}
                  </div>
                  <form action={deletePostImageAction.bind(null, post.id, img.id)}>
                    <button type="submit" className="btn btn-danger px-3 py-1.5">
                      Borrar
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
