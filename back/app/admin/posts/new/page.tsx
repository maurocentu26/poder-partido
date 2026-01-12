import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createPostAction } from '../../actions';

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nuevo artículo</h1>
        <Link href="/admin" className="btn-link">
          Volver
        </Link>
      </div>

      {error ? (
        <div className="mt-6 rounded-md border border-skin/70 bg-skin/40 px-3 py-2 text-sm text-foreground">
          {error}
        </div>
      ) : null}

      <form action={createPostAction} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium">Título</label>
          <input
            name="title"
            required
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Slug (opcional)</label>
          <input
            name="slug"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            placeholder="se-autogenera-si-lo-dejas-vacio"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Contenido</label>
          <textarea
            name="content"
            required
            rows={12}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
            placeholder="Escribí el contenido del artículo..."
          />
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold">Imagen (opcional)</h2>
          <p className="mt-1 text-xs text-muted">
            Podés subir una imagen ahora o después desde “Editar artículo”.
          </p>
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium">Archivo</label>
              <input name="image" type="file" accept="image/*" className="mt-1 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Alt (opcional)</label>
              <input
                name="alt"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                placeholder="Descripción de la imagen"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input name="published" type="checkbox" className="h-4 w-4" />
            Publicar
          </label>
          <p className="mt-2 text-xs text-muted">
            Si querés que el artículo quede visible en el sitio, marcá “Publicar”. Si no, se guardará como borrador.
          </p>
        </div>

        <button className="btn btn-primary" type="submit">
          Crear
        </button>
      </form>
    </div>
  );
}
