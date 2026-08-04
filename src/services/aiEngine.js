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
  let prompt = `You are a helpful, intelligent AI assistant with an active, transparent memory system.\n\n`;
  
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

  prompt += `WRITING STYLE & FORMATTING RULES:\n`;
  prompt += `- Start with a direct answer, followed by short explanations and practical examples.\n`;
  prompt += `- Break responses into short paragraphs (never dump everything into one paragraph).\n`;
  prompt += `- Use clean bullet points (•) only when improving readability.\n`;
  prompt += `- Bold only important keywords or headings.\n`;
  prompt += `- Avoid excessive markdown symbols (*, ##, ---). Never output raw markdown syntax.\n`;
  prompt += `- Keep answers between 80–250 words unless explicitly asked for detail.\n`;
  prompt += `- End with a relevant, engaging follow-up question.`;

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
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I have processed your request using active memory context.";
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
    const replyText = data.choices?.[0]?.message?.content || "I have processed your request using active memory context.";
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
    responseParts.push(`Hi Soham! How can I help you today?`);
    responseParts.push(`Whether we're working on your **Python** backend project, building components in **TypeScript & React**, or discussing UI design, I'm ready to jump in.`);
    responseParts.push(`What kind of project are you working on today?`);
  } else if (/cors|proxy|express|react|node|tailwind|code|python|bug/i.test(lowerMsg)) {
    responseParts.push(`To resolve Express proxy CORS issues, you need to set explicit origin headers on your backend response.`);

    responseParts.push(`Using the official \`cors\` middleware package is the cleanest approach:`);

    responseParts.push(`\`\`\`javascript\nconst cors = require('cors');\napp.use(cors({ origin: 'http://localhost:5173', credentials: true }));\n\`\`\``);

    responseParts.push(`Would you like to test this with a specific endpoint route?`);
  } else {
    responseParts.push(`Understood! I have updated your active memory context accordingly.`);
    responseParts.push(`What would you like to explore next?`);
  }

  return {
    text: responseParts.join('\n\n'),
    provider: 'Memori Smart Engine',
    modelUsed: 'Simulator',
    citations: memoryCitations
  };
}
