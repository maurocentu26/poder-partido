# Poder Blog

Blog simple con:

- Home con listado de artículos publicados
- Página de artículo con comentarios públicos
- Área de admin protegida para crear/editar/publicar artículos

Tecnologías:

- Next.js (App Router) + TypeScript + Tailwind
- Prisma ORM v7 + PostgreSQL (recomendado en producción)

## Requisitos

- Node.js instalado
- Windows PowerShell o terminal integrada de VS Code

## Setup (local)

1) Instalar dependencias

```bash
npm install
```

2) Configurar la base de datos

Para local podés usar PostgreSQL (mismo flujo que producción) o, si preferís, mantener una DB local para pruebas.

En Vercel, usá PostgreSQL sí o sí (Neon / Supabase / Vercel Postgres) y seteá `DATABASE_URL`.

3) Crear y migrar la base de datos

```bash
npm run db:migrate
```

4) Crear usuario admin inicial (lee variables desde variables de entorno)

```bash
npm run db:seed
```

5) Levantar el servidor

```bash
npm run dev
```

Abrir http://localhost:3000

## Admin

- Login: http://localhost:3000/admin/login
- Para crear/actualizar el usuario admin usá `npm run db:seed`.
- Variables esperadas (ver `back/.env.example`):
	- `ADMIN_EMAIL`
	- `ADMIN_PASSWORD`

## Scripts útiles

- `npm run db:studio` abre Prisma Studio
- `npm run lint` corre ESLint

## Notas

- Prisma ORM v7 usa `prisma.config.ts` para configurar `DATABASE_URL`.
- En Vercel, SQLite no es recomendable (filesystem efímero). Usá PostgreSQL.

## Deploy (Vercel)

1) Crear una DB PostgreSQL (Neon/Supabase/Vercel Postgres) y obtener `DATABASE_URL`.
2) En Vercel, importar el repo y setear **Root Directory = `back`**.
3) Variables de entorno en Vercel (Production + Preview):
	- `DATABASE_URL`
	- `DIRECT_URL` (recomendado; necesario si `DATABASE_URL` usa pooler como Supabase :6543)
	- `ADMIN_EMAIL`
	- `ADMIN_PASSWORD`
	- `CORS_ORIGINS` (URL del front)
4) El deploy corre migraciones automáticamente (el script `build` ejecuta `prisma migrate deploy`).
5) Crear/actualizar el admin (una vez):

```powershell
cd back
$env:DATABASE_URL="TU_DATABASE_URL";
$env:ADMIN_EMAIL="admin@tu-dominio.com";
$env:ADMIN_PASSWORD="una-clave-fuerte";
npm run db:seed
```

El seed hace *upsert*: si el email ya existe, actualiza la contraseña.
