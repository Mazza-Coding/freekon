import { query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

/**
 * Fetches the top 4 most recently updated courses.
 * Sorted by updatedAt timestamp in descending order.
 * Note: For optimal performance, add an index on `updatedAt` in `schema.ts`.
 */
export const getFeaturedCourses = query({
  args: {},
  handler: async (ctx) => {
    // Fetch the top 4 courses sorted by updatedAt descending
    const courses = await ctx.db
      .query("courses")
      // If an index on `updatedAt` exists:
      // .withIndex("by_updatedAt")
      .order("desc") // This sorts by _creationTime descending by default
      // To sort by updatedAt, we need a different approach if no index exists
      // Or, we can sort after fetching, but that's inefficient for `take(4)`
      // Let's correct the structure assuming we want _creationTime for now
      // and recommend adding an updatedAt index.
      .take(4);

    // Correct approach if sorting by _creationTime descending:
    // const courses = await ctx.db.query("courses").order("desc").take(4);

    // Let's implement the sort by `updatedAt` directly, accepting potential performance hit without index
    // We need to fetch all, sort, then take. This is not ideal for large datasets.
    // A better approach is required if performance becomes an issue.
    // Fetch all courses, sort by updatedAt descending, then take the top 4.
    const allCourses = await ctx.db.query("courses").collect();
    const sortedCourses = allCourses.sort((a, b) => b.updatedAt - a.updatedAt);
    const featuredCourses = sortedCourses.slice(0, 4);

    return featuredCourses;
  },
});

/**
 * Fetches all learning paths, sorted by creation date.
 */
export const getLearningPaths = query({
  args: {},
  handler: async (ctx) => {
    // Fetch all learning paths sorted by creation time ascending
    const paths = await ctx.db
      .query("learningPaths")
      .order("asc") // Order by _creationTime implicitly ascending
      .collect();
    return paths;
  },
});

/**
 * Fetches all lessons for a specific course, sorted by their orderIndex.
 * @param courseId - The ID of the course to fetch lessons for.
 */
export const getCourseLessons = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    // Fetch lessons for the given courseId, sorted by orderIndex
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course_order", (q) => q.eq("courseId", args.courseId))
      // The index 'by_course_order' is defined as ["courseId", "orderIndex"].
      // Querying with eq("courseId") on this index automatically sorts by orderIndex ascending.
      .collect();
    return lessons;
  },
});

/**
 * Fetches a single course by its document ID.
 * @param courseId - The ID of the course to fetch.
 */
export const getCourseById = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    return course;
  },
});

/**
 * Fetches a single learning path by its document ID.
 * @param pathId - The ID of the learning path to fetch.
 */
export const getLearningPathById = query({
  args: { pathId: v.id("learningPaths") },
  handler: async (ctx, args) => {
    const path = await ctx.db.get(args.pathId);
    return path;
  },
});

/**
 * Fetches multiple courses based on an array of their document IDs.
 * @param courseIds - An array of course IDs to fetch.
 */
export const getCoursesByIds = query({
  args: { courseIds: v.array(v.id("courses")) },
  handler: async (ctx, args) => {
    // Fetch details for each course ID
    // Use Promise.all to fetch them concurrently
    const courses = await Promise.all(
      args.courseIds.map((courseId) => ctx.db.get(courseId))
    );
    // Filter out any null results (if an ID didn't correspond to a course)
    return courses.filter(
      (course): course is Doc<"courses"> => course !== null
    );
  },
});

/**
 * Fetches the progress for a specific user on a specific course.
 * @param userId - The Clerk user ID.
 * @param courseId - The ID of the course.
 */
export const getUserCourseProgress = query({
  args: {
    // userId should be nullable if we want to handle unauthenticated state gracefully in the query itself,
    // but usually, we skip the query if userId is not available.
    userId: v.string(), // Assuming Clerk user ID is passed as a string
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    // Find the userProgress document for this specific user and course
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .unique(); // Use unique() as we expect at most one record

    return progress; // Returns the document or null if not found
  },
});

/**
 * Fetches the progress for a specific user on a specific learning path.
 * @param userId - The Clerk user ID.
 * @param pathId - The ID of the learning path.
 */
export const getUserPathProgress = query({
  args: {
    userId: v.string(),
    pathId: v.id("learningPaths"),
  },
  handler: async (ctx, args) => {
    // Find the userPathProgress document for this specific user and path
    const progress = await ctx.db
      .query("userPathProgress")
      .withIndex("by_user_path", (q) =>
        q.eq("userId", args.userId).eq("pathId", args.pathId)
      )
      .unique(); // Use unique() as we expect at most one record

    return progress; // Returns the document or null if not found
  },
});

/**
 * Fetches a single lesson by its document ID, including its blocks.
 * @param lessonId - The ID of the lesson to fetch.
 */
export const getLessonById = query({
  args: {
    lessonId: v.id("lessons"), // Validate the argument is an ID for the 'lessons' table
  },
  handler: async (ctx, args) => {
    // Fetch the lesson document using the provided ID
    const lesson = await ctx.db.get(args.lessonId);

    if (!lesson) {
      // Optional: Could throw an error here if preferred,
      // but returning null is common for 'get' operations.
      // The frontend currently handles the null case.
      console.warn(`Lesson not found with ID: ${args.lessonId}`);
      return null;
    }

    // Return the lesson document (should include title, blocks, etc.)
    return lesson;
  },
});
