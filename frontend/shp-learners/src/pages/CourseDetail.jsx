import React from 'react';

function CourseDetail({ course, isEnrolled, user, navigate, enrollment }) {
  if (!course) {
    return <p className="text-center text-xl mt-10 text-red-600">Course not found.</p>;
  }

  const enrolledAt = enrollment?.enrolled_at;
  const progress = enrollment?.progress;
  const instructor = course.instructor || {};
  const category = course.category || {};

  return (
    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl border border-gray-100 max-w-4xl mx-auto mt-10">
      <div className="flex flex-col md:flex-row gap-8 mb-6">
        {/* Course Thumbnail or Category Image */}
        <div className="flex-shrink-0">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-56 h-56 object-cover rounded-xl border shadow"
            />
          ) : category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="w-56 h-56 object-cover rounded-xl border shadow"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center bg-gray-100 rounded-xl border text-gray-400">
              No Image
            </div>
          )}
        </div>
        {/* Main Info */}
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-800 mb-2">{course.title}</h1>
          <p className="text-gray-700 mb-3 text-lg">{course.short_description || course.description}</p>
          <div className="flex flex-wrap gap-4 items-center mb-3">
            <span className="inline-flex items-center bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              <strong>Category:</strong>&nbsp;{category.name}
            </span>
            <span className="inline-flex items-center bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <strong>Level:</strong>&nbsp;{course.level}
            </span>
            <span className="inline-flex items-center bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              <strong>Lectures:</strong>&nbsp;{course.total_lectures}
            </span>
            <span className="inline-flex items-center bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              <strong>Rating:</strong>&nbsp;{course.average_rating}
            </span>
            <span className="inline-flex items-center bg-gray-50 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              <strong>Reviews:</strong>&nbsp;{course.number_of_reviews}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-semibold text-gray-800">Instructor:</span>
            <span className="flex items-center gap-2">
              {instructor.profile_picture && (
                <img
                  src={instructor.profile_picture}
                  alt={instructor.username}
                  className="w-8 h-8 rounded-full object-cover border"
                />
              )}
              <span className="font-medium">{instructor.username}</span>
              {instructor.instructor_rating > 0 && (
                <span className="ml-2 text-yellow-600 text-xs bg-yellow-100 px-2 py-0.5 rounded-full">
                  ⭐ {instructor.instructor_rating.toFixed(1)}
                </span>
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 mb-2">
            <span className="text-gray-700">
              <strong>Price:</strong> {course.is_free ? 'Free of Cost' : `₹${course.price}`}
            </span>
            <span className="text-gray-500 text-sm">
              <strong>Published:</strong>{' '}
              {new Date(course.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          {course.duration && (
            <div className="text-gray-700 mb-2">
              <strong>Duration:</strong> {course.duration}
            </div>
          )}
          {course.promo_video_url && (
            <div className="mb-2">
              <a
                href={course.promo_video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition"
              >
                ▶ Watch Promo Video
              </a>
            </div>
          )}
        </div>
      </div>

      {/* What you'll learn, Requirements, Target Audience */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {course.what_you_will_learn && (
          <section className="bg-blue-50 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-1">What you'll learn</h2>
            <p className="text-gray-700 text-sm">{course.what_you_will_learn}</p>
          </section>
        )}
        {course.requirements && (
          <section className="bg-green-50 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-green-900 mb-1">Requirements</h2>
            <p className="text-gray-700 text-sm">{course.requirements}</p>
          </section>
        )}
        {course.target_audience && (
          <section className="bg-yellow-50 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-yellow-900 mb-1">Target Audience</h2>
            <p className="text-gray-700 text-sm">{course.target_audience}</p>
          </section>
        )}
      </div>

      {/* Enrollment/Progress Section */}
      <div className="mb-8">
        {user ? (
          isEnrolled ? (
            <div className="bg-green-50 border border-green-300 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-green-700 font-semibold flex items-center gap-2">
                  <span role="img" aria-label="enrolled">🎉</span> You are enrolled in this course!
                </p>
                {enrolledAt && (
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Enrolled At:</strong>{' '}
                    {new Date(enrolledAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
                <p className="text-sm text-gray-700">
                  <strong>Progress:</strong> {progress ?? 0}%
                </p>
              </div>
              <button
                disabled
                className="bg-green-600 text-white px-6 py-2 rounded-lg opacity-80 cursor-not-allowed font-semibold"
              >
                Enrolled
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate(`/enroll/${course.slug}`)}
              className="bg-blue-700 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg transition duration-300 shadow"
            >
              Enroll Now
            </button>
          )
        ) : (
          <p className="text-gray-700">
            Please{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 font-medium hover:underline"
            >
              log in
            </button>{' '}
            to enroll in this course.
          </p>
        )}
      </div>

      {/* Lessons Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Lessons</h2>
        {isEnrolled ? (
          course.lessons && course.lessons.length > 0 ? (
            <div className="space-y-3">
              {course.lessons.map((lesson) => (
                <div
                  key={lesson.order}
                  className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Lesson {lesson.order}: {lesson.title}
                    </p>
                  </div>
                  {lesson.video_url && (
                    <a
                      href={lesson.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      ▶ Watch
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No lessons available yet.</p>
          )
        ) : (
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded">
            You need to enroll in this course to access the lessons.
          </div>
        )}
      </div>

      {/* More Details Section */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-5 border">
          <h3 className="font-semibold text-gray-800 mb-2">Course Details</h3>
          <ul className="text-gray-700 text-sm space-y-1">
            <li><strong>Course ID:</strong> {course.id}</li>
            <li><strong>Slug:</strong> {course.slug}</li>
            <li><strong>Published:</strong> {course.is_published ? 'Yes' : 'No'}</li>
            <li><strong>Created:</strong> {new Date(course.created_at).toLocaleString()}</li>
            <li><strong>Updated:</strong> {new Date(course.updated_at).toLocaleString()}</li>
          </ul>
        </div>
        <div className="bg-gray-50 rounded-xl p-5 border">
          <h3 className="font-semibold text-gray-800 mb-2">Instructor Details</h3>
          <ul className="text-gray-700 text-sm space-y-1">
            <li><strong>Username:</strong> {instructor.username}</li>
            <li><strong>Email:</strong> {instructor.email || 'N/A'}</li>
            <li><strong>Bio:</strong> {instructor.bio || 'N/A'}</li>
            <li><strong>Joined:</strong> {instructor.date_joined ? new Date(instructor.date_joined).toLocaleDateString() : 'N/A'}</li>
            <li><strong>Role:</strong> {instructor.role}</li>
            <li><strong>Rating:</strong> {instructor.instructor_rating ?? 'N/A'}</li>
            <li><strong>Total Reviews:</strong> {instructor.total_reviews ?? 0}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
