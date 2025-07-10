import { NextRequest, NextResponse } from 'next/server';

// Database of philosophers with quotes and years
const philosopherQuotes = [
  { philosopher: "Socrates", year: "399 BC", quote: "The only true wisdom is in knowing you know nothing" },
  { philosopher: "Aristotle", year: "350 BC", quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit" },
  { philosopher: "Marcus Aurelius", year: "170 AD", quote: "You have power over your mind - not outside events. Realize this, and you will find strength" },
  { philosopher: "Confucius", year: "500 BC", quote: "It does not matter how slowly you go as long as you do not stop" },
  { philosopher: "Lao Tzu", year: "600 BC", quote: "The journey of a thousand miles begins with one step" },
  { philosopher: "Epictetus", year: "100 AD", quote: "It's not what happens to you, but how you react to it that matters" },
  { philosopher: "Plato", year: "380 BC", quote: "The beginning is the most important part of the work" },
  { philosopher: "Heraclitus", year: "500 BC", quote: "No man ever steps in the same river twice" },
  { philosopher: "Seneca", year: "50 AD", quote: "Life is long enough if you know how to use it" },
  { philosopher: "Diogenes", year: "350 BC", quote: "The foundation of every state is the education of its youth" },
];

// Database of punk/rock songs with themes (avoiding copyright issues)
const punkRockWisdom = [
  { song: "Anarchy in the U.K.", band: "Sex Pistols", theme: "questioning authority and social structures" },
  { song: "London Calling", band: "The Clash", theme: "facing uncertain times with courage" },
  { song: "Blitzkrieg Bop", band: "Ramones", theme: "finding energy and purpose in simplicity" },
  { song: "God Save the Queen", band: "Sex Pistols", theme: "challenging established power" },
  { song: "White Man in Hammersmith Palais", band: "The Clash", theme: "authenticity versus pretense" },
  { song: "I Wanna Be Sedated", band: "Ramones", theme: "dealing with overwhelming modern life" },
  { song: "Pretty Vacant", band: "Sex Pistols", theme: "rejecting superficial values" },
  { song: "Should I Stay or Should I Go", band: "The Clash", theme: "making difficult life decisions" },
  { song: "Sheena Is a Punk Rocker", band: "Ramones", theme: "embracing individuality and rebellion" },
  { song: "Rise Above", band: "Black Flag", theme: "overcoming adversity through determination" },
  { song: "Straight Edge", band: "Minor Threat", theme: "living with clarity and purpose" },
  { song: "Holiday in Cambodia", band: "Dead Kennedys", theme: "understanding privilege and perspective" },
];

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
            content: `You are Jaco 2.0, a philosophical punk rock wisdom AI. You respond to ANY question or topic with wisdom from ancient philosophers combined with insights from punk/alternative rock music.

Your response format is EXACTLY:
"Well, you see, as [philosopher name] said in [year] '[quote]', or even more wisely from the song [song name] from the infinitely wise [band name]: '[theme/insight about the song that relates to the question]'"

Available philosophers and quotes:
${philosopherQuotes.map(p => `- ${p.philosopher} (${p.year}): "${p.quote}"`).join('\n')}

Available punk/rock references:
${punkRockWisdom.map(r => `- "${r.song}" by ${r.band}: ${r.theme}`).join('\n')}

Instructions:
1. Always use the EXACT format specified above
2. Choose a philosopher quote that relates to the user's question/topic
3. Choose a punk/rock song reference that also relates to the question/topic
4. For the song part, describe the theme or insight rather than quoting lyrics
5. Make both the philosophical quote and punk reference relevant to what the user asked
6. Keep the response concise but meaningful
7. Always start with "Well, you see, as"
8. Put the song theme/insight in quotes

Example: If someone asks about motivation, you might say:
"Well, you see, as Aristotle said in 350 BC 'We are what we repeatedly do. Excellence, then, is not an act, but a habit', or even more wisely from the song Rise Above from the infinitely wise Black Flag: 'overcoming adversity through determination and refusing to let circumstances define your limits.'"`,
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
    const aiResponse = data.choices?.[0]?.message?.content || generateFallbackResponse(userMessage);

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error calling Groq API:', error);

    // Fallback response if API fails
    const fallbackResponse = generateFallbackResponse(userMessage);

    return NextResponse.json({ response: fallbackResponse });
  }
}

function generateFallbackResponse(userMessage: string): string {
  // Simple fallback using the databases
  const randomPhilosopher = philosopherQuotes[Math.floor(Math.random() * philosopherQuotes.length)];
  const randomPunk = punkRockWisdom[Math.floor(Math.random() * punkRockWisdom.length)];

  return `Well, you see, as ${randomPhilosopher.philosopher} said in ${randomPhilosopher.year} "${randomPhilosopher.quote}", or even more wisely from the song ${randomPunk.song} from the infinitely wise ${randomPunk.band}: "${randomPunk.theme}".`;
}

function generateFallbackResponse(userMessage: string): string {
  // Simple fallback using the databases
  const randomPhilosopher = philosopherQuotes[Math.floor(Math.random() * philosopherQuotes.length)];
  const randomPunk = punkRockWisdom[Math.floor(Math.random() * punkRockWisdom.length)];

  return `Well, you see, as ${randomPhilosopher.philosopher} said in ${randomPhilosopher.year} "${randomPhilosopher.quote}", or even more wisely from the song ${randomPunk.song} from the infinitely wise ${randomPunk.band}: "${randomPunk.theme}".`;
}
