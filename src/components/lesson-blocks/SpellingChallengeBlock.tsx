import React, { useState, useEffect } from "react";
import { LessonBlock, SpellingChallengeBlockContent } from "@/types/lesson";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpellingChallengeBlockProps {
  block: LessonBlock & { content: SpellingChallengeBlockContent };
  onComplete: () => void;
}

const SpellingChallengeBlock: React.FC<SpellingChallengeBlockProps> = ({
  block,
  onComplete,
}) => {
  const { instructions, questions } = block.content;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null); // null = unanswered
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    console.log(
      `SpellingChallengeBlock useEffect Check: showFeedback=${showFeedback}, isLastQuestion=${isLastQuestion}`
    );

    if (showFeedback && isLastQuestion) {
      console.log(`  -> Condition MET. Calling onComplete.`);
      onComplete();
    } else {
      // Optional: Log why it didn't meet the condition
      // console.log(`  -> Condition NOT MET.`);
    }
  }, [showFeedback, isLastQuestion, onComplete]);

  const handleOptionSelect = (option: string) => {
    if (showFeedback) return;

    setSelectedOption(option);
    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    console.log(
      `SpellingChallengeBlock handleOptionSelect: Setting showFeedback to true. QIndex: ${currentQuestionIndex}, IsLast: ${isLastQuestion}`
    );
    setShowFeedback(true);
  };

  const handleNextInternalQuestion = () => {
    if (!isLastQuestion) {
      console.log(`SpellingChallengeBlock: Moving to next internal question.`);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setShowFeedback(false);
    } else {
      console.warn("Attempted to move past the last internal question.");
    }
  };

  const getOptionClasses = (option: string) => {
    const isSelected = selectedOption === option;

    if (!showFeedback) {
      return "border-black dark:border-white hover:bg-accent hover:text-accent-foreground";
    }

    if (isSelected) {
      return isCorrect
        ? "border-green-500 dark:border-green-400 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-100/90 dark:hover:bg-green-900/40"
        : "border-red-500 dark:border-red-400 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-100/90 dark:hover:bg-red-900/40";
    } else {
      if (option === currentQuestion.correctAnswer && isCorrect === false) {
        return "border-green-500 dark:border-green-400 bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-300 opacity-70 pointer-events-none";
      }
      return "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 opacity-60 pointer-events-none";
    }
  };

  return (
    <Card className="mb-6 border-black dark:border-white bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white text-lg font-semibold">
          ✍️ Spelling Challenge
        </CardTitle>
        <CardDescription className="dark:text-gray-300 pt-1">
          {instructions}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Question Prompt */}
        <p className="mb-4 font-medium dark:text-gray-200">
          {currentQuestion.question} ({currentQuestionIndex + 1} /{" "}
          {questions.length})
        </p>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "w-full justify-start h-auto py-3 px-4 text-left whitespace-normal",
                getOptionClasses(option)
              )}
              onClick={() => handleOptionSelect(option)}
              disabled={showFeedback} // Disable options once feedback is shown
            >
              {option}
            </Button>
          ))}
        </div>

        {/* Feedback Area */}
        {showFeedback && (
          <div
            className={`mb-4 p-3 rounded-md text-sm ${isCorrect ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"}`}
          >
            {isCorrect ? "Correct!" : "Incorrect."}
          </div>
        )}

        {/* Internal Next Question Button */}
        {showFeedback && !isLastQuestion && (
          <div className="flex justify-end mt-4">
            <Button onClick={handleNextInternalQuestion}>Next Question</Button>
          </div>
        )}

        {/* The main "Continue" button from LessonRenderer will appear when the last question is answered */}
      </CardContent>
    </Card>
  );
};

export default SpellingChallengeBlock;
