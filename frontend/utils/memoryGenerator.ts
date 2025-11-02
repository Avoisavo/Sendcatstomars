// Memory generation pipeline
// Similar to ethtokyo's lib/memories/generator.js but adapted for MongoDB

export interface Panel {
  id: string;
  order: number;
  caption: string;
  altText: string;
  imgUrl?: string;
  style?: "bw" | "halftone" | "colorAccent";
}

export interface MoodMetrics {
  primary: "calm" | "anxious" | "sad" | "happy" | "angry" | "mixed" | "neutral";
  valence: number; // -1 to 1
  energy: number; // 0 to 1
  topEmotions: string[];
}

export interface KeyMoment {
  time?: string;
  note: string;
}

export interface SourceRef {
  type: "chat" | "summary";
  id?: string;
  timestamp?: string;
  summary?: string;
}

export interface Memory {
  id: string; // YYYY-MM-DD or unique ID
  date: string; // YYYY-MM-DD
  datetime: Date; // Full datetime object
  timestamp: string; // Human-readable timestamp
  title: string;
  logline: string;
  tags: string[];
  mood: MoodMetrics;
  skillsUsed: string[];
  keyMoments: KeyMoment[];
  panels: Panel[];
  status: "draft" | "generated" | "edited";
  favorite?: boolean;
  sources: SourceRef[];
  contentWarnings?: string[];
  aiSummary: string; // REQUIRED: The AI-generated summary
  userId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatMessage {
  role: string;
  content: string;
  timestamp?: string;
}

interface GenerationOptions {
  tone?: string;
  panelCount?: number;
  contentSensitivity?: "low" | "medium" | "high";
}

/**
 * Generate a memory from chat messages and AI summary
 */
export async function generateMemoryForDate(
  date: string,
  datetime: Date,
  timestamp: string,
  aiSummary: string,
  chatMessages: ChatMessage[] = [],
  userId: string = "default",
  options: GenerationOptions = {}
): Promise<Memory> {
  const {
    tone = "reflective",
    panelCount = 4,
    contentSensitivity = "medium",
  } = options;

  // Analyze the chat content
  const analysis = analyzeChat(chatMessages, aiSummary);

  // Generate memory components
  const memory: Memory = {
    id: date,
    date,
    datetime,
    timestamp,
    title: generateTitle(analysis, aiSummary),
    logline: generateLogline(analysis, aiSummary),
    tags: generateTags(analysis),
    mood: generateMoodMetrics(analysis),
    skillsUsed: generateSkillsUsed(analysis),
    keyMoments: generateKeyMoments(analysis, chatMessages),
    panels: generatePanels(analysis, panelCount, aiSummary),
    status: "generated",
    favorite: false,
    sources: generateSourceRefs(chatMessages, aiSummary),
    contentWarnings: generateContentWarnings(analysis),
    aiSummary, // Store the AI summary
    userId,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Apply safety pass
  return applySafetyPass(memory, contentSensitivity);
}

interface Analysis {
  messageCount: number;
  primaryEmotion: string;
  emotionScores: Record<string, number>;
  activities: string[];
  textLength: number;
  hasPositiveWords: boolean;
  hasNegativeWords: boolean;
  themes: string[];
}

/**
 * Analyze chat messages and summary to extract themes and emotions
 */
function analyzeChat(chatMessages: ChatMessage[], aiSummary: string): Analysis {
  const text = [...chatMessages.map((msg) => msg.content || ""), aiSummary]
    .join(" ")
    .toLowerCase();

  // Detect emotional themes
  const emotionalKeywords = {
    happy: [
      "happy",
      "joy",
      "excited",
      "great",
      "wonderful",
      "love",
      "amazing",
      "glad",
    ],
    calm: [
      "calm",
      "peaceful",
      "relaxed",
      "serene",
      "quiet",
      "meditation",
      "peace",
    ],
    anxious: [
      "worried",
      "stress",
      "anxiety",
      "nervous",
      "concerned",
      "fear",
      "overwhelmed",
    ],
    sad: ["sad", "down", "depressed", "upset", "disappointed", "cry", "lonely"],
    angry: [
      "angry",
      "mad",
      "frustrated",
      "annoyed",
      "irritated",
      "rage",
      "furious",
    ],
  };

  const emotionScores: Record<string, number> = {};
  for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
    emotionScores[emotion] = keywords.filter((keyword) =>
      text.includes(keyword)
    ).length;
  }

  // Determine primary emotion
  const primaryEmotion =
    Object.keys(emotionScores).reduce((a, b) =>
      emotionScores[a] > emotionScores[b] ? a : b
    ) || "neutral";

  // Detect activities and skills
  const activityKeywords = [
    "exercise",
    "walk",
    "run",
    "yoga",
    "meditation",
    "read",
    "work",
    "friend",
    "family",
    "conversation",
    "talk",
  ];
  const activities = activityKeywords.filter((activity) =>
    text.includes(activity)
  );

  // Detect themes
  const themeKeywords = [
    "growth",
    "healing",
    "support",
    "understanding",
    "progress",
    "challenge",
    "reflection",
  ];
  const themes = themeKeywords.filter((theme) => text.includes(theme));

  return {
    messageCount: chatMessages.length,
    primaryEmotion,
    emotionScores,
    activities,
    textLength: text.length,
    hasPositiveWords:
      text.includes("good") || text.includes("better") || text.includes("help"),
    hasNegativeWords:
      text.includes("bad") ||
      text.includes("worse") ||
      text.includes("difficult"),
    themes,
  };
}

/**
 * Generate a meaningful title
 */
function generateTitle(analysis: Analysis, aiSummary: string): string {
  const { primaryEmotion, activities, hasPositiveWords } = analysis;

  const titleTemplates: Record<string, string[]> = {
    happy: [
      "A day of joy",
      "Finding happiness",
      "Bright moments",
      "Grateful today",
    ],
    calm: [
      "Finding peace",
      "A quiet day",
      "Moments of serenity",
      "Calm reflection",
    ],
    anxious: [
      "Working through worry",
      "Facing the storm",
      "Finding calm",
      "Processing anxiety",
    ],
    sad: [
      "Processing sadness",
      "A difficult day",
      "Working through emotions",
      "Healing",
    ],
    angry: ["Managing frustration", "Working through anger", "Finding balance"],
    neutral: ["A day of reflection", "Today's journey", "Moving forward"],
    mixed: ["A complex day", "Mixed emotions", "Processing the day"],
  };

  let templates = titleTemplates[primaryEmotion] || titleTemplates.neutral;

  // Add activity-specific titles
  if (activities.includes("exercise") || activities.includes("walk")) {
    templates.push("Moving through the day", "Finding strength");
  }
  if (activities.includes("friend") || activities.includes("family")) {
    templates.push("Connecting with others", "Friendship and support");
  }

  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Generate a one-line summary
 */
function generateLogline(analysis: Analysis, aiSummary: string): string {
  // Extract first sentence from AI summary as logline
  const firstSentence = aiSummary.split(/[.!?]/)[0];
  if (
    firstSentence &&
    firstSentence.length > 20 &&
    firstSentence.length < 120
  ) {
    return firstSentence.trim() + ".";
  }

  const { primaryEmotion, messageCount } = analysis;
  return `A ${primaryEmotion} day with ${messageCount} moments of reflection and growth.`;
}

/**
 * Generate relevant tags
 */
function generateTags(analysis: Analysis): string[] {
  const tags = [analysis.primaryEmotion];

  // Add activity tags
  tags.push(...analysis.activities);

  // Add theme tags
  tags.push(...analysis.themes);

  // Add contextual tags
  if (analysis.hasPositiveWords) tags.push("growth");
  if (analysis.messageCount > 10) tags.push("active-day");
  if (analysis.messageCount < 3) tags.push("quiet-day");

  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Generate mood metrics
 */
function generateMoodMetrics(analysis: Analysis): MoodMetrics {
  const { primaryEmotion, emotionScores, hasPositiveWords, hasNegativeWords } =
    analysis;

  // Calculate valence (-1 to 1)
  let valence = 0;
  if (hasPositiveWords) valence += 0.3;
  if (hasNegativeWords) valence -= 0.3;
  if (["happy", "calm"].includes(primaryEmotion)) valence += 0.4;
  if (["sad", "anxious", "angry"].includes(primaryEmotion)) valence -= 0.4;

  // Calculate energy (0 to 1)
  let energy = 0.5;
  if (["happy", "angry"].includes(primaryEmotion)) energy += 0.3;
  if (["calm", "sad"].includes(primaryEmotion)) energy -= 0.2;
  if (analysis.activities.includes("exercise")) energy += 0.2;

  // Clamp values
  valence = Math.max(-1, Math.min(1, valence));
  energy = Math.max(0, Math.min(1, energy));

  return {
    primary: primaryEmotion as MoodMetrics["primary"],
    valence,
    energy,
    topEmotions: Object.keys(emotionScores).filter((e) => emotionScores[e] > 0),
  };
}

/**
 * Generate skills used
 */
function generateSkillsUsed(analysis: Analysis): string[] {
  const skills: string[] = [];

  if (analysis.hasPositiveWords) skills.push("positive-thinking");
  if (analysis.activities.includes("meditation")) skills.push("mindfulness");
  if (analysis.activities.includes("exercise"))
    skills.push("physical-activity");
  if (analysis.messageCount > 5) skills.push("self-reflection");
  if (analysis.activities.includes("conversation"))
    skills.push("communication");

  return skills;
}

/**
 * Generate key moments
 */
function generateKeyMoments(
  analysis: Analysis,
  chatMessages: ChatMessage[]
): KeyMoment[] {
  const moments: KeyMoment[] = [];

  if (chatMessages.length > 0) {
    moments.push({
      time: "Start of day",
      note: "Began reflection and conversation",
    });

    if (analysis.activities.length > 0) {
      moments.push({
        time: "During day",
        note: `Engaged in ${analysis.activities.slice(0, 2).join(" and ")}`,
      });
    }

    moments.push({
      time: "End of day",
      note: `Ended feeling ${analysis.primaryEmotion}`,
    });
  }

  return moments;
}

/**
 * Generate manga panels
 */
function generatePanels(
  analysis: Analysis,
  panelCount: number,
  aiSummary: string
): Panel[] {
  const panels: Panel[] = [];

  // Split summary into sentences for captions
  const sentences = aiSummary
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);

  const panelTemplates = [
    "The day begins with quiet contemplation...",
    "Challenges arise, but there is strength to face them.",
    "Through conversation and reflection, understanding grows.",
    "The day ends with newfound clarity and peace.",
  ];

  for (let i = 0; i < panelCount; i++) {
    const caption =
      sentences[i] ||
      panelTemplates[i] ||
      `A moment of ${analysis.primaryEmotion} reflection`;

    panels.push({
      id: `panel-${i + 1}`,
      order: i,
      caption: caption.trim(),
      altText: `Panel ${i + 1}: A manga-style illustration depicting ${
        analysis.primaryEmotion
      } emotions`,
      style: "bw", // Black and white manga style
      imgUrl: "/second.png", // Default placeholder image
    });
  }

  return panels;
}

/**
 * Generate source references
 */
function generateSourceRefs(
  chatMessages: ChatMessage[],
  aiSummary: string
): SourceRef[] {
  const refs: SourceRef[] = [];

  // Add chat message references
  chatMessages.slice(0, 5).forEach((msg, index) => {
    refs.push({
      type: "chat",
      id: `msg-${index}`,
      timestamp: msg.timestamp || new Date().toISOString(),
      summary: (msg.content || "").substring(0, 50) + "...",
    });
  });

  // Add summary reference
  refs.push({
    type: "summary",
    timestamp: new Date().toISOString(),
    summary: aiSummary.substring(0, 100) + "...",
  });

  return refs;
}

/**
 * Generate content warnings if needed
 */
function generateContentWarnings(analysis: Analysis): string[] {
  const warnings: string[] = [];

  if (analysis.primaryEmotion === "sad" && analysis.emotionScores.sad > 3) {
    warnings.push("Contains themes of sadness");
  }

  if (
    analysis.primaryEmotion === "anxious" &&
    analysis.emotionScores.anxious > 3
  ) {
    warnings.push("Contains themes of anxiety");
  }

  return warnings;
}

/**
 * Apply safety filtering
 */
function applySafetyPass(memory: Memory, sensitivity: string): Memory {
  // For high sensitivity, add more content warnings
  if (sensitivity === "high" && (!memory.contentWarnings || memory.contentWarnings.length === 0)) {
    if (memory.mood.valence < -0.5) {
      if (!memory.contentWarnings) {
        memory.contentWarnings = [];
      }
      memory.contentWarnings.push("Contains emotional content");
    }
  }

  return memory;
}
