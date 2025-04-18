import React from "react";
import LessonRenderer from "@/components/LessonRenderer";
import { Lesson } from "@/types/lesson";

// Mock Lesson Data (using the structure provided)
const mockLessonData: Lesson = {
  type: "language-lesson",
  blocks: [
    {
      id: "block_1_discovery",
      type: "discovery",
      metadata: { difficulty: "easy", language: "Polish" },
      content: {
        scenario:
          "You're meeting your new Polish friend, Ola, for the first time. How do you greet her and thank her when she offers you coffee?",
        questions: [
          { word: "Cześć", answer: "Hello / Hi" },
          { word: "Dziękuję", answer: "Thank you" },
        ],
      },
    },
    {
      id: "block_2_pronunciation",
      type: "pronunciation", // This type is not yet supported by LessonRenderer
      metadata: { interactivity: "audio", language: "Polish" },
      content: [
        {
          word: "Cześć",
          pronunciation: "cheshch",
          mnemonic: 'Imagine saying "cheese" but ending with "shhh"',
          audioUrl: "/audio/polish/czesc.mp3",
        },
        {
          word: "Dziękuję",
          pronunciation: "jen-KOO-yeh",
          mnemonic: 'Think "Jen, cool, yay!" when thanking someone.',
          audioUrl: "/audio/polish/dziekuje.mp3",
        },
      ],
    },
    {
      id: "block_3_unsupported",
      type: "multiple-choice", // This type is not yet supported
      metadata: { language: "Polish" },
      content: {
        question: "How do you say 'Thank you'?",
        options: ["Cześć", "Dziękuję", "Proszę"],
        correctAnswer: "Dziękuję",
      },
    },
    {
      id: "block_3_spell_check",
      type: "spelling-challenge",
      metadata: { language: "Polish" },
      content: {
        instructions: "Select the correct spelling for each word.",
        questions: [
          {
            question: "How do you spell 'Hello' in Polish?",
            options: ["Cześt", "Cześć", "Czesc", "Czezt"],
            correctAnswer: "Cześć",
          },
          {
            question: "How do you spell 'Thank you' in Polish?",
            options: ["Dzienkuje", "Dziękuję", "Dźękuję", "Dzienkuję"],
            correctAnswer: "Dziękuję",
          },
        ],
      },
    },

    {
      id: "block_6_recap",
      type: "recap",
      metadata: { language: "Polish" },
      content: {
        words: [
          {
            word: "Cześć",
            meaning: "Hello / Hi",
            pronunciation: "cheshch",
            spellingTips:
              "Watch out for the special characters: 'ś' and 'ć' – they soften the sound and are key to proper spelling.",
          },
          {
            word: "Dziękuję",
            meaning: "Thank you",
            pronunciation: "jen-KOO-yeh",
            spellingTips:
              "Look closely at the nasal 'ę' and the accented 'ó' – both are common in Polish but can trip up beginners!",
          },
        ],
        challengePrompt:
          "Without looking, can you type out both words with the correct Polish letters?",
      },
    },
  ],
};

const TestLessonPage = () => {
  // Simulate loading/error states if needed for testing UI
  const isLoading = false;
  const error = null;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8 dark:text-white">
        Test Language Lesson
      </h1>
      <LessonRenderer
        lesson={mockLessonData}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default TestLessonPage;
