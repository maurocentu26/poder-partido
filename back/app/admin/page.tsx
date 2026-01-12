import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logoutAction, deletePostAction } from './actions';
import { FlashToast } from './FlashToast';

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  await requireAdmin();
  const { success } = await searchParams;

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {success === 'post_created' ? <FlashToast message="Artículo agregado correctamente." /> : null}
      {success === 'post_published' ? <FlashToast message="Artículo publicado correctamente." /> : null}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="mt-1 text-sm text-muted">Gestioná artículos publicados y borradores.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts/new"
            className="btn btn-primary"
          >
            Nuevo artículo
          </Link>
          <form action={logoutAction}>
            <button className="btn btn-secondary">
              Salir
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-muted">{p.slug}</td>
                <td className="px-4 py-3">
                  {p.published ? (
                    <span className="rounded-full bg-navy/10 px-2 py-1 text-xs text-navy">Publicado</span>
                  ) : (
                    <span className="rounded-full bg-skin/60 px-2 py-1 text-xs text-foreground">Borrador</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/posts/${p.id}/edit`} className="btn btn-secondary px-3 py-1.5">
                      Editar
                    </Link>
                    <form action={deletePostAction.bind(null, p.id)}>
                      <button className="btn btn-danger px-3 py-1.5" type="submit">
                        Borrar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
