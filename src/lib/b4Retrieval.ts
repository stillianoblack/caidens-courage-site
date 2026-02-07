/**
 * B-4 Chatbot Content Grounding / Retrieval Module
 * Simple keyword-based retrieval for injecting relevant knowledge snippets into chat responses
 */

interface KnowledgeSnippet {
  id: string;
  text?: string;
  q?: string;
  a?: string;
}

interface KnowledgeSection {
  id: string;
  title: string;
  tags: string[];
  audiences: string[];
  snippets: KnowledgeSnippet[];
}

interface KnowledgeBase {
  meta: {
    brandName: string;
    assistantName: string;
    lastUpdated: string;
  };
  sections: KnowledgeSection[];
}

interface RetrievalOptions {
  maxSnippets?: number;
  maxSnippetLength?: number;
}

// Stopwords to exclude from keyword matching
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
  'had', 'what', 'said', 'each', 'which', 'their', 'time', 'if',
  'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her',
  'would', 'make', 'like', 'into', 'him', 'has', 'two', 'more',
  'very', 'after', 'words', 'long', 'than', 'first', 'been', 'call',
  'who', 'oil', 'sit', 'now', 'find', 'down', 'day', 'did', 'get',
  'come', 'made', 'may', 'part', 'i', 'me', 'my', 'we', 'our', 'you', 'your'
]);

/**
 * Normalize text: lowercase, strip punctuation, split into words
 */
export function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0 && !STOPWORDS.has(word));
}

/**
 * Detect audience from message history
 * Returns: "parent" | "teacher" | "counselor" | "kid" | "unknown"
 */
export function detectAudience(messages: Array<{ role: string; content: string }>): string {
  if (!messages || messages.length === 0) return 'unknown';

  // Look at the last few messages for context
  const recentMessages = messages.slice(-3).map(m => m.content.toLowerCase()).join(' ');

  // Parent/caregiver indicators
  if (
    recentMessages.includes('parent') ||
    recentMessages.includes('caregiver') ||
    recentMessages.includes('my child') ||
    recentMessages.includes('my kid') ||
    recentMessages.includes('at home') ||
    recentMessages.includes('home')
  ) {
    return 'parent';
  }

  // Teacher indicators
  if (
    recentMessages.includes('teacher') ||
    recentMessages.includes('classroom') ||
    recentMessages.includes('students') ||
    recentMessages.includes('lesson') ||
    recentMessages.includes('school') ||
    recentMessages.includes('educator')
  ) {
    return 'teacher';
  }

  // Counselor indicators
  if (
    recentMessages.includes('counselor') ||
    recentMessages.includes('therapist') ||
    recentMessages.includes('counseling') ||
    recentMessages.includes('therapy')
  ) {
    return 'counselor';
  }

  // Kid indicators (simpler language, first person)
  if (
    recentMessages.includes("i'm") ||
    recentMessages.includes("i feel") ||
    recentMessages.includes("i need") ||
    recentMessages.includes("help me") ||
    (messages.length === 1 && messages[0].content.length < 50)
  ) {
    return 'kid';
  }

  return 'unknown';
}

/**
 * Detect intents from query using keyword matching
 * Returns array of intent strings
 */
