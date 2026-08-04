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
  let prompt = `You are MemoriAI, an intelligent assistant equipped with a transparent, negotiated memory system.\n\n`;
  
  if (longTerm.length > 0) {
    prompt += `=== CONFIRMED LONG-TERM MEMORIES (Persists across all sessions) ===\n`;
    longTerm.forEach(m => prompt += `- [Long-Term] ${m.text} (${m.category})\n`);
    prompt += `\n`;
  } else {
    prompt += `No long-term memories stored yet.\n\n`;
  }

  if (session.length > 0) {
    prompt += `=== CONFIRMED SESSION MEMORIES (Valid ONLY for current session) ===\n`;
    session.forEach(m => prompt += `- [Session-Scoped] ${m.text} (${m.category})\n`);
    prompt += `\n`;
  } else {
    prompt += `No session-scoped memories active.\n\n`;
  }

  if (pending.length > 0) {
    prompt += `=== PENDING MEMORIES UNDER USER NEGOTIATION ===\n`;
    pending.forEach(m => prompt += `- [Pending Negotiation] ${m.text} (Proposed Scope: ${m.suggestedScope})\n`);
    prompt += `Note: You may acknowledge these candidates if helpful, but remember the user is currently deciding whether to accept, adjust, or discard them.\n\n`;
  }

  prompt += `Always tailor your answer strictly abiding by confirmed memories. Explicitly mention when a confirmed memory is shaping your recommendation!`;
  return prompt;
}

async function callGeminiAPI(messages, memorySystemPrompt, apiKeyConfig) {
  const modelName = apiKeyConfig.model || 'gemini-1.5-flash';
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
  // Simulate network latency
  await new Promise(r => setTimeout(r, 600));

  const lastUserMsg = messages.filter(m => m.sender === 'user').slice(-1)[0]?.text || '';
  const lowerMsg = lastUserMsg.toLowerCase();

  let memoryCitations = [];
  let responseParts = [];

  // Check matched memories
  longTerm.forEach(m => {
    memoryCitations.push(`🔒 Long-Term: "${m.text}"`);
  });

  session.forEach(m => {
    memoryCitations.push(`⚡ Session-Scoped: "${m.text}"`);
  });

  // Construct contextual AI text
  if (/hello|hi|hey/i.test(lowerMsg)) {
    responseParts.push(`Hello! I'm ready to assist you.`);
    if (memoryCitations.length > 0) {
      responseParts.push(`I currently recall ${memoryCitations.length} active negotiated memory item(s) from our vault.`);
    }
  } else if (/cors|proxy|express|react|node|tailwind|code|python|bug/i.test(lowerMsg)) {
    responseParts.push(`I understand your technical context.`);
    
    // Check if Tailwind is in memory
    const hasTailwind = longTerm.some(m => m.text.toLowerCase().includes('tailwind'));
    if (hasTailwind) {
      responseParts.push(`*Note: Applying your confirmed preference for Tailwind CSS in code examples.*`);
    }

    if (/cors/i.test(lowerMsg)) {
      responseParts.push(`To resolve the Express proxy CORS issue, make sure your backend headers explicitly set \`Access-Control-Allow-Origin\`, or use the \`cors\` middleware package:
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
      responseParts.push(`🛡️ *Privacy Guardrail Active*: Complying with your privacy constraint (${privacyConstraint.text}). Sensitive details will not persist beyond this conversation.`);
    }
    responseParts.push(`Here is a structured daily log template you can use:
- **Date & Time**
- **Systolic / Diastolic Reading**
- **Pulse**
- **Notes / Activity**`);
  } else if (/trip|tokyo|travel|budget|flight|hotel/i.test(lowerMsg)) {
    const vegMem = longTerm.find(m => m.text.toLowerCase().includes('vegetarian') || m.text.toLowerCase().includes('peanut'));
    responseParts.push(`Sounds like an exciting trip!`);
    if (vegMem) {
      responseParts.push(`🌱 *Dietary Preference Applied*: Filtering recommendations for vegetarian options and peanut-free dining in Tokyo.`);
    }
    responseParts.push(`For a 5-day itinerary under $2,500, allocating ~$150/night for accommodations, ~$40/day for vegetarian dining (e.g., T's Tantan ramen, Shojin ryori), and local JR passes will keep you well within budget.`);
  } else {
    responseParts.push(`Understood. I have logged your input and evaluated any memory candidates for negotiation.`);
    if (pending.length > 0) {
      responseParts.push(`💡 *Notice*: I've highlighted ${pending.length} candidate memory snippet(s) above for your review. You can choose whether to save them long-term, keep them scoped to this session, or discard them entirely.`);
    }
  }

  const resultText = responseParts.join('\n\n');

  return {
    text: resultText,
    provider: 'Memori Smart Engine (Offline)',
    modelUsed: 'Interactive Simulator',
    citations: memoryCitations
  };
}
