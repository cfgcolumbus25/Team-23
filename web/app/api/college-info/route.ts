import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// API route to get college information from Gemini
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { collegeName, location, credits } = body;

    if (!collegeName) {
      return NextResponse.json(
        { error: 'College name is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    // Create prompt for Gemini - simple basic overview
    const prompt = `Provide a basic overview of ${collegeName}${location ? ` in ${location}` : ''}. Keep it simple and brief - just a few sentences about what the school is known for.`;

    // Use the known working Gemini model - I tested for this
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro-preview-03-25' });
    
    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const info = response.text() || 'No information available.';

    return NextResponse.json({ info });
  } catch (error) {
    console.error('Gemini API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch college information';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

