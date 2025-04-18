import React, { useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import CourseCard from "../components/CourseCard";
import PathCard from "../components/PathCard";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const Index = () => {
  // --- State for Search ---
  const [searchTerm, setSearchTerm] = useState(""); // Current input value
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null); // Query to execute

  // --- Fetch Default Data ---
  const featuredCourses = useQuery(api.queries.getFeaturedCourses);
  const learningPaths = useQuery(api.queries.getLearningPaths);

  // --- Fetch Search Results (Conditional) ---
  const searchResults = useQuery(
    api.queries.searchCoursesAndPaths,
    // Only run query if submittedQuery is not null and has length >= 2
    submittedQuery && submittedQuery.length >= 2
      ? { searchInput: submittedQuery }
      : "skip"
  );

  // --- Loading States ---
  const isDefaultLoading =
    featuredCourses === undefined || learningPaths === undefined;
  // Search is loading if a query was submitted but results are undefined
  const isSearchLoading =
    submittedQuery && submittedQuery.length >= 2 && searchResults === undefined;

  // --- Handlers ---
  const handleSearchSubmit = (query: string) => {
    const trimmedQuery = query.trim();
    console.log("Search submitted:", trimmedQuery);
    setSubmittedQuery(trimmedQuery.length > 0 ? trimmedQuery : null); // Set to null if empty to clear search
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Optional: Clear submitted query if user types again after submitting?
    // Or keep results visible until next submit/clear?
    // Let's keep results visible for now.
  };

  // Add handler to reset search state
  const handleMenuClick = () => {
    console.log("Menu clicked, resetting search state.");
    setSearchTerm(""); // Clear the visual input
    setSubmittedQuery(null); // Clear the search results trigger
    // Navigation is handled by the Link component itself
  };

  // --- Render Logic ---
  const showSearchResults = submittedQuery && submittedQuery.length >= 2;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-16 ">
        <Link to="/" onClick={handleMenuClick}>
          Menu
        </Link>
        <div className="flex justify-center">
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />
        </div>
      </header>

      {/* Conditional Rendering: Search Results or Default Content */}
      {showSearchResults ? (
        // --- Search Results View ---
        <section className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">
            Search Results for "{submittedQuery}"
          </h2>
          {isSearchLoading ? (
            // Loading Skeletons for Search Results
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-[180px] w-full" />
              ))}
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            // Render Search Results
            <div className="grid md:grid-cols-2 gap-6">
              {searchResults.map((item) =>
                item.type === "course" ? (
                  <Link
                    key={item._id}
                    to={`/course/${item._id}`}
                    className="block hover:no-underline group"
                    state={{ courseData: item }}
                  >
                    <CourseCard
                      title={item.title}
                      description={item.description}
                      level={item.level}
                    />
                  </Link>
                ) : (
                  <PathCard
                    key={item._id}
                    id={item._id}
                    title={item.title}
                    description={item.description}
                    courses={item.courses.length} // Assuming path results have courses array
                    pathData={item}
                  />
                )
              )}
            </div>
          ) : (
            // No Results Found
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>No Results Found</AlertTitle>
              <AlertDescription>
                Your search for "{submittedQuery}" did not return any courses or
                learning paths.
              </AlertDescription>
            </Alert>
          )}
        </section>
      ) : (
        // --- Default View ---
        <main className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Featured Courses Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 dark:text-white">
                ✨ Featured Courses
              </h2>
              <div className="grid gap-6">
                {isDefaultLoading ? (
                  <>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-[180px] w-full" />
                    ))}
                  </>
                ) : featuredCourses && featuredCourses.length > 0 ? (
                  featuredCourses.map((course) => (
                    <Link
                      key={course._id}
                      to={`/course/${course._id}`}
                      className="block hover:no-underline group"
                      state={{ courseData: course }}
                    >
                      <CourseCard
                        title={course.title}
                        description={course.description}
                        level={course.level}
                      />
                    </Link>
                  ))
                ) : (
                  <p className="dark:text-gray-400">
                    No featured courses found.
                  </p>
                )}
              </div>
            </section>

            {/* Learning Paths Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 dark:text-white">
                🛤️ Learning Paths
              </h2>
              <div className="grid gap-6">
                {isDefaultLoading ? (
                  <>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-[180px] w-full" />
                    ))}
                  </>
                ) : learningPaths && learningPaths.length > 0 ? (
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
                  <p className="dark:text-gray-400">No learning paths found.</p>
                )}
              </div>
            </section>
          </div>
        </main>
      )}
    </div>
  );
};

export default Index;
