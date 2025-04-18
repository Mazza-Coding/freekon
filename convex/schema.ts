import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  courses: defineTable({
    title: v.string(),
    description: v.string(),
    level: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    ),
    createdAt: v.number(), // Timestamp
    updatedAt: v.number(), // Timestamp
  }).index("by_level", ["level"]),

  lessons: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    orderIndex: v.number(), // Position in course sequence
    content: v.object({
      // Content structure to support rich, interactive learning
      type: v.string(), // e.g., "text", "quiz", "interactive", "code"
      blocks: v.array(
        v.object({
          id: v.string(),
          type: v.string(), // e.g., "paragraph", "heading", "image", "code", "quiz", "interactive"
          content: v.any(), // Flexible content based on block type
          metadata: v.optional(
            v.object({
              // Additional properties based on block type
              language: v.optional(v.string()), // For code blocks
              difficulty: v.optional(v.string()), // For quizzes
              interactivity: v.optional(v.any()), // For interactive elements
            })
          ),
        })
      ),
    }),
    createdAt: v.number(), // Timestamp
    updatedAt: v.number(), // Timestamp
  })
    .index("by_course", ["courseId"])
    .index("by_course_order", ["courseId", "orderIndex"]),

  learningPaths: defineTable({
    title: v.string(),
    description: v.string(),
    courses: v.array(v.id("courses")), // Array of course IDs
    createdAt: v.number(), // Timestamp
    updatedAt: v.number(), // Timestamp
  }),

  // User progress tracking
  userProgress: defineTable({
    userId: v.string(), // User identifier from Clerk
    courseId: v.id("courses"),
    completedLessons: v.array(v.id("lessons")),
    lastAccessedAt: v.number(), // Timestamp
    completedAt: v.optional(v.number()), // Timestamp when course was completed
    progress: v.number(), // Percentage of completion (0-100)
  })
    .index("by_user", ["userId"])
    .index("by_user_course", ["userId", "courseId"]),

  // User progress tracking for learning paths
  userPathProgress: defineTable({
    userId: v.string(), // User identifier from Clerk
    pathId: v.id("learningPaths"),
    completedCourses: v.array(v.id("courses")), // IDs of completed courses within the path
    lastAccessedAt: v.number(), // Timestamp
    completedAt: v.optional(v.number()), // Timestamp when path was completed
    progress: v.number(), // Percentage of completion (0-100)
  })
    .index("by_user", ["userId"]) // Index for all paths a user is on
    .index("by_user_path", ["userId", "pathId"]), // Index for specific user/path progress
});
