import React, { useEffect } from "react";
import { LessonBlock, DiscoveryBlockContent } from "@/types/lesson"; // Adjust import path if needed
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DiscoveryBlockProps {
  block: LessonBlock & { content: DiscoveryBlockContent };
  onComplete: () => void;
}

const DiscoveryBlock: React.FC<DiscoveryBlockProps> = ({
  block,
  onComplete,
}) => {
  const { scenario, questions } = block.content;

  useEffect(() => {
    onComplete();
  }, [onComplete]);

  return (
    <Card className="mb-6 border-black dark:border-white bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white text-lg font-semibold">
          🔍 Discovery
        </CardTitle>
        <CardDescription className="dark:text-gray-300">
          {scenario}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {questions.map((q, index) => (
            <li
              key={index}
              className="flex justify-between items-center border-b border-dashed border-gray-300 dark:border-gray-600 pb-2"
            >
              <span className="font-medium dark:text-gray-200">{q.word}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({q.answer})
              </span>
            </li>
          ))}
        </ul>
        {/* Add feedback/interaction elements later */}
      </CardContent>
    </Card>
  );
};

export default DiscoveryBlock;
