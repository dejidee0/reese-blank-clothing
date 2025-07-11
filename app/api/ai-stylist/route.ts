import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    const itemsDescription = items
      .map((item: any) => `${item.name} (${item.category}) in ${item.colors?.join(', ') || 'various colors'}`)
      .join(', ');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional fashion stylist specializing in streetwear and contemporary fashion. Provide personalized styling advice based on the user's closet items."
        },
        {
          role: "user",
          content: `Based on these items in my closet: ${itemsDescription}

Please provide:
1. 3 complete outfit combinations using these items
2. Styling tips for each combination
3. Suggestions for missing pieces that would complement the wardrobe
4. Color coordination advice
5. Occasion-appropriate styling (casual, street, elevated)

Keep the advice practical, trendy, and focused on streetwear aesthetics.`
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const recommendations = completion.choices[0]?.message?.content || 'Unable to generate recommendations at this time.';

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}