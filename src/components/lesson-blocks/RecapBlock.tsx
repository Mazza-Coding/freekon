import React, { useEffect } from "react";
import { LessonBlock, RecapBlockContent } from "@/types/lesson";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface RecapBlockProps {
  block: LessonBlock & { content: RecapBlockContent };
  onComplete: () => void;
}

const RecapBlock: React.FC<RecapBlockProps> = ({ block, onComplete }) => {
  const { words, challengePrompt } = block.content;

  useEffect(() => {
    onComplete();
  }, [onComplete]);

  return (
    <Card className="mb-6 border-black dark:border-white bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white text-lg font-semibold">
          📝 Lesson Recap
        </CardTitle>
        <CardDescription className="dark:text-gray-300 pt-1">
          Key takeaways from this lesson.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {words.map((item, index) => (
          <div
            key={index}
            className="pb-4 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            <div className="flex items-baseline mb-1">
              <span className="font-bold text-xl dark:text-gray-100 mr-2">
                {item.word}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                - {item.meaning}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-1">
              [{item.pronunciation}]
            </p>
            {item.spellingTips && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 <span className="font-medium">Spelling Tip:</span>{" "}
                {item.spellingTips}
              </p>
            )}
          </div>
        ))}

        {challengePrompt && (
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium dark:text-gray-200">
              🧠 Challenge:
            </p>
            <p className="text-sm dark:text-gray-300">{challengePrompt}</p>
            {/* Input field for challenge could go here later */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecapBlock;
