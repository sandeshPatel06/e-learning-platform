import React, { useState, useContext } from 'react';
import { UserContext } from '../App.jsx'; // Assuming UserContext is correctly imported

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(''); // New state for success message
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for loading indicator
  const { navigate, handleLogin } = useContext(UserContext);

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        const response = await fetch('https://shp-learner.onrender.com/api/register/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, role }),
        });
        const data = await response.json();
        if (response.ok) {
          setSuccessMessage('Registration successful! Redirecting to login...');
          setIsSubmitting(false);
          setTimeout(() => {
            handleLogin({ username, email, role, is_staff: role === 'instructor' });
            navigate('/login');
          }, 1500);
        } else {
          setErrors({ apiError: data.message || 'Registration failed. Please try again.' });
          setIsSubmitting(false);
        }
      } catch (err) {
        setErrors({ apiError: 'An error occurred during registration. Please try again.' });
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-4 sm:p-6 font-sans">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm sm:max-w-md transform transition-all duration-300 hover:shadow-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-7 text-center text-purple-700 animate-fade-in-down">
          Join SHP-Learner!
        </h1>
        <p className="text-center text-gray-600 mb-6 text-md sm:text-lg animate-fade-in delay-200">
          Create your account and start learning today.
        </p>

        {/* Global Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base flex items-center space-x-3 shadow-md animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex flex-col">
              <p className="font-semibold">Please correct the following errors:</p>
              <ul className="list-disc list-inside mt-1">
                {Object.values(errors).map((error, index) => (
                  // Display only specific field errors if they exist, otherwise a generic error
                  !['username', 'email', 'password', 'confirmPassword'].includes(Object.keys(errors)[index]) && (
                    <li key={index}>{error}</li>
                  )
                ))}
                {errors.apiError && <li key="apiError">{errors.apiError}</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Success Message Display */}
        {successMessage && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base flex items-center space-x-3 shadow-md animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Username */}
          <div className="form-group">
            <label htmlFor="username" className="block text-gray-800 text-sm font-semibold mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                name="username"
                id="username"
                className={`w-full pl-10 pr-3 py-2.5 sm:py-3 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-800 text-sm sm:text-base transition duration-200`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                aria-required="true"
                autoComplete="username"
                placeholder="Choose a unique username"
                disabled={isSubmitting}
              />
            </div>
            {errors.username && <p className="text-red-600 text-xs mt-1 ml-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="block text-gray-800 text-sm font-semibold mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-9 6h.01M3 8v8a2 2 0 002 2h14a2 2 0 002-2V8m-9 6l-2-2m2 2l2-2" />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                id="email"
                className={`w-full pl-10 pr-3 py-2.5 sm:py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-800 text-sm sm:text-base transition duration-200`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                autoComplete="email"
                placeholder="your.email@example.com"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && <p className="text-red-600 text-xs mt-1 ml-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="block text-gray-800 text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2v5a2 2 0 01-2 2h-5a2 2 0 01-2-2v-5a2 2 0 012-2h5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 16v-4m0 0l-2-2m2 2l2-2" />
                </svg>
              </span>
              <input
                type="password"
                name="password"
                id="password"
                className={`w-full pl-10 pr-3 py-2.5 sm:py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-800 text-sm sm:text-base transition duration-200`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                disabled={isSubmitting}
              />
            </div>
            {errors.password && <p className="text-red-600 text-xs mt-1 ml-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="block text-gray-800 text-sm font-semibold mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2v5a2 2 0 01-2 2h-5a2 2 0 01-2-2v-5a2 2 0 012-2h5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 16v-4m0 0l-2-2m2 2l2-2" />
                </svg>
              </span>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                className={`w-full pl-10 pr-3 py-2.5 sm:py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-800 text-sm sm:text-base transition duration-200`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-required="true"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                disabled={isSubmitting}
              />
            </div>
            {errors.confirmPassword && <p className="text-red-600 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role" className="block text-gray-800 text-sm font-semibold mb-2">
              Register as:
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h2a2 2 0 002-2V4a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2m0 0l4 4m-4-4l-4 4m-12-3H4m2 0H4" />
                </svg>
              </span>
              <select
                name="role"
                id="role"
                className={`w-full pl-10 pr-3 py-2.5 sm:py-3 border ${errors.role ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-800 text-sm sm:text-base appearance-none transition duration-200`}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                aria-required="true"
                disabled={isSubmitting}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            {errors.role && <p className="text-red-600 text-xs mt-1 ml-1">{errors.role}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full px-5 py-2.5 sm:py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 text-base sm:text-lg font-semibold flex items-center justify-center mt-7
              ${isSubmitting
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 focus:ring-opacity-75 shadow-md hover:shadow-lg'
              }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-700 text-sm sm:text-base animate-fade-in delay-500">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-purple-600 hover:text-purple-800 hover:underline font-bold transition duration-200">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;