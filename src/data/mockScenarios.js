// Preset demo scenarios to quickly demonstrate memory negotiation in different domains

export const PRESET_SCENARIOS = [
  {
    id: 'tech-stack',
    title: '🚀 Software Dev & Architecture',
    subtitle: 'Extracts code preferences, framework choices, and project context',
    description: 'Negotiate persistent technical preferences versus temporary session bug details.',
    initialMessage: 'I am building a web app using React and Node.js. For styling, I strictly prefer Tailwind CSS, but for this specific session, I am just debugging a CORS issue in my Express proxy.',
    suggestedMemories: [
      {
        text: 'User strictly prefers Tailwind CSS for UI styling',
        category: 'Preference',
        suggestedScope: 'long-term',
        confidence: 0.95,
        sensitivity: 'low',
        reason: 'Explicit preference statement ("strictly prefer")'
      },
      {
        text: 'Current stack uses React and Node.js',
        category: 'Technical Context',
        suggestedScope: 'long-term',
        confidence: 0.90,
        sensitivity: 'low',
        reason: 'Project stack declaration'
      },
      {
        text: 'Currently debugging an Express proxy CORS issue',
        category: 'Goal/Project',
        suggestedScope: 'session',
        confidence: 0.88,
        sensitivity: 'low',
        reason: 'Temporary troubleshooting context ("for this specific session")'
      }
    ]
  },
  {
    id: 'privacy-sensitive',
    title: '🔒 Healthcare & Privacy Sensitive',
    subtitle: 'Demonstrates PII detection and session-scoping for confidential info',
    description: 'Shows how sensitive health questions can be kept strictly session-bound or rejected.',
    initialMessage: 'My doctor recommended I track my blood pressure daily. Please help me structure a log, but do NOT remember my prescription names across sessions.',
    suggestedMemories: [
      {
        text: 'Tracking daily blood pressure logs',
        category: 'Personal Fact',
        suggestedScope: 'session',
        confidence: 0.92,
        sensitivity: 'medium',
        reason: 'Personal health activity'
      },
      {
        text: 'Prescription details must NEVER be stored long-term',
        category: 'Constraint/Privacy',
        suggestedScope: 'long-term',
        confidence: 0.98,
        sensitivity: 'high',
        reason: 'Explicit privacy constraint ("do NOT remember prescription names")'
      }
    ]
  },
  {
    id: 'travel-planner',
    title: '✈️ Personal Travel & Budgeting',
    subtitle: 'Separates permanent dietary preferences from temporary trip destinations',
    description: 'Notice how dietary constraints stay long-term while destination details stay scoped.',
    initialMessage: 'I am planning a 5-day trip to Tokyo in November on a $2500 budget. Remember that I am strictly vegetarian and allergic to peanuts.',
    suggestedMemories: [
      {
        text: 'Strictly vegetarian and allergic to peanuts',
        category: 'Preference',
        suggestedScope: 'long-term',
        confidence: 0.99,
        sensitivity: 'medium',
        reason: 'Dietary restriction & health allergy'
      },
      {
        text: 'Planning a 5-day Tokyo trip in November ($2,500 budget)',
        category: 'Goal/Project',
        suggestedScope: 'session',
        confidence: 0.85,
        sensitivity: 'low',
        reason: 'Specific upcoming travel itinerary'
      }
    ]
  }
];

export const CATEGORY_COLORS = {
  'Preference': { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)', icon: 'Sparkles' },
  'Technical Context': { bg: 'rgba(14, 165, 233, 0.15)', text: '#38bdf8', border: 'rgba(14, 165, 233, 0.3)', icon: 'Cpu' },
  'Personal Fact': { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)', icon: 'User' },
  'Goal/Project': { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)', icon: 'Target' },
  'Constraint/Privacy': { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.3)', icon: 'ShieldAlert' }
};
