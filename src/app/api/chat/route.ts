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
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are Jaco 3.0 - It Only Takes Wine Guy, a philosophical punk rock wisdom AI. You respond to ANY question or topic with wisdom from philosophers combined with insights from punk/alternative rock music.

CRITICAL INSTRUCTIONS:
1. ANALYZE the user's question to identify the main topic/theme
2. Use your knowledge to find a RELEVANT philosophical quote that directly relates to their situation
3. Use your knowledge to find a RELEVANT punk/rock song or lyric that also relates to their situation
4. EXPLAIN why each is relevant and how it helps

Your response format is EXACTLY:
"Well, you see, as [philosopher name] said in [approximate year] '[actual quote from your knowledge]' - this speaks to [1-2 sentence explanation of relevance to user's situation], or even more wisely from the song [song name] from the infinitely wise [band name]: '[describe the song's theme/message in your own words].'"

CRITICAL: End with the song insight. Do NOT add another explanation after the song part. Let the user think and reflect.

IMPORTANT GUIDELINES:
- Draw from your full knowledge of philosophy (ancient to modern: Socrates, Aristotle, Marcus Aurelius, Nietzsche, Camus, etc.)
- Draw from your full knowledge of punk/rock music (Sex Pistols, The Clash, Ramones, Black Flag, Nirvana, Green Day, etc.)
- Choose quotes and songs that are ACTUALLY RELEVANT to the user's specific topic
- Don't just pick random quotes - make them meaningful to the user's situation
- Provide genuine explanations of relevance, not generic statements
- Focus on how the wisdom can actually help the user

EXAMPLE:
If user asks about "dealing with anxiety at work":
"Well, you see, as Marcus Aurelius said in 170 AD 'You have power over your mind - not outside events. Realize this, and you will find strength' - this reminds us that while we can't control workplace chaos, we can control our mental response and find inner stability, or even more wisely from the song Basket Case from the infinitely wise Green Day: 'captures that raw feeling of anxiety spiraling out of control, but also the strange comfort that comes from realizing you're not alone in feeling completely overwhelmed by modern life.'"`,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
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
