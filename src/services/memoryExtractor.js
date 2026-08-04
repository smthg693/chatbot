// Heuristics and rule-based memory extraction engine

const PREFERENCE_PATTERNS = [
  /i (?:strictly |always |usually )?prefer (.*?)(?=\.|\!|\;|$| and | but )/i,
  /my (?:favorite|preferred) (?:language|stack|tool|theme|style) is (.*?)(?=\.|\!|\;|$)/i,
  /remember (?:that )?(.*?)(?=\.|\!|\;|$)/i,
  /i am (?:a |an )?(vegetarian|vegan|allergic to [^.!;]+)/i,
  /never (?:suggest|use|give) (.*?)(?=\.|\!|\;|$)/i
];

const SESSION_PATTERNS = [
  /for this (?:session|task|project|conversation)(.*?)(?=[.!;]|$)/i,
  /currently (?:debugging|building|working on) (.*?)(?=[.!;]|$)/i,
  /today i (?:want|need) to (.*?)(?=[.!;]|$)/i,
  /just (?:testing|trying) (.*?)(?=[.!;]|$)/i
];

const HIGH_SENSITIVITY_KEYWORDS = ['password', 'ssn', 'credit card', 'api key', 'secret', 'prescription', 'bank account', 'diagnosis', 'medical record'];
const MEDIUM_SENSITIVITY_KEYWORDS = ['salary', 'address', 'phone', 'email', 'allergy', 'location', 'budget'];

export function extractMemoriesFromText(text, existingMemories = []) {
  const candidates = [];
  const lowerText = text.toLowerCase();

  // Sensitivity check
  let sensitivity = 'low';
  if (HIGH_SENSITIVITY_KEYWORDS.some(kw => lowerText.includes(kw))) {
    sensitivity = 'high';
  } else if (MEDIUM_SENSITIVITY_KEYWORDS.some(kw => lowerText.includes(kw))) {
    sensitivity = 'medium';
  }

  // 1. Check Preference / Long-term patterns
  for (const pattern of PREFERENCE_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const extractedSnippet = match[1].trim();
      if (extractedSnippet.length > 3 && !isDuplicate(extractedSnippet, existingMemories, candidates)) {
        let category = 'Preference';
        if (/never|don't|do not/i.test(pattern.toString()) || lowerText.includes('do not remember')) {
          category = 'Constraint/Privacy';
        }
        candidates.push({
          id: 'mem_cand_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          text: formatMemoryText(extractedSnippet, category),
          category: category,
          suggestedScope: category === 'Constraint/Privacy' ? 'long-term' : 'long-term',
          confidence: 0.92,
          sensitivity: sensitivity,
          reason: `Detected direct preference phrasing in message`,
          rawSnippet: match[0],
          status: 'pending'
        });
      }
    }
  }

  // 2. Check Session-scoped patterns
  for (const pattern of SESSION_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const extractedSnippet = match[1].trim();
      if (extractedSnippet.length > 3 && !isDuplicate(extractedSnippet, existingMemories, candidates)) {
        candidates.push({
          id: 'mem_cand_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          text: `Working on: ${extractedSnippet}`,
          category: 'Goal/Project',
          suggestedScope: 'session',
          confidence: 0.88,
          sensitivity: sensitivity,
          reason: `Scoped to current activity ("${match[0].slice(0, 30)}...")`,
          rawSnippet: match[0],
          status: 'pending'
        });
      }
    }
  }

  // 3. Technology stack detection
  const techMatches = text.match(/\b(React|Vue|Angular|Next\.js|Node\.js|Python|FastAPI|Django|TypeScript|Tailwind|Docker|PostgreSQL|MongoDB|GraphQL|Express|CORS)\b/gi);
  if (techMatches && techMatches.length > 0) {
    const uniqueTech = [...new Set(techMatches.map(t => t.toLowerCase()))];
    const techStr = uniqueTech.map(t => capitalize(t)).join(', ');
    const memText = `Uses tech stack: ${techStr}`;
    
    // Check if session phrasing exists
    const isSessionOnly = /for this (session|project|bug|issue|task)/i.test(text);

    if (!isDuplicate(memText, existingMemories, candidates)) {
      candidates.push({
        id: 'mem_cand_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        text: memText,
        category: 'Technical Context',
        suggestedScope: isSessionOnly ? 'session' : 'long-term',
        confidence: 0.85,
        sensitivity: 'low',
        reason: isSessionOnly ? 'Session-specific technical context' : 'General technical stack mentioned',
        rawSnippet: techMatches.join(', '),
        status: 'pending'
      });
    }
  }

  // 4. Fallback for explicit statements like "I am a ..." or "My name is ..."
  const identityMatch = text.match(/\bi am (?:a |an )?([a-zA-Z0-9\s-]{3,30})(?=[.!;,]|$)/i);
  if (identityMatch && !/building|working|debugging|trying|planning|testing/i.test(identityMatch[1])) {
    const roleText = `User identity/role: ${identityMatch[1].trim()}`;
    if (!isDuplicate(roleText, existingMemories, candidates)) {
      candidates.push({
        id: 'mem_cand_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        text: roleText,
        category: 'Personal Fact',
        suggestedScope: 'long-term',
        confidence: 0.90,
        sensitivity: sensitivity,
        reason: 'Explicit identity or personal detail statement',
        rawSnippet: identityMatch[0],
        status: 'pending'
      });
    }
  }

  return candidates;
}

function formatMemoryText(snippet, category) {
  let cleaned = snippet.trim();
  if (!cleaned.endsWith('.')) cleaned += '.';
  if (category === 'Preference' && !cleaned.toLowerCase().startsWith('user')) {
    return `User prefers ${cleaned}`;
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function isDuplicate(str, listA, listB) {
  const norm = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const check = (item) => (item.text || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes(norm);
  return listA.some(check) || listB.some(check);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
