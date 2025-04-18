// src/types/lesson.ts

// General Block Structure
export interface LessonBlock {
  id: string;
  type: string; // Specific block type (e.g., 'discovery', 'pronunciation')
  metadata: Record<string, any>; // Flexible metadata
  content: any; // Content specific to the block type
}

// Specific Content Types
export interface DiscoveryBlockContent {
  scenario: string;
  questions: { word: string; answer: string }[];
}

export interface PronunciationContentItem {
  word: string;
  pronunciation: string;
  mnemonic?: string;
  audioUrl?: string;
}

export type PronunciationBlockContent = PronunciationContentItem[];

export interface MultipleChoiceBlockContent {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface SpellingChallengeQuestion {
  question: string; // e.g., "How do you spell 'Hello' in Polish?"
  options: string[];
  correctAnswer: string;
}

export interface SpellingChallengeBlockContent {
  instructions: string;
  questions: SpellingChallengeQuestion[];
}

export interface RecapWord {
  word: string;
  meaning: string;
  pronunciation: string;
  spellingTips?: string;
}

export interface RecapBlockContent {
  words: RecapWord[];
  challengePrompt?: string; // Make prompt optional for now
}

// Lesson Structure
export interface Lesson {
  type: string; // e.g., 'language-lesson'
  blocks: LessonBlock[];
}