export function detectIntents(query: string): string[] {
  const normalized = query.toLowerCase();
  const intents: string[] = [];

  // Download/print intent
  if (
    normalized.includes('download') ||
    normalized.includes('print') ||
    normalized.includes('pdf') ||
    normalized.includes('worksheet') ||
    normalized.includes('printable') ||
    normalized.includes('get') ||
    normalized.includes('file')
  ) {
    intents.push('download/print');
  }

  // Classroom intent
  if (
    normalized.includes('class') ||
    normalized.includes('classroom') ||
    normalized.includes('teacher') ||
    normalized.includes('students') ||
    normalized.includes('lesson') ||
    normalized.includes('school')
  ) {
    intents.push('classroom');
  }

  // Camp/Courage Academy intent
  if (
    normalized.includes('camp') ||
    normalized.includes('courage academy') ||
    normalized.includes('camp courage') ||
    normalized.includes('academy')
  ) {
    intents.push('camp');
  }

  // Calm/reset intent
  if (
    normalized.includes('calm') ||
    normalized.includes('reset') ||
    normalized.includes('meltdown') ||
    normalized.includes('regulation') ||
    normalized.includes('routine') ||
    normalized.includes('feeling') ||
    normalized.includes('emotion') ||
    normalized.includes('anxious') ||
    normalized.includes('worried')
  ) {
    intents.push('calm/reset');
  }

  // Ages intent
  if (
    normalized.includes('age') ||
    normalized.includes('ages') ||
    normalized.includes('grade') ||
    normalized.includes('7-12') ||
    normalized.includes('kindergarten') ||
    normalized.includes('elementary') ||
    normalized.includes('middle school') ||
    normalized.includes('preschool')
  ) {
    intents.push('ages');
  }

  // FAQ intent
  if (
    normalized.includes('how') ||
    normalized.includes('what') ||
    normalized.includes('where') ||
    normalized.includes('when') ||
    normalized.includes('why') ||
    normalized.includes('can i') ||
    normalized.includes('do i need')
  ) {
    intents.push('faq');
  }

  return intents;
}

/**
 * Score a snippet based on query, snippet text, and tags
 * Returns a numeric score
 */
export function scoreSnippet(
  query: string,
  snippetText: string,
  tags: string[],
  intents: string[],
  audience: string,
  sectionAudiences: string[]
): number {
  let score = 0;

  const queryWords = normalize(query);
  const snippetWords = normalize(snippetText);

  // Exact keyword overlap (+2 per match)
  const overlap = queryWords.filter(word => snippetWords.includes(word));
  score += overlap.length * 2;

  // Intent matches tags (+3 per match)
  const intentTagMatches = intents.filter(intent =>
    tags.some(tag => tag.includes(intent.split('/')[0]) || intent.includes(tag))
  );
  score += intentTagMatches.length * 3;

  // Audience match (+2)
  if (sectionAudiences.includes(audience)) {
    score += 2;
  }

  // Bonus for FAQ-style snippets if query is a question
  if (query.trim().endsWith('?') && tags.includes('faq')) {
    score += 1;
  }

  return score;
}

/**
 * Retrieve top N snippets from knowledge base based on query
 */
export function retrieveSnippets(
  query: string,
  knowledgeBase: KnowledgeBase,
  options: RetrievalOptions = {}
): Array<{ id: string; text: string; source: string; score: number }> {
  const {
    maxSnippets = 4,
    maxSnippetLength = 280
  } = options;

  const intents = detectIntents(query);
  const audience = detectAudience([{ role: 'user', content: query }]);

  const scoredSnippets: Array<{
    id: string;
    text: string;
    source: string;
    score: number;
  }> = [];

  // Score all snippets
  for (const section of knowledgeBase.sections) {
    for (const snippet of section.snippets) {
      // Extract text from snippet (handle both text and Q&A formats)
      const snippetText = snippet.text || `${snippet.q || ''} ${snippet.a || ''}`.trim();
      
      if (!snippetText) continue;

      // Truncate if too long
      const truncatedText = snippetText.length > maxSnippetLength
        ? snippetText.substring(0, maxSnippetLength - 3) + '...'
        : snippetText;

      const score = scoreSnippet(
        query,
        snippetText,
        section.tags,
        intents,
        audience,
        section.audiences
      );

      if (score > 0) {
        scoredSnippets.push({
          id: snippet.id,
          text: truncatedText,
          source: `${section.id}/${snippet.id}`,
          score
        });
      }
    }
  }

  // Sort by score (descending) and return top N
  return scoredSnippets
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSnippets);
}

/**
 * Format retrieved snippets as a knowledge pack string for injection into prompt
 */
export function formatKnowledgePack(
  snippets: Array<{ id: string; text: string; source: string }>
): string {
  if (snippets.length === 0) return '';

  const lines = snippets.map(s => `[source: ${s.source}] ${s.text}`);
  return `KNOWLEDGE PACK:\n${lines.join('\n\n')}`;
}
