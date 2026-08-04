// AI Engine supporting Gemini API, OpenAI API, and Smart Offline Simulator

export async function generateAIResponse({
  messages,
  activeMemories = [],
  apiKeyConfig = { provider: 'mock', key: '', model: '' }
}) {
  const activeLongTerm = activeMemories.filter(m => m.scope === 'long-term' && m.status === 'active');
  const activeSession = activeMemories.filter(m => m.scope === 'session' && m.status === 'active');
  const pendingNegotiation = activeMemories.filter(m => m.status === 'pending');

  // Construct system prompt with memory context
  const memorySystemPrompt = buildMemorySystemPrompt(activeLongTerm, activeSession, pendingNegotiation);

  if (apiKeyConfig.provider === 'gemini' && apiKeyConfig.key) {
    return await callGeminiAPI(messages, memorySystemPrompt, apiKeyConfig);
  } else if (apiKeyConfig.provider === 'openai' && apiKeyConfig.key) {
    return await callOpenAIAPI(messages, memorySystemPrompt, apiKeyConfig);
  }

  // Fallback to Smart Offline Simulator
  return await simulateAIResponse(messages, activeLongTerm, activeSession, pendingNegotiation);
}

function buildMemorySystemPrompt(longTerm, session, pending) {
  let prompt = `You are MemoriAI, a clean, direct, and intelligent assistant with a transparent memory system.\n\n`;
  
  if (longTerm.length > 0) {
    prompt += `=== CONFIRMED LONG-TERM MEMORIES ===\n`;
    longTerm.forEach(m => prompt += `- ${m.text} (${m.category})\n`);
    prompt += `\n`;
  }

  if (session.length > 0) {
    prompt += `=== CONFIRMED SESSION MEMORIES ===\n`;
    session.forEach(m => prompt += `- ${m.text} (${m.category})\n`);
    prompt += `\n`;
  }

  prompt += `INSTRUCTIONS:\n`;
  prompt += `1. Speak directly, naturally, and warmly. Do NOT prefix or wrap your messages with verbose meta-parentheses like "*(Shaped by confirmed long-term memory:...)*".\n`;
  prompt += `2. Integrate relevant context seamlessly into your answer.\n`;
  prompt += `3. Keep responses clean, well-formatted, and concise without unnecessary fluff.`;

  return prompt;
}

async function callGeminiAPI(messages, memorySystemPrompt, apiKeyConfig) {
  const modelName = apiKeyConfig.model || 'gemini-3.6-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKeyConfig.key}`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: memorySystemPrompt }]
    },
    ...messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }))
  ];

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error?.message || `Gemini API error: ${res.statusText}`);
    }

    const data = await res.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I processed your request using active memory context.";
    return {
      text: replyText,
      provider: 'Google Gemini',
      modelUsed: modelName
    };
  } catch (err) {
    console.error("Gemini API call failed, falling back to simulator:", err);
    const sim = await simulateAIResponse(messages, [], [], []);
    return {
      text: `⚠️ **API Error (${err.message})**. Falling back to local smart engine:\n\n` + sim.text,
      provider: 'Local Engine (Fallback)',
      modelUsed: 'Simulator'
    };
  }
}

async function callOpenAIAPI(messages, memorySystemPrompt, apiKeyConfig) {
  const modelName = apiKeyConfig.model || 'gpt-4o-mini';
  const url = 'https://api.openai.com/v1/chat/completions';

  const formattedMessages = [
    { role: 'system', content: memorySystemPrompt },
    ...messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))
  ];

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeyConfig.key}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: formattedMessages
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error?.message || `OpenAI API error: ${res.statusText}`);
    }

    const data = await res.json();
    const replyText = data.choices?.[0]?.message?.content || "I processed your request using active memory context.";
    return {
      text: replyText,
      provider: 'OpenAI',
      modelUsed: modelName
    };
  } catch (err) {
    console.error("OpenAI API call failed, falling back to simulator:", err);
    const sim = await simulateAIResponse(messages, [], [], []);
    return {
      text: `⚠️ **API Error (${err.message})**. Falling back to local smart engine:\n\n` + sim.text,
      provider: 'Local Engine (Fallback)',
      modelUsed: 'Simulator'
    };
  }
}

// Smart local simulator with memory citation and contextual responses
async function simulateAIResponse(messages, longTerm, session, pending) {
  await new Promise(r => setTimeout(r, 400));

  const lastUserMsg = messages.filter(m => m.sender === 'user').slice(-1)[0]?.text || '';
  const lowerMsg = lastUserMsg.toLowerCase();

  let memoryCitations = [];
  let responseParts = [];

  longTerm.forEach(m => memoryCitations.push(`🔒 ${m.text}`));
  session.forEach(m => memoryCitations.push(`⚡ ${m.text}`));

  if (/hello|hi|hey|soham/i.test(lowerMsg)) {
    responseParts.push(`Hi Soham! How can I help you today? Whether we're diving into your current session's Python project, working with your primary stack of TypeScript & React, or discussing UI design, I'm ready to assist!`);
  } else if (/cors|proxy|express|react|node|tailwind|code|python|bug/i.test(lowerMsg)) {
    responseParts.push(`I understand your technical context.`);
    
    const hasTailwind = longTerm.some(m => m.text.toLowerCase().includes('tailwind'));
    if (hasTailwind) {
      responseParts.push(`Applying your preference for Tailwind CSS in code examples.`);
    }

    if (/cors/i.test(lowerMsg)) {
      responseParts.push(`To resolve the Express proxy CORS issue, configure origin headers or use the \`cors\` middleware package:
\`\`\`javascript
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
\`\`\``);
    } else {
      responseParts.push(`Here is how we can structure this component cleanly following your active technical constraints.`);
    }
  } else if (/doctor|blood pressure|prescription|health|diet|vegetarian|allergy/i.test(lowerMsg)) {
    responseParts.push(`I've received your health and lifestyle information.`);
    const privacyConstraint = longTerm.find(m => m.category === 'Constraint/Privacy');
    if (privacyConstraint) {
      responseParts.push(`🛡️ Privacy constraint active: ${privacyConstraint.text}. Details will not persist beyond this conversation.`);
    }
    responseParts.push(`Here is a structured log template:
- **Date & Time**
- **Systolic / Diastolic Reading**
- **Pulse**
- **Notes**`);
  } else if (/trip|tokyo|travel|budget|flight|hotel/i.test(lowerMsg)) {
    responseParts.push(`Sounds like an exciting trip!`);
    responseParts.push(`For a 5-day itinerary under $2,500, allocating ~$150/night for accommodations, ~$40/day for dining, and local transit passes will keep you well within budget.`);
  } else {
    responseParts.push(`Understood. I've updated your active memory context accordingly.`);
  }

  return {
    text: responseParts.join('\n\n'),
    provider: 'Memori Smart Engine',
    modelUsed: 'Simulator',
    citations: memoryCitations
  };
}
