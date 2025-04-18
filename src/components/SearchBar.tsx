import React, { useState } from "react";
import { Search } from "lucide-react";

const SearchBar: React.FC = () => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`relative w-full max-w-md border ${
        isFocused ? "border-accent" : "border-black dark:border-white"
      } transition-all duration-300`}
    >
      <input
        type="text"
        placeholder="Search courses, topics, skills..."
        className="w-full py-3 px-4 outline-none bg-transparent search-focus dark:text-white dark:placeholder-gray-400"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        <Search
          size={18}
          className={isFocused ? "text-accent" : "text-black dark:text-white"}
        />
      </div>
    </div>
  );
};

export default SearchBar;
