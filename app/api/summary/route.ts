import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const { notes, name, email } = await req.json();
    if (!notes) {
      return NextResponse.json({ error: 'Missing notes' }, { status: 400 });
    }
    const prompt = `You are an assistant for a CRM app. Given the following notes, generate:\n1. A friendly, detailed, and professional summary email for the user (name: ${name}, email: ${email}) based on the notes. The email should be 3-6 sentences, provide context, and include a warm closing.\n2. A list of 2-4 relevant tags (comma-separated, no # or extra symbols).\n3. A short, actionable next step or follow-up action (1 sentence).\n\nRespond ONLY with valid JSON in this format:\n{\"summary\": \"...\", \"tags\": \"tag1, tag2, tag3\", \"next_steps\": \"...\"}\n\nNotes:\n${notes}`;
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for a CRM app.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 350,
    });
    let content = chat.choices[0]?.message?.content?.trim() || '{}';
    // Remove code block markers if present
    if (content.startsWith('```json')) {
      content = content.replace(/```json|```/g, '').trim();
    }
    let result = {};
    try {
      result = JSON.parse(content);
    } catch {
      result = { summary: content, tags: '', next_steps: '' };
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to generate summary.' }, { status: 500 });
  }
}
