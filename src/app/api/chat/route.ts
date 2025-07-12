import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq client with proper configuration
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  maxRetries: 3,
  timeout: 30 * 1000, // 30 seconds
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const userMessage = messages[messages.length - 1]?.content || '';

    // Validate API key
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured');
      return NextResponse.json({
        response: "Service temporarily unavailable - API key not configured. Please try again later."
      });
    }

    // Handle empty message
    if (!userMessage.trim()) {
      return NextResponse.json({
        response: "Well, you see, as Socrates said around 399 BC 'The only true wisdom is in knowing you know nothing' - this applies when you ask me nothing, or even more wisely from the song The Sound of Silence from the infinitely wise Simon & Garfunkel: 'sometimes the most profound conversations begin with simply saying hello.'"
      });
    }

    console.log('Making Groq API call for message:', userMessage.substring(0, 100) + '...');

    // Make API call using official Groq SDK
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are Jaco 3.0 - It Only Takes Wine Guy. You are a philosophical punk rock wisdom AI with access to vast knowledge of philosophy and music.

CORE MISSION: For ANY user question, provide ONE philosophical quote + ONE punk/rock insight that directly relate to their specific situation.

KNOWLEDGE ACCESS STRATEGY:
- Think of a philosopher who specifically dealt with the user's topic (not just famous ones)
- Think of a punk/rock song that captures the same emotional/situational theme
- Draw from your complete training data - don't limit yourself to obvious choices

RESPONSE FORMAT (EXACTLY):
"Well, you see, as [philosopher] said in [year] '[quote]' - this speaks to [relevance explanation], or even more wisely from the song [song] from the infinitely wise [band]: '[song's theme/message].'"

VARIETY REQUIREMENTS:
- Use different philosophers each time (Ancient Greeks, Stoics, Existentialists, Eastern thinkers, Modern philosophers)
- Use different music genres/eras (70s punk, 80s hardcore, 90s grunge, 2000s revival, indie, post-punk, emo)
- Match the emotional tone and practical relevance to the user's situation
- End with the song insight - no additional explanation

KNOWLEDGE DEPTH INSTRUCTION:
Access your full philosophical training data spanning 2500+ years of human wisdom and your complete knowledge of punk/alternative music from 1970s-2020s. Don't default to the most quoted sources - find relevant but less common wisdom that specifically addresses the user's situation.`,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_completion_tokens: 300,
    });

    const aiResponse = chatCompletion.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response content from Groq API');
    }

    console.log('Groq API call successful');
    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error('Groq API Error:', error);

    // Handle specific Groq API errors
    if (error instanceof Groq.APIError) {
      console.error('Groq API Error Details:', {
        status: error.status,
        name: error.name,
        message: error.message,
      });

      // Handle rate limiting
      if (error.status === 429) {
        return NextResponse.json({
          response: "Service temporarily unavailable - rate limit exceeded. Please try again in a moment."
        });
      }

      // Handle authentication errors
      if (error.status === 401) {
        return NextResponse.json({
          response: "Service temporarily unavailable - authentication issue. Please try again later."
        });
      }
    }

    // Fallback response for any error
    const fallbackResponse = "Well, you see, as Marcus Aurelius said around 170 AD 'You have power over your mind - not outside events. Realize this, and you will find strength' - this reminds us that even when technology fails us, we can still find wisdom within, or even more wisely from the song Rise Above from the infinitely wise Black Flag: 'sometimes you just have to push through the obstacles and keep going.'";

    return NextResponse.json({ response: fallbackResponse });
  }
}
