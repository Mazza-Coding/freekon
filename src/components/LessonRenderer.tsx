import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lesson, LessonBlock } from "@/types/lesson";
import DiscoveryBlock from "./lesson-blocks/DiscoveryBlock";
import PronunciationBlock from "./lesson-blocks/PronunciationBlock";
import MultipleChoiceBlock from "./lesson-blocks/MultipleChoiceBlock";
import SpellingChallengeBlock from "./lesson-blocks/SpellingChallengeBlock";
import RecapBlock from "./lesson-blocks/RecapBlock";
import { Button } from "@/components/ui/button";
// Import other block components here as they are created
// e.g., import PronunciationBlock from './lesson-blocks/PronunciationBlock';

interface LessonRendererProps {
  lesson: Lesson | null | undefined;
  isLoading?: boolean;
  error?: Error | null;
  onLessonComplete?: () => void;
}

// Map block types to their corresponding components
const blockComponentMap: { [key: string]: React.ComponentType<any> } = {
  discovery: DiscoveryBlock,
  pronunciation: PronunciationBlock,
  "multiple-choice": MultipleChoiceBlock,
  "spelling-challenge": SpellingChallengeBlock,
  recap: RecapBlock,
  // pronunciation: PronunciationBlock, // Add later
  // Add other block types here
};

