import React, { useRef, useEffect } from "react";
import { LessonBlock, PronunciationBlockContent } from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react"; // Speaker icon

interface PronunciationBlockProps {
  block: LessonBlock & { content: PronunciationBlockContent };
  onComplete: () => void;
}

const PronunciationBlock: React.FC<PronunciationBlockProps> = ({
  block,
  onComplete,
}) => {
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  useEffect(() => {
    onComplete();
  }, [onComplete]);

  const playAudio = (index: number) => {
    audioRefs.current[index]
      ?.play()
      .catch((err) => console.error("Error playing audio:", err));
  };

  return (
    <Card className="mb-6 border-black dark:border-white bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white text-lg font-semibold">
          🗣️ Pronunciation Practice
        </CardTitle>
        {/* Optional: Add description from metadata if needed */}
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {block.content.map((item, index) => (
            <li
              key={index}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-grow mb-2 sm:mb-0">
                <div className="flex items-center mb-1">
                  <span className="font-bold text-lg dark:text-gray-100 mr-2">
                    {item.word}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 italic">
                    [{item.pronunciation}]
                  </span>
                </div>
                {item.mnemonic && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 {item.mnemonic}
                  </p>
                )}
              </div>
              {item.audioUrl && (
                <div className="flex-shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => playAudio(index)}
                    className="border-black dark:border-white hover:bg-accent hover:text-accent-foreground"
                    aria-label={`Play pronunciation for ${item.word}`}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <audio
                    ref={(el) => (audioRefs.current[index] = el)}
                    src={item.audioUrl}
                    preload="none"
                    className="hidden" // Hide the default audio player
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PronunciationBlock;
