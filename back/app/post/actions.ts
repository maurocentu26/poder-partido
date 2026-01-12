'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const commentSchema = z.object({
  authorName: z.string().min(2).max(50),
  body: z.string().min(2).max(1000),
});

export async function createCommentAction(slug: string, formData: FormData) {
  const parsed = commentSchema.safeParse({
    authorName: String(formData.get('authorName') ?? ''),
    body: String(formData.get('body') ?? ''),
  });

  if (!parsed.success) {
    revalidatePath(`/post/${slug}`);
    return;
  }

  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.published) {
    return;
  }

  await prisma.comment.create({
    data: {
      postId: post.id,
      authorName: parsed.data.authorName,
      body: parsed.data.body,
      approved: true,
    },
  });

  revalidatePath(`/post/${slug}`);
}
