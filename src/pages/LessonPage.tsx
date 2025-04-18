import React, { useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import LessonRenderer from "../components/LessonRenderer";
import { toast } from "sonner";

// Assuming Lesson type might be useful here if not globally defined
import { Lesson } from "../types/lesson"; // Adjust path if necessary

const LessonPage: React.FC = () => {
  const { lessonId: lessonIdParam } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  // Get auth state
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();

  // --- Validate Lesson ID ---
  let validatedLessonId: Id<"lessons"> | null = null;
  let validationError: string | null = null;
  try {
    if (!lessonIdParam) {
      throw new Error("Lesson ID is missing from URL.");
    }
    validatedLessonId = lessonIdParam as Id<"lessons">;
  } catch (error: any) {
    console.error("Lesson ID validation error:", error);
    validationError = error.message || "Invalid Lesson ID.";
  }

  // --- Fetch Lesson Data ---
  const queryArgs = validatedLessonId ? { lessonId: validatedLessonId } : null;

  const lessonData = useQuery(
    api.queries.getLessonById,
    queryArgs === null ? "skip" : queryArgs
  );

  // --- Setup Mutation ---
  const markCompleted = useMutation(api.userProgress.markLessonCompleted);

  const isLoading = lessonData === undefined || authLoading;
  const error = validationError ? new Error(validationError) : null;

  // Memoize the adapted lesson object, including courseId
  const adaptedLesson: (Lesson & { courseId: Id<"courses"> }) | null =
    useMemo(() => {
      if (!lessonData) return null;
      // Ensure courseId exists on the fetched data
      if (!lessonData.courseId) {
        console.error("Lesson data is missing courseId", lessonData);
        // Decide how to handle this - maybe treat as an error?
        // For now, return null which will show Lesson Not Found
        return null;
      }
      return {
        id: lessonData._id,
        title: lessonData.title,
        // Map blocks to ensure metadata exists
        blocks: (lessonData.content?.blocks ?? []).map((block) => ({
          ...block, // Spread existing block properties (id, type, content)
          metadata: block.metadata ?? {}, // Ensure metadata is at least an empty object
        })),
        type: lessonData.content?.type ?? "standard",
        courseId: lessonData.courseId, // Include courseId
      };
    }, [lessonData]); // Only recalculate when lessonData changes

  // --- Handle Lesson Completion ---
  const handleLessonComplete = useCallback(async () => {
    if (!adaptedLesson || !validatedLessonId) {
      console.error("Cannot mark lesson complete: Missing lesson data or ID.");
      return;
    }

    const courseId = adaptedLesson.courseId;
    const lessonId = validatedLessonId;
    let loadingToastId: string | number | undefined = undefined; // Variable to hold toast ID

    if (isAuthenticated) {
      try {
        console.log(
          `LessonPage: Lesson ${lessonId} completed. Calling mutation...`
        );
        loadingToastId = toast.loading("Saving progress..."); // Store the ID

        await markCompleted({ lessonId, courseId });

        if (loadingToastId) toast.dismiss(loadingToastId); // Dismiss using the ID
        toast.success("Lesson completed! Redirecting...");
        console.log(
          `Redirecting authenticated user to course page: /course/${courseId}`
        );
        navigate(`/course/${courseId}`);
      } catch (mutationError: any) {
        console.error("Failed to mark lesson complete:", mutationError);
        if (loadingToastId) toast.dismiss(loadingToastId); // Dismiss on error too
        toast.error(
          `Error saving progress: ${mutationError.message || "Unknown error"}`
        );
      }
    } else {
      // User is not logged in: Skip saving, just redirect
      console.log(
        `LessonPage: Lesson ${lessonId} finished by unauthenticated user. Skipping save.`
      );
      toast.info("Lesson finished! Redirecting...");
      console.log(
        `Redirecting unauthenticated user to course page: /course/${courseId}`
      );
      navigate(`/course/${courseId}`);
    }
  }, [
    adaptedLesson,
    validatedLessonId,
    isAuthenticated,
    markCompleted,
    navigate,
  ]);

  // --- Render Logic ---
  if (validationError) {
    return (
      <div className="container mx-auto px-4 py-8 text-red-500">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{validationError}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="dark:text-gray-300">Loading lesson...</p>
      </div>
    );
  }

  if (adaptedLesson === null && validatedLessonId) {
    return (
      <div className="container mx-auto px-4 py-8 text-orange-500">
        <h1 className="text-2xl font-bold mb-4">Lesson Not Found</h1>
        <p>
          Could not find a lesson with ID: {validatedLessonId}, or lesson data
          is incomplete.
        </p>
      </div>
    );
  }

  // Handle case where adaptedLesson is null but validatedLessonId is also null (shouldn't happen if validation logic is sound)
  if (!adaptedLesson) {
    return (
      <div className="container mx-auto px-4 py-8 text-red-500">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>An unexpected error occurred while preparing the lesson.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <LessonRenderer
        lesson={adaptedLesson}
        isLoading={false}
        error={null}
        onLessonComplete={handleLessonComplete}
      />
    </div>
  );
};

export default LessonPage;
