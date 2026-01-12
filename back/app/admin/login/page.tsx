import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { loginAction } from '../actions';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (user?.role === 'ADMIN') redirect('/admin');

  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="mt-2 text-sm text-muted">Ingresá con tu cuenta autorizada.</p>

      {error ? (
        <div className="mt-6 rounded-md border border-skin/70 bg-skin/40 px-3 py-2 text-sm text-foreground">
          {error}
        </div>
      ) : null}

      <form action={loginAction} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            placeholder="admin@local"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Contraseña</label>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-navy px-4 py-2 text-white hover:bg-navy/90"
        >
          Entrar
        </button>
      </form>

      <p className="mt-6 text-xs text-muted">
        Tip: usuario inicial viene de <code>.env</code> (ADMIN_EMAIL / ADMIN_PASSWORD).
      </p>
    </div>
  );
}