// Helper to get index from hash
const getIndexFromHash = (hash: string): number => {
  const match = hash.match(/^#block=(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
};

const LessonRenderer: React.FC<LessonRendererProps> = ({
  lesson,
  isLoading = false,
  error = null,
  onLessonComplete,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize state from URL hash or default to 0
  const [currentBlockIndex, setCurrentBlockIndex] = useState(() =>
    getIndexFromHash(location.hash)
  );
  const [isLessonFinished, setIsLessonFinished] = useState(false);
  // Block completion state should reset based on the currentBlockIndex or interaction
  const [isCurrentBlockComplete, setIsCurrentBlockComplete] = useState(false);

  // Effect to handle missing hash on load/navigation
  useEffect(() => {
    // If we have a lesson but no valid hash, redirect to block 0
    if (lesson && !location.hash.match(/^#block=\d+$/)) {
      console.log("No valid block hash found on load, redirecting to #block=0");
      const targetHash = "#block=0";
      navigate(location.pathname + location.search + targetHash, {
        replace: true,
      });
      // Update state immediately as well, although navigation might trigger other effects
      setCurrentBlockIndex(0);
      setIsCurrentBlockComplete(false);
    }
    // Run only when lesson becomes available or location changes (e.g., initial load)
  }, [lesson, location.pathname, location.search, location.hash, navigate]);

  // Effect to update URL hash when index changes (using PUSH state)
  useEffect(() => {
    // Only update if the index *itself* changes, not just on any render
    // And avoid updating if the hash is already correct (e.g., set by hashchange listener)
    const targetHash = `#block=${currentBlockIndex}`;
    if (location.hash !== targetHash) {
      console.log(
        `Index changed to ${currentBlockIndex}, pushing history state: ${targetHash}`
      );
      navigate(location.pathname + location.search + targetHash);
    }
  }, [currentBlockIndex, navigate, location.pathname, location.search]); // location.hash removed here intentionally

  // Effect to listen for hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const newIndex = getIndexFromHash(window.location.hash);
      setCurrentBlockIndex((prevIndex) => {
        if (prevIndex !== newIndex) {
          console.log(
            `Hash changed externally (back/forward), updating index from ${prevIndex} to ${newIndex}`
          );
          // Completion state reset will be handled by the effect watching currentBlock
          return newIndex;
        }
        return prevIndex;
      });
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []); // Runs once on mount

  // Reset index and completion if the lesson *content* itself changes
  // (using REPLACE state for initial hash)
  useEffect(() => {
    // Guard against running this logic if the lesson is null/undefined initially
    if (!lesson) return;

    console.log("Lesson prop identity changed, resetting state and hash.");
    const initialIndex = 0; // Always reset to 0 for a new lesson
    setCurrentBlockIndex(initialIndex);
    setIsLessonFinished(false);
    // Completion state reset is handled by the effect watching currentBlock

    const targetHash = `#block=${initialIndex}`;
    // Use REPLACE for the *initial* hash setting when the lesson content changes
    if (location.hash !== targetHash) {
      console.log(
        "Resetting hash to #block=0 with replace: true due to new lesson data"
      );
      navigate(location.pathname + location.search + targetHash, {
        replace: true,
      });
    }
  }, [lesson]); // Rerun only when lesson object identity changes

  // Recalculate completion state based on current block type whenever index changes
  // Moved this effect earlier to ensure completion state is set correctly *before* potential rendering
  useEffect(() => {
    // This depends on safeIndex, which depends on currentBlockIndex being potentially updated by other effects
    // Ensure this runs *after* index might have been updated by hash changes or resets.
    const safeIndex = Math.max(
      0,
      Math.min(currentBlockIndex, (lesson?.blocks?.length ?? 1) - 1)
    );
    const block = lesson?.blocks?.[safeIndex];

    if (block) {
      const passiveTypes = ["discovery", "pronunciation", "recap"];
      const isPassive = passiveTypes.includes(block.type);
      // Only update if the state needs changing
      setIsCurrentBlockComplete((prevState) => {
        if (prevState !== isPassive) {
          console.log(
            `Block ${block.id} (type: ${block.type}) detected. Setting complete: ${isPassive}`
          );
          return isPassive;
        }
        return prevState;
      });
    } else {
      // If no block, perhaps loading or error state, ensure button isn't shown
      setIsCurrentBlockComplete(false);
    }
  }, [currentBlockIndex, lesson]); // Rerun when index or lesson changes

  if (isLoading) {
    return <div>Loading lesson...</div>; // Replace with Skeleton later
  }

  if (error) {
    return (
      <div className="text-red-500">Error loading lesson: {error.message}</div>
    );
  }

  if (!lesson || !lesson.blocks || lesson.blocks.length === 0) {
    return <div>No lesson content available.</div>;
  }

  const totalBlocks = lesson.blocks.length;
  // Ensure index is within bounds after potential hash changes or lesson changes
  const safeIndex = Math.max(0, Math.min(currentBlockIndex, totalBlocks - 1));
  const currentBlock = lesson.blocks[safeIndex];
  const BlockComponent = currentBlock
    ? blockComponentMap[currentBlock.type]
    : null;

  const handleBlockComplete = useCallback(() => {
    const currentSafeIndex = Math.max(
      0,
      Math.min(currentBlockIndex, (lesson?.blocks?.length ?? 1) - 1)
    );
    const blockNow = lesson?.blocks?.[currentSafeIndex];

    // Add detailed logging before the condition
    console.log(`LessonRenderer handleBlockComplete: Called.`);
    console.log(`  - currentBlockIndex: ${currentBlockIndex}`);
    console.log(`  - currentSafeIndex: ${currentSafeIndex}`);
    console.log(`  - blockNow?.id: ${blockNow?.id}`);
    console.log(`  - currentBlock?.id (state): ${currentBlock?.id}`);
    console.log(
      `  - isCurrentBlockComplete (before): ${isCurrentBlockComplete}`
    );

    if (blockNow?.id === currentBlock?.id && !isCurrentBlockComplete) {
      console.log(
        `  - Condition MET. Setting block ${currentBlock?.id} complete.`
      );
      setIsCurrentBlockComplete(true);
    } else {
      console.warn(`  - Condition NOT MET. Ignoring call.`);
      if (blockNow?.id !== currentBlock?.id) {
        console.warn(
          `    - Reason: ID mismatch (blockNow: ${blockNow?.id}, currentBlock: ${currentBlock?.id})`
        );
      }
      if (isCurrentBlockComplete) {
        console.warn(`    - Reason: Already marked as complete.`);
      }
    }
  }, [currentBlockIndex, currentBlock, lesson, isCurrentBlockComplete]);

  const handleNextBlock = () => {
    // Use safeIndex derived from current state
    const currentSafeIndex = Math.max(
      0,
      Math.min(currentBlockIndex, totalBlocks - 1)
    );
    if (currentSafeIndex < totalBlocks - 1) {
      const nextIndex = currentSafeIndex + 1;
      console.log(`Handling next block, advancing index to ${nextIndex}`);
      // This will trigger the useEffect that pushes history state
      setCurrentBlockIndex(nextIndex);
    } else {
      console.log("Handling finish lesson.");
      setIsLessonFinished(true);
      onLessonComplete?.();
    }
  };

  if (isLessonFinished) {
    return (
      <div className="text-center p-6 bg-green-100 dark:bg-green-900/30 rounded-md">
        <h2 className="text-xl font-semibold text-green-700 dark:text-green-300">
          🎉 Lesson Complete!
        </h2>
        {/* Add summary or next steps later */}
      </div>
    );
  }

  return (
    <div className="lesson-container space-y-6">
      {/* Render the current block, passing the onComplete callback */}
      {BlockComponent ? (
        <BlockComponent
          key={`${lesson?.blocks[0]?.id ?? "lesson"}-${safeIndex}`}
          block={currentBlock}
          onComplete={handleBlockComplete}
        />
      ) : currentBlock ? (
        <div
          key={currentBlock.id}
          className="p-4 border border-dashed border-red-400 bg-red-50 dark:bg-red-900/20 rounded-md"
        >
          <p className="text-red-600 dark:text-red-400">
            Unsupported block type: "{currentBlock.type}"
          </p>
          {/* Automatically complete unsupported blocks? Let's make them show the continue button */}
          {!isCurrentBlockComplete && (
            <Button
              onClick={() => setIsCurrentBlockComplete(true)}
              variant="secondary"
              size="sm"
              className="mt-2"
            >
              Proceed Past Unsupported
            </Button>
          )}
        </div>
      ) : null}

      {/* Progression Button - Show only when the current block is complete */}
      {currentBlock && isCurrentBlockComplete && !isLessonFinished && (
        <div className="flex justify-end mt-6">
          <Button onClick={handleNextBlock}>
            {safeIndex < totalBlocks - 1 ? "Continue" : "Finish Lesson"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LessonRenderer;
