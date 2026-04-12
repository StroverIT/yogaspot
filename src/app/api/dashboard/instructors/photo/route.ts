import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

import { assertStudioWriteAccess, jsonError, requireRole } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const bucket = process.env.SUPABASE_STORAGE_BUCKET_STUDIO_IMAGES;
  if (!bucket) {
    return NextResponse.json({ error: 'Missing SUPABASE_STORAGE_BUCKET_STUDIO_IMAGES' }, { status: 500 });
  }

  const formData = await request.formData();
  const studioId = String(formData.get('studioId') ?? '').trim();
  const file = formData.get('file');

  if (!studioId) return jsonError('Missing studioId', 400);
  if (!(file instanceof File) || !file.size) return jsonError('Missing file', 400);

  const access = await assertStudioWriteAccess(gate.user, studioId);
  if (!access.ok) return access.response;

  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
    select: { businessId: true },
  });
  if (!studio) return jsonError('Studio not found', 404);

  const mime = file.type ?? '';
  if (!mime.startsWith('image/')) {
    return jsonError('Файлът трябва да е изображение.', 400);
  }

  const originalName = String(file.name);
  const ext = originalName.includes('.') ? originalName.split('.').pop() : undefined;
  const safeExt = ext ? ext.toLowerCase().replace(/[^a-z0-9]/g, '') : 'bin';
  const objectPath = `instructors/${studio.businessId}/${randomUUID()}${safeExt ? `.${safeExt}` : ''}`;

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(objectPath, fileBuffer, {
      contentType: mime || 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) {
    const message = `Качването на снимката не успя: ${uploadError.message}. Уверете се, че bucket „${bucket}" съществува в Supabase Storage и е публичен.`;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(uploadData.path);
  return NextResponse.json({ url: publicUrlData.publicUrl });
}
