import React from "react";
import { Outlet } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <header className="p-4 border-b dark:border-gray-800 flex justify-end">
        <div className="flex items-center gap-4">
          <SignedOut>
            <Button
              asChild
              variant="outline"
              className="border-black dark:border-white dark:text-white"
            >
              <SignInButton mode="modal" />
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox:
                    "w-8 h-8 border border-black dark:border-white",
                  userButtonTrigger: "focus:shadow-none",
                },
              }}
            />
          </SignedIn>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
