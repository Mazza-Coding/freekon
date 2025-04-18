import React from "react";
import { Link } from "react-router-dom";
import { Doc, Id } from "../../convex/_generated/dataModel";

interface PathCardProps {
  id: Id<"learningPaths">;
  title: string;
  description: string;
  courses: number;
  pathData: Doc<"learningPaths">;
}

const PathCard: React.FC<PathCardProps> = ({
  id,
  title,
  description,
  courses,
  pathData,
}) => {
  return (
    <Link
      to={`/path/${id}`}
      className="block hover:no-underline group"
      state={{ pathData: pathData }}
    >
      <div className="border border-black dark:border-white p-6 bg-white dark:bg-gray-800 group-hover:border-accent transition-colors duration-300 h-[180px] flex flex-col">
        <h3 className="text-lg font-bold mb-2 tracking-tight dark:text-white">
          {title}
        </h3>
        <p className="text-sm mb-4 overflow-hidden line-clamp-2 flex-grow dark:text-gray-300">
          {description}
        </p>
        <div className="text-xs dark:text-gray-400">
          <span>{courses} courses</span>
        </div>
      </div>
    </Link>
  );
};

export default PathCard;
