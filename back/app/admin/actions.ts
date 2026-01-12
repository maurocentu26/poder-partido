'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSession, destroySession, requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/slug';
import { saveUploadedImage } from '@/lib/uploads';

const loginSchema = z.object({
  email: z.string().trim().min(3).max(200),
  password: z.string().min(1),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    password: String(formData.get('password') ?? ''),
  });

  if (!parsed.success) {
    redirect('/admin/login?error=' + encodeURIComponent('Email o contraseña inválidos.'));
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) redirect('/admin/login?error=' + encodeURIComponent('Email o contraseña inválidos.'));

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) redirect('/admin/login?error=' + encodeURIComponent('Email o contraseña inválidos.'));

  await createSession(user.id);
  redirect('/admin');
}

export async function logoutAction() {
  await destroySession();
  redirect('/');
}

const postSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(1),
  content: z.string().min(1),
  published: z.boolean(),
});

function parseCheckbox(v: FormDataEntryValue | null) {
  return v === 'on' || v === 'true' || v === '1';
}

export async function createPostAction(formData: FormData) {
  const admin = await requireAdmin();

  const rawTitle = String(formData.get('title') ?? '');
  const rawSlugInput = String(formData.get('slug') ?? '').trim();
  const rawSlug = rawSlugInput.length > 0 ? rawSlugInput : slugify(rawTitle);

  const parsed = postSchema.safeParse({
    title: rawTitle,
    slug: rawSlug,
    content: String(formData.get('content') ?? ''),
    published: parseCheckbox(formData.get('published')),
  });

  if (!parsed.success) {
    redirect('/admin/posts/new?error=' + encodeURIComponent('Revisá los campos del artículo.'));
  }

  const baseSlug = slugify(parsed.data.slug);
  if (!baseSlug) redirect('/admin/posts/new?error=' + encodeURIComponent('El slug no puede estar vacío.'));

  let finalSlug = baseSlug;
  let i = 0;
  while (await prisma.post.findUnique({ where: { slug: finalSlug } })) {
    i += 1;
    finalSlug = `${baseSlug}-${i}`;
  }

  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      slug: finalSlug,
      content: parsed.data.content,
      published: parsed.data.published,
      authorId: admin.id,
    },
  });

  const file = formData.get('image');
  const alt = String(formData.get('alt') ?? '').trim();

  if (file instanceof File && file.size > 0) {
    try {
      const saved = await saveUploadedImage(file);
      await prisma.postImage.create({
        data: {
          postId: post.id,
          url: saved.url,
          alt: alt.length ? alt : null,
        },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo subir la imagen.';
      revalidatePath('/');
      revalidatePath(`/post/${post.slug}`);
      redirect(`/admin/posts/${post.id}/edit?error=` + encodeURIComponent(msg));
    }
  }

  revalidatePath('/');
  revalidatePath(`/post/${post.slug}`);

  if (post.published) {
    revalidatePath('/admin');
    redirect('/admin?success=post_created');
  }

  redirect(`/admin/posts/${post.id}/edit?draft=1`);
}

export async function updatePostAction(postId: string, formData: FormData) {
  const admin = await requireAdmin();

  const parsed = postSchema.safeParse({
    title: String(formData.get('title') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    content: String(formData.get('content') ?? ''),
    published: parseCheckbox(formData.get('published')),
  });

  if (!parsed.success) {
    redirect(`/admin/posts/${postId}/edit?error=` + encodeURIComponent('Revisá los campos del artículo.'));
  }

  const baseSlug = slugify(parsed.data.slug);
  if (!baseSlug) redirect(`/admin/posts/${postId}/edit?error=` + encodeURIComponent('El slug no puede estar vacío.'));

  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) redirect('/admin?error=' + encodeURIComponent('Artículo no encontrado.'));

  let finalSlug = baseSlug;
  if (baseSlug !== existing.slug) {
    let i = 0;
    while (await prisma.post.findFirst({ where: { slug: finalSlug, NOT: { id: postId } } })) {
      i += 1;
      finalSlug = `${baseSlug}-${i}`;
    }
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      title: parsed.data.title,
      slug: finalSlug,
      content: parsed.data.content,
      published: parsed.data.published,
      authorId: admin.id,
    },
  });

  revalidatePath('/');
  revalidatePath(`/post/${finalSlug}`);
  revalidatePath('/admin');

  // Si era borrador y ahora se publica, volvemos al panel con un toast.
  if (!existing.published && parsed.data.published) {
    redirect('/admin?success=post_published');
  }

  redirect(`/admin/posts/${postId}/edit?saved=1`);
}

export async function deletePostAction(postId: string) {
  await requireAdmin();
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin');
}

export async function uploadPostImageAction(postId: string, formData: FormData) {
  await requireAdmin();

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) redirect('/admin?error=' + encodeURIComponent('Artículo no encontrado.'));

  const file = formData.get('image');
  const alt = String(formData.get('alt') ?? '').trim();

  if (!(file instanceof File) || file.size === 0) {
    redirect(`/admin/posts/${postId}/edit`);
  }

  try {
    const saved = await saveUploadedImage(file);
    await prisma.postImage.create({
      data: {
        postId,
        url: saved.url,
        alt: alt.length ? alt : null,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'No se pudo subir la imagen.';
    redirect(`/admin/posts/${postId}/edit?error=` + encodeURIComponent(msg));
  }

  revalidatePath(`/admin/posts/${postId}/edit`);
  revalidatePath(`/post/${post.slug}`);
  redirect(`/admin/posts/${postId}/edit`);
}

export async function deletePostImageAction(postId: string, imageId: string) {
  await requireAdmin();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) redirect('/admin?error=' + encodeURIComponent('Artículo no encontrado.'));

  await prisma.postImage.delete({ where: { id: imageId } });

  revalidatePath(`/admin/posts/${postId}/edit`);
  revalidatePath(`/post/${post.slug}`);
  redirect(`/admin/posts/${postId}/edit`);
}
