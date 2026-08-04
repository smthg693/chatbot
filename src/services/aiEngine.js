// AI Engine supporting Gemini API, OpenAI API, and Smart Offline Simulator

export async function generateAIResponse({
  messages,
  activeMemories = [],
  apiKeyConfig = { provider: 'mock', key: '', model: '' }
}) {
  const activeLongTerm = activeMemories.filter(m => m.scope === 'long-term' && m.status === 'active');
  const activeSession = activeMemories.filter(m => m.scope === 'session' && m.status === 'active');
  const pendingNegotiation = activeMemories.filter(m => m.status === 'pending');

  const memorySystemPrompt = buildMemorySystemPrompt(activeLongTerm, activeSession, pendingNegotiation);

  if (apiKeyConfig.provider === 'gemini' && apiKeyConfig.key) {
    return await callGeminiAPI(messages, memorySystemPrompt, apiKeyConfig);
  } else if (apiKeyConfig.provider === 'openai' && apiKeyConfig.key) {
    return await callOpenAIAPI(messages, memorySystemPrompt, apiKeyConfig);
  }

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
  prompt += `1. Speak directly, naturally, and warmly in clear, clean English paragraphs.\n`;
  prompt += `2. Do NOT output raw metadata tags or verbose parenthetical headers like "*(Shaped by confirmed long-term memory...)*".\n`;
  prompt += `3. Format your answers neatly using Markdown with proper spacing and code blocks where applicable.`;

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
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I have processed your request using your active memory context.";
    return {
      text: replyText,
      provider: 'Google Gemini',
      modelUsed: modelName
    };
  } catch (err) {
    console.error("Gemini API call failed, falling back to simulator:", err);
    const sim = await simulateAIResponse(messages, [], [], []);
    return {
      text: `⚠️ **API Notice (${err.message})**. Falling back to local smart engine:\n\n` + sim.text,
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
    const replyText = data.choices?.[0]?.message?.content || "I have processed your request using your active memory context.";
    return {
      text: replyText,
      provider: 'OpenAI',
      modelUsed: modelName
    };
  } catch (err) {
    console.error("OpenAI API call failed, falling back to simulator:", err);
    const sim = await simulateAIResponse(messages, [], [], []);
    return {
      text: `⚠️ **API Notice (${err.message})**. Falling back to local smart engine:\n\n` + sim.text,
      provider: 'Local Engine (Fallback)',
      modelUsed: 'Simulator'
    };
  }
}

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
    responseParts.push(`I've reviewed your request in the context of your current tech stack.`);

    const hasTailwind = longTerm.some(m => m.text.toLowerCase().includes('tailwind'));
    if (hasTailwind) {
      responseParts.push(`I will apply your confirmed preference for **Tailwind CSS** in all UI code snippets.`);
    }

    if (/cors/i.test(lowerMsg)) {
      responseParts.push(`To resolve your Express proxy CORS issue, configure the backend origin headers or apply the official \`cors\` middleware package:

\`\`\`javascript
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
\`\`\``);
    } else {
      responseParts.push(`Here is how we can structure this component cleanly following your active technical preferences and guidelines.`);
    }
  } else if (/doctor|blood pressure|prescription|health|diet|vegetarian|allergy/i.test(lowerMsg)) {
    responseParts.push(`I have updated your health and lifestyle context.`);

    const privacyConstraint = longTerm.find(m => m.category === 'Constraint/Privacy');
    if (privacyConstraint) {
      responseParts.push(`🛡️ **Privacy Guardrail Active**: Complying with your privacy constraint (${privacyConstraint.text}). Sensitive details will not persist beyond this conversation.`);
    }

    responseParts.push(`Here is a clean daily tracking template you can use:

• **Date & Time**
• **Systolic / Diastolic Reading**
• **Pulse Rate**
• **Notes & Observations**`);
  } else if (/trip|tokyo|travel|budget|flight|hotel/i.test(lowerMsg)) {
    responseParts.push(`That sounds like an exciting trip!`);
    responseParts.push(`For a 5-day itinerary under $2,500, allocating ~$150 per night for accommodations and ~$40 per day for dining will keep you comfortably within your budget while leaving room for local transportation passes.`);
  } else {
    responseParts.push(`Understood. I have logged your message and updated your active memory context accordingly.`);
  }

  return {
    text: responseParts.join('\n\n'),
    provider: 'Memori Smart Engine',
    modelUsed: 'Simulator',
    citations: memoryCitations
  };
}
