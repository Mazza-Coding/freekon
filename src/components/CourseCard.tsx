import React from "react";

interface CourseCardProps {
  title: string;
  description: string;
  level?: string;
  duration?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  description,
  level = "Beginner",
}) => {
  return (
    <div className="border border-black dark:border-white p-6 bg-white dark:bg-gray-800 group-hover:border-accent transition-colors duration-300 h-[180px] flex flex-col">
      <h3 className="text-lg font-bold mb-2 tracking-tight dark:text-white">
        {title}
      </h3>
      <p className="text-sm mb-4 overflow-hidden line-clamp-2 flex-grow dark:text-gray-300">
        {description}
      </p>
      <div className="flex justify-between text-xs dark:text-gray-400">
        <span>{level}</span>
      </div>
    </div>
  );
};

export default CourseCard;
