import React, { useEffect, useState } from 'react';
const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

function Home({ courses: initialCourses, navigate }) {
  const [courses, setCourses] = useState(initialCourses || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${BACKEND_URL}/api/courses/`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching courses:", err);
        setError('Failed to load courses. Please try again later.');
        setLoading(false);
      });
  }, []);

  // Helper to render star ratings
  const renderStars = (rating) => {
    const roundedRating = Math.round(rating);
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className={`w-4 h-4 ${i < roundedRating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Hero Section */}
      <section className="hero bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 md:py-24 lg:py-32 text-center rounded-3xl shadow-2xl mb-12 md:mb-16 transform hover:scale-102 transition-transform duration-500 ease-in-out overflow-hidden relative">
        {/* Background Overlay for Visual Interest */}
        <div className="absolute inset-0 bg-black opacity-10 rounded-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-6 leading-tight drop-shadow-lg animate-fade-in-down">
            Welcome to <span className="text-yellow-300">SHP-Learner</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 md:mb-10 opacity-90 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-4 animate-fade-in">
            Explore our wide range of meticulously crafted courses to elevate your skills and career.
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="btn bg-white text-blue-700 hover:bg-blue-100 hover:text-blue-800 px-8 py-3 md:px-10 md:py-4 text-lg md:text-xl font-semibold rounded-full shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out border-2 border-transparent hover:border-blue-700 animate-scale-in"
          >
            Browse All Courses
          </button>
        </div>
      </section>

      {/* Courses List */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-8 md:mb-12 text-gray-800 text-center relative">
        <span className="relative inline-block pb-2">
          Discover Our Popular Courses
          <span className="absolute bottom-0 left-1/2 w-20 h-1 bg-blue-500 transform -translate-x-1/2 rounded-full"></span>
        </span>
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24"></div>
          <p className="text-center text-xl text-blue-600 ml-4">Loading courses...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg text-center mx-auto max-w-md mt-8 shadow-md">
          <p className="text-lg">{error}</p>
          <p className="text-sm mt-2">Please check your internet connection or try again later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {courses && courses.length > 0 ? (
            courses.map((course) => (
              <div
                key={course.slug}
                className="card bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out border border-gray-100 transform hover:-translate-y-2 relative overflow-hidden group flex flex-col cursor-pointer"
                onClick={() => navigate(`/course/${course.slug}`)} // Make the whole card clickable
              >
                {/* Free badge */}
                {course.is_free && (
                  <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 tracking-wider shadow-md">
                    FREE
                  </span>
                )}
                {/* Course thumbnail */}
                <div className="w-full h-44 overflow-hidden rounded-xl mb-4 bg-gray-100 flex items-center justify-center">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : course.category?.image ? (
                    <img
                      src={course.category.image}
                      alt={course.category.name}
                      className="w-full h-full object-cover opacity-80"
                    />
                  ) : (
                    <div className="text-gray-400 text-lg flex flex-col items-center justify-center h-full w-full">
                      <svg className="w-12 h-12 mb-2 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-6h-2v6zm0-8h2V7h-2v2z"/>
                      </svg>
                      No Image Available
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-blue-700 group-hover:text-blue-900 transition-colors duration-300 leading-tight">
                  {course.title}
                </h3>

                {/* Rating and Reviews */}
                <div className="flex items-center text-gray-700 mb-3 text-base">
                  {renderStars(course.average_rating)}
                  <span className="ml-2 font-semibold">
                    {course.average_rating ? Number(course.average_rating).toFixed(1) : '0.0'}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    ({course.number_of_reviews || 0} reviews)
                  </span>
                </div>

                <div className="flex-grow text-sm text-gray-600 mb-4">
                  {/* Key Info Points - Reordered for prominence */}
                  <p className="mb-1">
                    <span className="font-semibold">Category:</span> <span className="text-blue-600 font-medium">{course.category?.name || 'Uncategorized'}</span>
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Level:</span> {course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'N/A'}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Lectures:</span> {course.total_lectures || 0}
                  </p>

                  {/* Short Description */}
                  <p className="text-gray-700 mt-3 leading-relaxed line-clamp-3">
                    {course.short_description ||
                      (course.description && course.description.split(' ').slice(0, 20).join(' ') + (course.description.split(' ').length > 20 ? '...' : '')) ||
                      'No description available.'}
                  </p>
                </div>

                {/* Instructor Details - More compact */}
                <div className="flex items-center text-gray-700 text-sm mb-4">
                  {course.instructor?.profile_picture ? (
                    <img
                      src={course.instructor.profile_picture}
                      alt={course.instructor.username}
                      className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-200"
                    />
                  ) : (
                    <svg className="w-8 h-8 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg>
                  )}
                  <div>
                    <span className="font-semibold">By:</span> <span className="ml-1 text-blue-600">{course.instructor?.username || 'N/A'}</span>
                    {/* Optionally show instructor rating here if space allows, or on detail page */}
                    {/* <span className="text-xs text-gray-500 block">Rating: {course.instructor?.instructor_rating ?? 'N/A'}</span> */}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between text-gray-700 pt-4 border-t border-gray-100">
                  <strong className="text-lg">Price:</strong>{' '}
                  {course.is_free ? (
                    <span className="text-green-600 font-bold text-xl">Free</span>
                  ) : (
                    <span className="text-xl font-bold text-blue-800">
                      ₹{typeof course.price === 'number'
                        ? course.price.toFixed(2)
                        : (parseFloat(course.price) ? Number(parseFloat(course.price).toFixed(2)).toFixed(2) : '0.00')}
                    </span>
                  )}
                </div>

                {/* The whole card is now clickable, so the button is less critical but still good for visual CTA */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card's onClick from firing again
                    navigate(`/course/${course.slug}`);
                  }}
                  className="btn bg-blue-900 text-white w-full py-2 mt-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:scale-105 transition duration-300 ease-in-out text-base md:text-lg font-semibold"
                >
                  View Details
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600 col-span-full text-center py-8 md:py-12 text-lg md:text-xl italic">
              No courses available at the moment. Please check back soon!
            </p>
          )}
        </div>
      )}

      {/* Tailwind CSS Customizations and Animations */}
      <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 1s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 1.5s ease-out forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.7s ease-out forwards;
        }
        .loader {
          border-top-color: #3498db;
          -webkit-animation: spinner 1.5s linear infinite;
          animation: spinner 1.5s linear infinite;
        }
        @-webkit-keyframes spinner {
          0% { -webkit-transform: rotate(0deg); }
          100% { -webkit-transform: rotate(360deg); }
        }
        @keyframes spinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Home;