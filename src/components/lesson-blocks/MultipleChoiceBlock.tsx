import React, { useState, useEffect } from "react";
import { LessonBlock, MultipleChoiceBlockContent } from "@/types/lesson";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // For conditional classes

interface MultipleChoiceBlockProps {
  block: LessonBlock & { content: MultipleChoiceBlockContent };
  onComplete: () => void; // Add onComplete prop
}

const MultipleChoiceBlock: React.FC<MultipleChoiceBlockProps> = ({
  block,
  onComplete,
}) => {
  const { question, options, correctAnswer } = block.content;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null); // null = unanswered, true = correct, false = incorrect
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  // Effect to call onComplete when the correct answer is selected
  useEffect(() => {
    if (isCorrect === true) {
      onComplete(); // Call onComplete only when the answer is correct
    }
  }, [isCorrect, onComplete]);

  const handleOptionSelect = (option: string) => {
    // Don't allow changing answer once the correct one is selected
    if (isCorrect) return;

    setSelectedOption(option);
    const correct = option === correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true); // Show feedback immediately

    // If correct, maybe trigger something else later? For now, just state update.
  };

  const getOptionClasses = (option: string) => {
    const isSelected = selectedOption === option;

    if (!showFeedback) {
      // Before any answer
      return "border-black dark:border-white hover:bg-accent hover:text-accent-foreground";
    }

    // After an answer is given
    if (isSelected) {
      return isCorrect
        ? "border-green-500 dark:border-green-400 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-100/90 dark:hover:bg-green-900/40"
        : "border-red-500 dark:border-red-400 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-100/90 dark:hover:bg-red-900/40";
    } else {
      // If another option was selected and it was WRONG, show the correct answer
      if (option === correctAnswer && isCorrect === false) {
        return "border-green-500 dark:border-green-400 bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-300 opacity-70 pointer-events-none";
      }
      // If correct answer already found or this is just an unselected wrong option
      return "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 opacity-60 pointer-events-none";
    }
  };

  return (
    <Card className="mb-6 border-black dark:border-white bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white text-lg font-semibold">
          ✔️ Check Your Understanding
        </CardTitle>
        <CardDescription className="dark:text-gray-300 pt-2 text-base">
          {question}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "w-full justify-start h-auto py-3 px-4 text-left whitespace-normal",
                getOptionClasses(option)
              )}
              onClick={() => handleOptionSelect(option)}
              disabled={isCorrect === true} // Disable all buttons once correct answer is chosen
            >
              {option}
            </Button>
          ))}
        </div>
        {showFeedback && (
          <div
            className={`mt-4 p-3 rounded-md text-sm ${isCorrect ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"}`}
          >
            {isCorrect ? "Correct! Great job." : "Incorrect."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultipleChoiceBlock;
