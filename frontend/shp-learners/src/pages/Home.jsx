import React, { useEffect, useState } from 'react';

function Home({ courses: initialCourses, navigate }) {
  const [courses, setCourses] = useState(initialCourses || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('https://shp-learner.onrender.com/api/courses/')
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
                className="card bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out border border-gray-100 transform hover:-translate-y-2 relative overflow-hidden group flex flex-col"
              >
                {/* Free badge */}
                {course.is_free && (
                  <span className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 tracking-wider">
                    FREE
                  </span>
                )}
                {/* Course thumbnail */}
                {course.thumbnail && (
                  <div className="w-full h-40 overflow-hidden rounded-lg mb-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-blue-700 group-hover:text-blue-900 transition-colors duration-300 leading-tight">
                  {course.title}
                </h3>
                <div className="flex-grow"> {/* Allows content to push button to bottom */}
                  <p className="text-gray-600 mb-1 text-sm md:text-base">
                    <span className="font-semibold">Category:</span> {course.category?.name || 'Uncategorized'}
                  </p>
                  <p className="text-gray-600 mb-1 text-sm md:text-base">
                    <span className="font-semibold">Level:</span> {course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'N/A'}
                  </p>
                  <p className="text-gray-600 mb-1 text-sm md:text-base">
                    <span className="font-semibold">Duration:</span> {course.duration || 'N/A'}
                  </p>
                  <p className="text-gray-600 mb-1 text-sm md:text-base">
                    <span className="font-semibold">Lectures:</span> {course.total_lectures || 0}
                  </p>
                  <div className="flex items-center text-gray-600 mb-2 text-sm md:text-base">
                    <span className="font-semibold mr-1">Rating:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < Math.round(course.average_rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1">
                      {course.average_rating ? course.average_rating.toFixed(1) : '0.0'} / 5 ({course.number_of_reviews || 0} reviews)
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4 text-sm md:text-base leading-relaxed line-clamp-3"> {/* Added line-clamp */}
                    {course.short_description || (course.description && course.description.split(' ').slice(0, 25).join(' ') + (course.description.split(' ').length > 25 ? '...' : '')) || 'No description available.'}
                  </p>
                  <div className="flex items-center text-gray-700 mb-3 text-sm md:text-base">
                    <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg>
                    <strong className="font-semibold">Instructor:</strong> <span className="ml-1">{course.instructor?.username || 'N/A'}</span>
                  </div>
                </div> {/* End flex-grow */}

                <div className="flex items-center text-gray-700 mb-4 text-sm md:text-base justify-between">
                  <strong className="font-semibold">Price:</strong>{' '}
                  {course.is_free ? (
                    <span className="text-green-600 font-bold ml-1 text-lg">Free</span>
                  ) : (
                    <span className="ml-1 text-lg font-bold">
                      ₹{typeof course.price === 'number'
                        ? course.price.toFixed(2)
                        : (parseFloat(course.price) ? Number(parseFloat(course.price).toFixed(2)) : '0.00')}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/course/${course.slug}`)}
                  className="btn bg-blue-600 text-white w-full py-2 md:py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:scale-105 transition duration-300 ease-in-out text-base md:text-lg font-semibold"
                >
                  View Course Details
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