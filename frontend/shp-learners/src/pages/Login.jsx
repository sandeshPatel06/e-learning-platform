import React, { useState, useContext } from 'react';
import { UserContext } from '../App.jsx'; // Assuming UserContext is correctly imported

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for loading indicator
  const { handleLogin, navigate } = useContext(UserContext);

  // Helper function to get CSRF token
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true); // Start loading

    try {
      // Login API call
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include', // Important for session authentication
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setErrorMessage('Invalid username or password. Please double-check your credentials.');
        setIsSubmitting(false); // Stop loading on error
        return;
      }

      // Optionally, fetch user profile after login
      const userRes = await fetch('https://shp-learner.onrender.com/api/users/', {
        credentials: 'include',
      });
      if (!userRes.ok) {
        setErrorMessage('Login successful, but failed to retrieve user profile. Please try refreshing.');
        setIsSubmitting(false); // Stop loading on error
        return;
      }
      const users = await userRes.json();
      const user = users.find(u => u.username === username);

      if (!user) {
        setErrorMessage('User profile not found after login. This might be a server configuration issue.');
        setIsSubmitting(false); // Stop loading on error
        return;
      }

      handleLogin(user);
      navigate('/profile');
    } catch (err) {
      console.error("Login error:", err); // Log the full error for debugging
      setErrorMessage('An unexpected error occurred. Please try again or contact support.');
      setIsSubmitting(false); // Stop loading on network/other errors
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 font-sans">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm sm:max-w-md transform transition-all duration-300 hover:shadow-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-7 text-center text-blue-700 animate-fade-in-down">
          Welcome Back!
        </h1>
        <p className="text-center text-gray-600 mb-6 text-md sm:text-lg animate-fade-in delay-200">
          Sign in to access your personalized learning journey.
        </p>

        {errorMessage && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base flex items-center space-x-3 shadow-md animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
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
                className="w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-800 text-sm sm:text-base transition duration-200"
                required
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting} // Disable input during submission
              />
            </div>
          </div>

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
                className="w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-800 text-sm sm:text-base transition duration-200"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting} // Disable input during submission
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-7 space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={() => navigate('/password_reset')}
              className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 text-base sm:text-lg font-medium shadow-sm hover:shadow-md"
              disabled={isSubmitting} // Disable button during submission
            >
              Forgot Password?
            </button>
            <button
              type="submit"
              className={`w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 text-base sm:text-lg font-semibold flex items-center justify-center
                ${isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-opacity-75 shadow-md hover:shadow-lg'
                }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging In...
                </>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-gray-700 text-sm sm:text-base animate-fade-in delay-500">
          New to SHP-Learner?{' '}
          <button onClick={() => navigate('/register')} className="text-blue-600 hover:text-blue-800 hover:underline font-bold transition duration-200">
            Create an account
          </button>
        </p>
      </div>
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
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-fade-in.delay-200 {
          animation-delay: 0.2s;
        }
        .animate-fade-in.delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}

export default Login;