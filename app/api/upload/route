import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getCurrentCoupleId } from '@/lib/session';

export async function POST(request: Request): Promise<NextResponse> {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
        maximumSizeInBytes: 8 * 1024 * 1024, // 8MB
        tokenPayload: JSON.stringify({ coupleId }),
      }),
      onUploadCompleted: async () => {
        // No DB write needed here — the client sends the resulting URL to
        // PATCH /api/profile itself once the upload finishes.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
