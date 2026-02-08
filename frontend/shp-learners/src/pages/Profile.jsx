import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../App.jsx';

// Use Vite env variable or fallback
const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

function Profile({ user, enrollments, navigate }) {
  // Safely get context values, fallback to props or empty object
  const userContext = useContext(UserContext) || {};
  const currentUser = userContext.user || user;
  const handleLogin = userContext.handleLogin || (() => {});

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (currentUser) {
      setForm({ ...currentUser });
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p className="text-center text-xl text-gray-700 bg-white p-8 rounded-lg shadow-lg">
          Please log in to view your profile.
        </p>
      </div>
    );
  }

  const isUser = currentUser.role === 'student'; // Clarified 'isUser' to mean 'student'

  // Editable fields logic
  const editableFields = isUser
    ? [
        { key: 'profile_picture', label: 'Profile Picture', type: 'file' },
        { key: 'first_name', label: 'First Name', type: 'text' },
        { key: 'last_name', label: 'Last Name', type: 'text' },
        { key: 'bio', label: 'Bio', type: 'textarea' },
        { key: 'date_of_birth', label: 'Date of Birth', type: 'date' },
        { key: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'other'] },
        { key: 'contact_number', label: 'Contact Number', type: 'text' },
        { key: 'address', label: 'Address', type: 'textarea' },
        { key: 'country', label: 'Country', type: 'text' },
        { key: 'highest_qualification', label: 'Highest Qualification', type: 'text' },
        { key: 'institution', label: 'Institution', type: 'text' },
        { key: 'skills', label: 'Skills', type: 'text' },
        { key: 'linkedin_profile', label: 'LinkedIn', type: 'url' },
        { key: 'github_profile', label: 'GitHub', type: 'url' },
        { key: 'website', label: 'Website', type: 'url' },
      ]
    : [
        { key: 'first_name', label: 'First Name', type: 'text' },
        { key: 'last_name', label: 'Last Name', type: 'text' },
        { key: 'bio', label: 'Bio', type: 'textarea' },
        { key: 'institution', label: 'Institution', type: 'text' },
        { key: 'skills', label: 'Skills', type: 'text' },
        { key: 'linkedin_profile', label: 'LinkedIn', type: 'url' },
        { key: 'github_profile', label: 'GitHub', type: 'url' },
        { key: 'website', label: 'Website', type: 'url' },
      ];

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile_picture' && files && files[0]) {
      setForm((prev) => ({ ...prev, profile_picture: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Always use FormData for PATCH to support file uploads
      const body = new FormData();
      editableFields.forEach(field => {
        if (field.key === 'profile_picture') {
          // Only append if a new file is selected
          if (form.profile_picture instanceof File) {
            body.append('profile_picture', form.profile_picture);
          }
        } else if (form[field.key] !== undefined && form[field.key] !== null) {
          body.append(field.key, form[field.key]);
        }
      });
      const headers = {
        'X-CSRFToken': (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || '',
        // Do NOT set Content-Type when using FormData
      };
      const res = await fetch(`${BACKEND_URL}/api/users/${currentUser.id}/`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body,
      });
      if (res.ok) {
        const updated = await res.json();
        handleLogin(updated);
        setEditing(false);
      } else {
        alert('Failed to update profile.');
      }
    } catch {
      alert('Failed to update profile.');
    }
  };

  // Helper to render a field if it exists
  const renderField = (label, value) => {
    // Check if value is a valid string, number, or boolean
    if (value === null || value === undefined || value === '') return null;

    // Special handling for boolean values
    if (typeof value === 'boolean') {
      value = value ? 'Yes' : 'No';
    }

    // Special handling for date_joined (assuming it's a date string)
    if (label === 'Joined' && value) {
      try {
        value = new Date(value).toLocaleDateString(); // Format date nicely
      } catch (e) {
        console.warn("Could not parse date_joined:", value);
      }
    }
    // Special handling for last_activity
    if (label === 'Last Activity' && value) {
      try {
        value = new Date(value).toLocaleString(); // Format date and time
      } catch (e) {
        console.warn("Could not parse last_activity:", value);
      }
    }
    // Special handling for Date of Birth
    if (label === 'Date of Birth' && value) {
      try {
        value = new Date(value).toLocaleDateString();
      } catch (e) {
        console.warn("Could not parse date_of_birth:", value);
      }
    }

    return (
      <p className="text-gray-700 mb-2 text-base sm:text-lg break-words">
        <strong className="font-semibold text-gray-800">{label}:</strong> {value}
      </p>
    );
  };

  return (
    <section className="profile-section bg-white p-6 sm:p-8 rounded-lg shadow-xl border border-gray-200 mx-auto max-w-full sm:max-w-2xl lg:max-w-4xl my-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 sm:mb-6 text-blue-800 text-center sm:text-left">
        {currentUser.role === 'admin' && 'Admin Dashboard'}
        {currentUser.role === 'instructor' && 'Instructor Dashboard'}
        {isUser && `Welcome, ${currentUser.username}`}
      </h1>

      {(currentUser.role === 'admin' || currentUser.role === 'instructor') && (
        <a
          href={`${BACKEND_URL}/${'admin'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full sm:w-auto mx-auto bg-green-600 text-white hover:bg-green-700 mb-6 px-6 py-3 rounded-md font-medium text-base sm:text-lg text-center transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          {currentUser.role === 'admin' ? 'Go to Admin Dashboard' : 'Go to Instructor Dashboard'}
        </a>
      )}

      {/* Profile Header (incl. Edit Button) */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Your Information</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm sm:text-base font-medium flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.827-2.828z" />
            </svg>
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="submit"
              onClick={handleEditSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 text-sm sm:text-base font-medium flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-3.293-3.293a1 1 0 111.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Save
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setForm({ ...currentUser }); }}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition duration-200 text-sm sm:text-base font-medium flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Picture (moved to top of information section) */}
      {currentUser.profile_picture && (
        <div className="flex justify-center mb-6">
          <img
            src={currentUser.profile_picture}
            alt="Profile"
            className="w-32 h-32 object-cover rounded-full border border-gray-200 shadow-md"
          />
        </div>
      )}

      {/* Profile Details / Edit Form */}
      {editing ? (
        <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-4 border-b border-gray-200">
          {editableFields.filter(field => field.key !== 'profile_picture').map((field) => ( // Filter out profile picture from regular fields
            <div key={field.key} className="form-group">
              <label htmlFor={field.key} className="block text-gray-700 font-semibold mb-1 text-sm">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.key}
                  name={field.key}
                  value={form[field.key] || ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-sm h-24 resize-y"
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.key}
                  name={field.key}
                  value={form[field.key] || ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-sm bg-white"
                >
                  <option value="">Select</option>
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                  ))}
                </select>
              ) : field.type === 'file' ? (
                <input
                  id={field.key}
                  type="file"
                  name={field.key}
                  accept="image/*"
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-800 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              ) : (
                <input
                  id={field.key}
                  type={field.type}
                  name={field.key}
                  value={form[field.key] || ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-sm"
                />
              )}
            </div>
          ))}
          {/* Profile picture input specifically for edit mode */}
          {editing && isUser && (
            <div className="form-group md:col-span-2"> {/* Make it span full width in edit mode */}
              <label htmlFor="profile_picture" className="block text-gray-700 font-semibold mb-1 text-sm">Profile Picture</label>
              <input
                id="profile_picture"
                type="file"
                name="profile_picture"
                accept="image/*"
                onChange={handleEditChange}
                className="w-full border border-gray-300 rounded-md p-2 text-gray-800 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          )}
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-4 border-b border-gray-200">
          {renderField('Username', currentUser.username)}
          {renderField('Email', currentUser.email)}
          {renderField('Role', currentUser.role)}

          {isUser && (
            <>
              {renderField('Full Name', (currentUser.first_name || currentUser.last_name) ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() : null)}
              {renderField('Bio', currentUser.bio)}
              {renderField('Date of Birth', currentUser.date_of_birth)}
              {renderField('Gender', currentUser.gender)}
              {renderField('Contact Number', currentUser.contact_number)}
              {renderField('Address', currentUser.address)}
              {renderField('Country', currentUser.country)}
              {renderField('Highest Qualification', currentUser.highest_qualification)}
              {renderField('Institution', currentUser.institution)}
              {renderField('Skills', currentUser.skills)}
              {renderField('LinkedIn', currentUser.linkedin_profile && <a href={currentUser.linkedin_profile} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{currentUser.linkedin_profile}</a>)}
              {renderField('GitHub', currentUser.github_profile && <a href={currentUser.github_profile} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{currentUser.github_profile}</a>)}
              {renderField('Website', currentUser.website && <a href={currentUser.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{currentUser.website}</a>)}
              {renderField('Email Verified', currentUser.is_email_verified)}
              {renderField('2FA Enabled', currentUser.two_factor_enabled)}
              {renderField('Joined', currentUser.date_joined)}
              {renderField('Last Activity', currentUser.last_activity)}
            </>
          )}

          {!isUser && ( // For Instructor/Admin profiles
            <>
              {renderField('Full Name', (currentUser.first_name || currentUser.last_name) ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() : null)}
              {renderField('Bio', currentUser.bio)}
              {renderField('Institution', currentUser.institution)}
              {renderField('Skills', currentUser.skills)}
              {renderField('LinkedIn', currentUser.linkedin_profile && <a href={currentUser.linkedin_profile} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{currentUser.linkedin_profile}</a>)}
              {renderField('GitHub', currentUser.github_profile && <a href={currentUser.github_profile} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{currentUser.github_profile}</a>)}
              {renderField('Website', currentUser.website && <a href={currentUser.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{currentUser.website}</a>)}
              {currentUser.role === 'instructor' && (
                <>
                  {renderField('Instructor Rating', currentUser.instructor_rating)}
                  {renderField('Total Reviews', currentUser.total_reviews)}
                  {renderField('Earnings', `₹${currentUser.earnings}`)}
                </>
              )}
            </>
          )}
        </div>
      )}

      {isUser && (
        <>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">Enrolled Courses</h2>
          <ul className="space-y-4">
            {enrollments && enrollments.length > 0 ? (
              enrollments.map((enrollment) => (
                <li
                  key={enrollment.course.slug}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <button
                    onClick={() => navigate(`/course/${enrollment.course.slug}`)}
                    aria-label={`View ${enrollment.course.title} course details`}
                    className="text-blue-600 hover:underline font-medium text-base sm:text-lg mb-2 sm:mb-0 text-left"
                  >
                    {enrollment.course.title}
                  </button>
                  <span
                    className="progress-badge bg-blue-100 text-blue-800 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap"
                    aria-label={`Progress: ${enrollment.progress} percent complete`}
                  >
                    {enrollment.progress}% Complete
                  </span>
                </li>
              ))
            ) : (
              <li className="p-4 bg-gray-50 rounded-md border border-gray-100 text-gray-600 text-base sm:text-lg italic text-center">
                You are not enrolled in any courses yet.
              </li>
            )}
          </ul>
        </>
      )}

      <button
        onClick={() => navigate('/password_reset')}
        className="block w-full sm:w-auto mx-auto bg-yellow-500 text-white hover:bg-yellow-600 mt-8 px-6 py-3 rounded-md font-medium text-base sm:text-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
      >
        Reset Password
      </button>
    </section>
  );
}

export default Profile;