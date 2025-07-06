export async function generateGreetingMessage(
  personName: string,
  eventType: string,
  relation: string,
  age: number | null,
  tone: string,
  length: string
): Promise<string> {
  try {
    // Build the prompt based on event type and available information
    let prompt = `Generate a ${length} ${tone} ${eventType} message for ${personName}`;
    
    if (age && eventType === 'birthday') {
      prompt += ` who is turning ${age}`;
    } else if (age && eventType === 'anniversary') {
      prompt += ` celebrating their ${age}${getOrdinalSuffix(age)} anniversary`;
    }
    
    prompt += `. They are my ${relation}. Keep it appropriate for sending as a personal message.`;
    
    // Add tone-specific instructions
    switch (tone) {
      case 'cheerful':
        prompt += ' Make it upbeat and enthusiastic.';
        break;
      case 'heartfelt':
        prompt += ' Make it warm and sincere.';
        break;
      case 'funny':
        prompt += ' Add some light humor appropriate for the relationship.';
        break;
      case 'formal':
        prompt += ' Keep it respectful and professional.';
        break;
    }
    
    // Add length-specific instructions
    switch (length) {
      case 'short':
        prompt += ' Keep it to 1-2 sentences.';
        break;
      case 'medium':
        prompt += ' Keep it to 3-4 sentences.';
        break;
      case 'long':
        prompt += ' Make it 5-6 sentences with more detail.';
        break;
    }

    // Use direct API call to Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No text generated from Gemini API');
    }
    
    return generatedText.trim();
  } catch (error) {
    console.error('Error generating message:', error);
    throw new Error('Failed to generate message');
  }
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}