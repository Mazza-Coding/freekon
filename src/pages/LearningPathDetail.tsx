import React from "react";
import { useParams, useLocation, Navigate, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, CheckCircle } from "lucide-react";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to check if a string is a valid Convex ID format
const isValidConvexId = (
  idString: string | undefined
): idString is Id<"learningPaths"> => {
  return (
    typeof idString === "string" &&
    idString.length > 10 &&
    /^[a-zA-Z0-9_-]+$/.test(idString)
  );
};

const LearningPathDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const statePathData = location.state?.pathData as
    | Doc<"learningPaths">
    | undefined;

  // Validate the ID from URL params
  const isValidId = isValidConvexId(id);
  const pathId = isValidId ? id : undefined;

  // Fetch path data ONLY if it wasn't passed via state and the ID is valid
  const fetchedPathData = useQuery(
    api.queries.getLearningPathById,
    !statePathData && pathId ? { pathId } : "skip"
  );

  // Determine the final path data to use
  const pathData = statePathData || fetchedPathData;

  // Extract course IDs once pathData is available
  const courseIds = pathData?.courses;

  // Fetch associated course details if courseIds are available
  const coursesData = useQuery(
    api.queries.getCoursesByIds,
    courseIds && courseIds.length > 0 ? { courseIds } : "skip"
  );

  // Fetch user progress for this path (only if authenticated and pathId is valid)
  const userPathProgress = useQuery(
    api.queries.getUserPathProgress,
    userId && pathId ? { userId, pathId } : "skip"
  );

  // --- Reorder Courses ---
  // The `getCoursesByIds` query fetches courses but doesn't preserve the order
  // specified in `pathData.courses`. We need to reorder them.
  const orderedCourses = React.useMemo(() => {
    if (!coursesData || !courseIds) return undefined;
    const courseMap = new Map(
      coursesData.map((course) => [course._id, course])
    );
    return courseIds
      .map((id) => courseMap.get(id))
      .filter((c): c is Doc<"courses"> => c !== undefined);
  }, [coursesData, courseIds]);

  // Loading states
  const isPathLoading = !statePathData && fetchedPathData === undefined;
  const areCoursesLoading =
    pathData && coursesData === undefined && (courseIds?.length ?? 0) > 0;
  // Progress is loading if auth is loaded, user is logged in, and progress data hasn't arrived
  const isProgressLoading =
    isAuthLoaded && !!userId && userPathProgress === undefined;
  // Overall loading state considers path, courses, and progress (if user is logged in)
  const isLoading =
    isPathLoading ||
    areCoursesLoading ||
    (isAuthLoaded && !userId ? false : isProgressLoading);

  // Handle invalid ID format immediately
  if (!isValidId) {
    console.error("Invalid Learning Path ID format:", id);
    return <Navigate to="/404" replace />;
  }

  // Handle path not found after loading
  if (!isPathLoading && !pathData) {
    console.error("Learning Path not found for ID:", id);
    return <Navigate to="/404" replace />;
  }

  // Breadcrumbs
  const breadcrumbItems = pathData
    ? [
        { label: "Menu", path: "/" },
        { label: "Path", path: `/path/${pathData._id}` },
      ]
    : [
        { label: "Menu", path: "/" },
        { label: "Path", path: "#" },
      ];

  // Determine Path Action Button State
  let actionButton;
  if (!isAuthLoaded) {
    actionButton = <Skeleton className="h-10 w-32 mt-4" />; // Skeleton while auth loads
  } else if (!userId) {
    actionButton = (
      <Button
        variant="outline"
        disabled
        className="mt-4 border-black dark:border-white dark:text-white"
      >
        Sign in to track progress
      </Button>
    );
  } else if (isLoading) {
    // Check isLoading *after* checking userId
    actionButton = <Skeleton className="h-10 w-32 mt-4" />; // Skeleton while path/progress loads
  } else if (userPathProgress) {
    actionButton = <Button className="mt-4">Continue Path</Button>; // Add onClick later
  } else {
    actionButton = (
      <Button variant="default" className="mt-4">
        Start Path
      </Button>
    ); // Add onClick later
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbNav items={breadcrumbItems} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Path Info */}
        <div className="space-y-6">
          {isPathLoading || !pathData ? (
            // Path Info Skeleton
            <div className="border border-black dark:border-white p-6 bg-white dark:bg-gray-800 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-24" />
              </div>
              {/* Skeleton for action button */}
              <Skeleton className="h-10 w-32 mt-4" />
            </div>
          ) : (
            // Actual Path Info
            <div className="border border-black dark:border-white p-6 bg-white dark:bg-gray-800">
              <h1 className="text-2xl font-bold mb-4 tracking-tight dark:text-white">
                {pathData.title}
              </h1>
              <p className="text-sm mb-6 dark:text-gray-300">
                {pathData.description}
              </p>
              <div className="flex justify-between items-center text-xs dark:text-gray-400">
                <Badge
                  variant="outline"
                  className="hover:bg-accent hover:text-white transition-colors"
                >
                  {pathData.courses.length} courses
                </Badge>
              </div>
              {/* Place Action Button here, after the badge/description block */}
              {!isPathLoading && actionButton}
            </div>
          )}
        </div>

        {/* Right Column - Course List */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold dark:text-white">
              📚 Path Content
            </h2>
          </div>
          <ScrollArea className="h-[600px] w-full pr-4">
            <div className="space-y-4">
              {isLoading || areCoursesLoading ? (
                // Course List Skeletons
                <>
                  {Array.from({ length: pathData?.courses?.length || 3 }).map(
                    (_, index) => (
                      <Skeleton key={index} className="h-16 w-full" />
                    )
                  )}
                </>
              ) : orderedCourses && orderedCourses.length > 0 ? (
                // Render Actual Courses
                orderedCourses.map((course, index) => {
                  // Check if this course ID is in the completed list
                  const isCompleted =
                    userPathProgress?.completedCourses?.includes(course._id) ??
                    false;
                  return (
                    <Link
                      key={course._id}
                      to={`/course/${course._id}`}
                      className="block hover:no-underline"
                      state={{ courseData: course }} // Pass course data
                    >
                      {/* Apply different styles based on completion */}
                      <div
                        className={`group border p-4 hover:border-accent transition-colors duration-300 cursor-pointer bg-white dark:bg-gray-800 ${isCompleted ? "border-green-500 dark:border-green-400" : "border-black dark:border-white"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-mono text-sm ${isCompleted ? "text-green-600 dark:text-green-400" : "dark:text-gray-300"}`}
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <BookOpen
                              size={16}
                              className={`transition-colors duration-300 ${isCompleted ? "text-green-500 dark:text-green-400" : "group-hover:text-accent dark:text-gray-300"}`}
                            />
                            <h3
                              className={`font-mono text-sm ${isCompleted ? "text-green-600 dark:text-green-400 line-through" : "dark:text-gray-300"}`}
                            >
                              {course.title}
                            </h3>
                          </div>
                          {isCompleted && (
                            <CheckCircle
                              size={18}
                              className="text-green-500 dark:text-green-400"
                            />
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <p className="dark:text-gray-400">
                  No courses found for this path.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default LearningPathDetail;
