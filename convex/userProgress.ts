import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// --- Mutation to mark a lesson as completed and update progress ---
export const markLessonCompleted = mutation({
  args: {
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    // 1. Get User Identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated.");
    }
    const userId = identity.subject; // Clerk user ID

    // 2. Find existing UserProgress document
    const existingProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", userId).eq("courseId", args.courseId)
      )
      .unique();

    // 3. Get total number of lessons for the course
    // Note: This assumes lessons for a course won't change *during* this mutation.
    // Consider caching or alternative approaches if course structures change frequently.
    const courseLessons = await ctx.db
      .query("lessons")
      .withIndex("by_course_order", (q) => q.eq("courseId", args.courseId))
      .collect();
    const totalLessons = courseLessons.length;

    if (totalLessons === 0) {
      console.warn(
        `Course ${args.courseId} has no lessons. Cannot calculate progress.`
      );
      // Decide if you still want to record the completion attempt
      // For now, let's just return early without error but indicate no progress change.
      return { success: true, progress: existingProgress?.progress ?? 0 };
    }

    // 4. Prepare updated data
    let newCompletedLessons: Id<"lessons">[];
    if (existingProgress?.completedLessons) {
      // Add lessonId to existing array, avoiding duplicates
      const completedSet = new Set(existingProgress.completedLessons);
      completedSet.add(args.lessonId);
      newCompletedLessons = Array.from(completedSet);
    } else {
      // Create new array if no progress existed
      newCompletedLessons = [args.lessonId];
    }

    // 5. Calculate new progress percentage
    const newProgress = Math.round(
      (newCompletedLessons.length / totalLessons) * 100
    );

    // 6. Update or Insert UserProgress
    if (existingProgress) {
      // Update existing document
      await ctx.db.patch(existingProgress._id, {
        completedLessons: newCompletedLessons,
        progress: newProgress,
        lastAccessedAt: Date.now(), // Update last accessed time
      });
      console.log(
        `Updated progress for user ${userId}, course ${args.courseId}`
      );
    } else {
      // Insert new document
      await ctx.db.insert("userProgress", {
        userId: userId,
        courseId: args.courseId,
        completedLessons: newCompletedLessons,
        progress: newProgress,
        lastAccessedAt: Date.now(),
      });
      console.log(
        `Inserted initial progress for user ${userId}, course ${args.courseId}`
      );
    }

    return { success: true, progress: newProgress };
  },
});

// --- Optional: Add queries related to user progress if needed ---
// Example: Get progress for a specific course (already exists in queries.ts?)
// Example: Get all courses a user has progress on
