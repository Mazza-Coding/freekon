import React from "react";
import SearchBar from "../components/SearchBar";
import CourseCard from "../components/CourseCard";
import PathCard from "../components/PathCard";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api"; // Adjusted path
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  // Fetch dynamic data from Convex
  const featuredCourses = useQuery(api.queries.getFeaturedCourses);
  const learningPaths = useQuery(api.queries.getLearningPaths);

  const isLoading =
    featuredCourses === undefined || learningPaths === undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-16">
        Menu
        <div className="flex justify-center mb-8">
          <SearchBar />
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Featured Courses Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">
              ✨ Featured Courses
            </h2>
            <div className="grid gap-6">
              {isLoading ? (
                // Loading Skeletons for Courses
                <>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-[180px] w-full" />
                  ))}
                </>
              ) : featuredCourses && featuredCourses.length > 0 ? (
                // Render Courses
                featuredCourses.map((course) => (
                  <Link
                    key={course._id}
                    to={`/course/${course._id}`} // Use Convex _id
                    className="block hover:no-underline group"
                    state={{ courseData: course }} // Pass course data via state
                  >
                    <CourseCard
                      title={course.title}
                      description={course.description}
                      level={course.level}
                    />
                  </Link>
                ))
              ) : (
                <p className="dark:text-gray-400">No featured courses found.</p> // Handle no data
              )}
            </div>
          </section>

          {/* Learning Paths Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">
              🛤️ Learning Paths
            </h2>
            <div className="grid gap-6">
              {isLoading ? (
                // Loading Skeletons for Paths
                <>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-[180px] w-full" />
                  ))}
                </>
              ) : learningPaths && learningPaths.length > 0 ? (
                // Render Paths
                learningPaths.map((path) => (
                  <PathCard
                    key={path._id}
                    id={path._id}
                    title={path.title}
                    description={path.description}
                    courses={path.courses.length}
                    pathData={path}
                  />
                ))
              ) : (
                <p className="dark:text-gray-400">No learning paths found.</p> // Handle no data
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
