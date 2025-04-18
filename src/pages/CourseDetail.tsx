import React, { useMemo } from "react";
import {
  useParams,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LessonTimeline from "@/components/LessonTimeline";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Helper function to check if a string is a valid Convex ID format
// Note: This is a basic check; Convex might have more specific validation
const isValidConvexId = (
  idString: string | undefined
): idString is Id<"courses"> => {
  // Basic check: Convex IDs are usually alphanumeric strings of a certain length
  // A more robust check might involve regex or length checks specific to Convex IDs
  return (
    typeof idString === "string" &&
    idString.length > 10 &&
    /^[a-zA-Z0-9_-]+$/.test(idString)
  );
};

const CourseDetail = () => {
  const { id: idFromParams } = useParams<{ id: string }>();
  const location = useLocation();
  const { userId, isLoaded: authLoaded } = useAuth();
  const navigate = useNavigate();

  console.log(`CourseDetail: Received id from params: ${idFromParams}`);

  // Validate the ID from URL params
  const isValidId = isValidConvexId(idFromParams);
  console.log(`CourseDetail: isValidId check result: ${isValidId}`);

  const courseId = isValidId ? idFromParams : undefined;
  console.log(`CourseDetail: Derived courseId for query: ${courseId}`);

  // Argument for the course query
  const courseQueryArgs =
    !location.state?.courseData && courseId ? { courseId } : "skip";
  console.log(`CourseDetail: Args for getCourseById query:`, courseQueryArgs);

  // Fetch course data ONLY if it wasn't passed via state and the ID is valid
  const course = useQuery(api.queries.getCourseById, courseQueryArgs);

  // Argument for lessons query
  const lessonsQueryArgs = courseId ? { courseId } : "skip";
  console.log(
    `CourseDetail: Args for getCourseLessons query:`,
    lessonsQueryArgs
  );
  const lessons = useQuery(api.queries.getCourseLessons, lessonsQueryArgs);

  // Argument for progress query
  const progressQueryArgs = userId && courseId ? { userId, courseId } : "skip";
  console.log(
    `CourseDetail: Args for getUserCourseProgress query:`,
    progressQueryArgs
  );
  const userProgress = useQuery(
    api.queries.getUserCourseProgress,
    progressQueryArgs
  );

  // Loading states
  const isCourseLoading = courseQueryArgs !== "skip" && course === undefined;
  const isLessonsLoading = lessonsQueryArgs !== "skip" && lessons === undefined;
  const isProgressLoading =
    progressQueryArgs !== "skip" && userProgress === undefined;
  const isLoading =
    !authLoaded || isCourseLoading || isLessonsLoading || isProgressLoading;
  console.log(
    `CourseDetail: Loading states -> auth: ${!authLoaded}, course: ${isCourseLoading}, lessons: ${isLessonsLoading}, progress: ${isProgressLoading}`
  );

  // Handle invalid ID format immediately
  if (!isValidId) {
    console.error("Invalid Course ID format:", idFromParams);
    // Optionally show a specific error message or redirect
    return <Navigate to="/404" replace />; // Redirect to a not found page
  }

  // Handle course not found after loading
  // Use courseDataFromState or fetched course
  const courseData = location.state?.courseData ?? course;
  console.log(
    `CourseDetail: Course data used for rendering (state or fetched):`,
    courseData
  ); // Log the actual data being used

  if (!isLoading && !courseData) {
    // Check if courseData is null/undefined after loading
    console.error("Course not found for ID (after loading):", courseId);
    return <Navigate to="/404" replace />; // Redirect if course doesn't exist
  }

  // Breadcrumbs (can be set once courseData is available)
  const breadcrumbItems = courseData
    ? [
        { label: "Menu", path: "/" },
        { label: "Course", path: `/course/${courseData._id}` },
      ]
    : [
        { label: "Menu", path: "/" },
        { label: "Course", path: "#" },
      ];

  // Determine Next Lesson
  const { status, nextLessonId } = useMemo(() => {
    if (isLoading || !lessons || lessons.length === 0) {
      console.warn("No lessons found for this course.");
      return { status: "loading", nextLessonId: null };
    }

    if (
      !userProgress ||
      !userProgress.completedLessons ||
      userProgress.completedLessons.length === 0
    ) {
      // User hasn't started or has no completed lessons -> start with the first lesson
      return { status: "not_started", nextLessonId: lessons[0]._id };
    }

    // User has progress, find the first lesson not in completedLessons
    const completedSet = new Set(userProgress.completedLessons);
    const firstIncompleteLesson = lessons.find(
      (lesson) => !completedSet.has(lesson._id)
    );

    if (firstIncompleteLesson) {
      return { status: "in_progress", nextLessonId: firstIncompleteLesson._id };
    }

    // All lessons completed - return the first lesson for review (or handle differently)
    console.log("All lessons completed for this course.");
    // toast.info("Course complete! You can review the lessons."); // Optional feedback
    return { status: "completed", nextLessonId: lessons[0]._id };
  }, [isLoading, lessons, userProgress]);

  // Button Click Handler
  const handleCourseAction = () => {
    if (isLoading || !nextLessonId) {
      if (!isLoading && lessons && lessons.length === 0) {
        toast.info("This course doesn't have any lessons yet.");
      } else {
        console.error(
          "Cannot start/continue course: Still loading or no next lesson determined."
        );
        toast.error("Could not determine next lesson. Please try again.");
      }
      return;
    }

    console.log(`Navigating to lesson: ${nextLessonId}`);
    navigate(`/lessons/${nextLessonId}`);
  };

  // Determine Course Action Button State
  let actionButton;
  if (!authLoaded) {
    actionButton = <Skeleton className="h-10 w-32 mt-4" />;
  } else if (!userId) {
    actionButton = (
      <Button onClick={handleCourseAction} className="mt-4">
        Start Course (Preview)
      </Button>
    );
  } else if (isLoading) {
    actionButton = <Skeleton className="h-10 w-32 mt-4" />;
  } else if (status === "completed") {
    actionButton = (
      <Button onClick={handleCourseAction} variant="outline" className="mt-4">
        Review Course
      </Button>
    );
  } else if (status === "in_progress") {
    actionButton = (
      <Button onClick={handleCourseAction} className="mt-4">
        Continue Course
      </Button>
    );
  } else {
    actionButton = (
      <Button onClick={handleCourseAction} variant="default" className="mt-4">
        Start Course
      </Button>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbNav items={breadcrumbItems} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Course Info */}
        <div className="space-y-6">
          {isLoading || !courseData ? (
            // Course Info Skeleton
            <div className="border border-black dark:border-white p-6 bg-white dark:bg-gray-800 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-20" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              {/* Skeleton for action button */}
              <Skeleton className="h-10 w-32 mt-4" />
            </div>
          ) : (
            // Actual Course Info
            <div className="border border-black dark:border-white p-6 bg-white dark:bg-gray-800">
              <h1 className="text-2xl font-bold mb-4 tracking-tight dark:text-white">
                {courseData.title}
              </h1>
              <p className="text-sm mb-6 dark:text-gray-300">
                {courseData.description}
              </p>
              <div className="flex justify-between items-center text-xs dark:text-gray-400">
                <Badge
                  variant="outline"
                  className="hover:bg-accent hover:text-white transition-colors"
                >
                  {isLessonsLoading ? "..." : (lessons?.length ?? 0)} lessons
                </Badge>
                <div className="flex gap-4">
                  <span>{courseData.level}</span>
                  {/* Display duration if available and needed */}
                  {/* <span>{courseData.duration}</span> */}
                </div>
              </div>
              {/* Course Action Button */}
              {actionButton}
            </div>
          )}
        </div>

        {/* Right Column - Lesson Timeline */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold dark:text-white">
              📚 Course Content
            </h2>
          </div>
          {isLessonsLoading ? (
            // Lesson Timeline Skeleton
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : lessons && lessons.length > 0 ? (
            // Actual Lesson Timeline with Progress
            <LessonTimeline
              lessons={lessons}
              completedLessons={userProgress?.completedLessons}
            />
          ) : (
            <p className="dark:text-gray-400">
              No lessons found for this course.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
