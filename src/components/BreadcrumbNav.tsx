import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

const BreadcrumbNav = ({ items }: BreadcrumbNavProps) => {
  return (
    <nav className="flex items-center space-x-2 mb-8 font-mono text-sm">
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          <Link
            to={item.path}
            className={cn(
              "hover:text-accent transition-colors dark:text-gray-300",
              index === items.length - 1 &&
                "text-muted-foreground dark:text-gray-500 pointer-events-none"
            )}
          >
            {item.label}
          </Link>
          {index < items.length - 1 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNav;
