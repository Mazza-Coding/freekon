import React from "react";
import { Moon, Sun } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Toggle
      pressed={isDark}
      onPressedChange={toggleTheme}
      variant="outline"
      size="sm"
      className="border-black dark:border-white hover:bg-accent hover:text-accent-foreground"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Toggle>
  );
};

export default ThemeToggle;
