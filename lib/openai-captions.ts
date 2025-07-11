import OpenAI from 'openai';
import { supabase } from './supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  colors?: string[];
  sizes?: string[];
}

export async function generateProductCaption(
  product: Product,
  type: 'description' | 'social' | 'marketing' = 'description'
): Promise<string> {
  const prompts = {
    description: `Write a compelling product description for "${product.name}", a ${product.category} item priced at $${product.price}. Focus on quality, style, and versatility. Keep it under 150 words and make it sound premium but not overly promotional.`,
    social: `Create an engaging social media caption for "${product.name}" that would work well on Instagram. Include relevant hashtags and make it trendy and shareable. Keep it under 100 words.`,
    marketing: `Write persuasive marketing copy for "${product.name}" that highlights its unique selling points and creates urgency. Focus on the value proposition and why customers should buy now. Keep it under 120 words.`
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional copywriter specializing in premium streetwear and fashion brands. Write compelling, authentic copy that resonates with young, style-conscious consumers."
        },
        {
          role: "user",
          content: prompts[type]
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const caption = completion.choices[0]?.message?.content || '';
    
    // Save to database
    await supabase.from('captions').upsert({
      product_id: product.id,
      caption_type: type,
      content: caption,
      ai_model: 'gpt-4',
      is_active: true
    });

    return caption;
  } catch (error) {
    console.error('Error generating caption:', error);
    return '';
  }
}

export async function getProductCaption(productId: string, type: string = 'description'): Promise<string | null> {
  const { data, error } = await supabase
    .from('captions')
    .select('content')
    .eq('product_id', productId)
    .eq('caption_type', type)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data.content;
}