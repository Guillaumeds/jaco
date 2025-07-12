import { NextRequest, NextResponse } from 'next/server';



export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  // Get the last user message
  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage?.content || '';

  if (!userMessage) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  try {
    // Use Groq API for Jaco's responses
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
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
        temperature: 0.8,
        max_completion_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Well, you see, I'm having trouble connecting to my philosophical punk rock wisdom right now, but as the great philosophers would say, even technical difficulties are part of the human experience!";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error calling Groq API:', error);

    // Simple fallback response if API fails
    const fallbackResponse = "Well, you see, as Marcus Aurelius said around 170 AD 'You have power over your mind - not outside events. Realize this, and you will find strength' - this reminds us that even when technology fails us, we can still find wisdom within, or even more wisely from the song Rise Above from the infinitely wise Black Flag: 'sometimes you just have to push through the obstacles and keep going' - because that's what punk rock teaches us about resilience.";

    return NextResponse.json({ response: fallbackResponse });
  }
}
