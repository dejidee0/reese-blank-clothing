import { NextRequest, NextResponse } from 'next/server';
import { generateProductCaption } from '@/lib/openai-captions';

export async function POST(request: NextRequest) {
  try {
    const { product, type = 'description' } = await request.json();

    if (!product || !product.id) {
      return NextResponse.json(
        { error: 'Product information is required' },
        { status: 400 }
      );
    }

    const caption = await generateProductCaption(product, type);

    return NextResponse.json({ caption });
  } catch (error) {
    console.error('Error generating caption:', error);
    return NextResponse.json(
      { error: 'Failed to generate caption' },
      { status: 500 }
    );
  }
}