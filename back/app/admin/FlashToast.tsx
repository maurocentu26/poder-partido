'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function FlashToast({ message, paramKey = 'success' }: { message: string; paramKey?: string }) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const t = window.setTimeout(() => setOpen(false), 2600);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) return;

    const t = window.setTimeout(() => {
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete(paramKey);
      const next = sp.toString();
      router.replace(next ? `${pathname}?${next}` : pathname);
    }, 250);

    return () => window.clearTimeout(t);
  }, [open, paramKey, pathname, router, searchParams]);

  if (!open) return null;

  return (
    <div className="toast toast-success" role="status" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm">
          <div className="font-semibold">Listo</div>
          <div className="mt-0.5 text-muted">{message}</div>
        </div>
        <button type="button" className="btn btn-secondary px-2 py-1" onClick={() => setOpen(false)}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
