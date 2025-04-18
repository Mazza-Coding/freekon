import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Doc, Id } from "../../convex/_generated/dataModel";

interface LessonTimelineProps {
  lessons: Doc<"lessons">[];
  completedLessons?: Id<"lessons">[];
}

const LessonTimeline: React.FC<LessonTimelineProps> = ({
  lessons,
  completedLessons = [],
}) => {
  const navigate = useNavigate();
  const completedSet = new Set(completedLessons);

  const handleLessonClick = (lessonId: Id<"lessons">) => {
    navigate(`/lessons/${lessonId}`);
  };

  return (
    <ScrollArea className="h-[600px] w-full pr-4">
      <div className="space-y-4">
        {lessons.map((lesson, index) => {
          const isCompleted = completedSet.has(lesson._id);
          return (
            <div
              key={lesson._id}
              onClick={() => handleLessonClick(lesson._id)}
              className={`group border p-4 transition-colors duration-300 cursor-pointer bg-white dark:bg-gray-800 ${isCompleted ? "border-green-500 dark:border-green-400" : "border-black dark:border-white"} hover:border-blue-500 dark:hover:border-blue-400`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-sm ${isCompleted ? "text-green-600 dark:text-green-400" : "dark:text-gray-300"}`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <BookOpen
                    size={16}
                    className={`transition-colors duration-300 ${isCompleted ? "text-green-500 dark:text-green-400" : "group-hover:text-blue-500 dark:text-gray-300 dark:group-hover:text-blue-400"}`}
                  />
                  <h3
                    className={`font-mono text-sm ${isCompleted ? "text-green-600 dark:text-green-400 line-through" : "dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-300"}`}
                  >
                    {lesson.title}
                  </h3>
                </div>
                {isCompleted && (
                  <CheckCircle
                    size={18}
                    className="text-green-500 dark:text-green-400"
                  />
                )}
                {/* Duration removed - add back to schema if needed */}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default LessonTimeline;
