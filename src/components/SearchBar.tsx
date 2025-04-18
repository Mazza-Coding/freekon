import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Define props interface
interface SearchBarProps {
  value: string; // Controlled input value
  onChange: (value: string) => void; // Callback for input changes
  onSubmit: (query: string) => void; // Callback for submission
  placeholder?: string; // Optional placeholder
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Try with 'polish'...", // Default placeholder
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default form submission if wrapped in form
      onSubmit(value); // Call the onSubmit prop with the current value
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value); // Call the onChange prop
  };

  return (
    <div className="relative w-full max-w-md">
      {" "}
      {/* Or adjust width as needed */}
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 w-full border border-black dark:border-white bg-white dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        value={value} // Use the controlled value prop
        onChange={handleChange} // Handle changes
        onKeyDown={handleKeyDown} // Handle Enter key press
      />
    </div>
  );
};

export default SearchBar;
