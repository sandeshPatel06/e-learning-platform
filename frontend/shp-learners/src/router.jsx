import React, { useEffect, useState, Suspense } from 'react';
// No longer need to import Home directly since it's lazy-loaded
// import Home from './pages/Home.jsx';

// Dynamically import components using React.lazy
const Home = React.lazy(() => import('./pages/Home.jsx')); // Added back lazy load for Home
const CourseDetail = React.lazy(() => import('./pages/CourseDetail.jsx'));
const Enroll = React.lazy(() => import('./pages/Enroll.jsx'));
const FAQ = React.lazy(() => import('./pages/FAQ.jsx'));
const Login = React.lazy(() => import('./pages/Login.jsx'));
const Profile = React.lazy(() => import('./pages/Profile.jsx'));
const Register = React.lazy(() => import('./pages/Register.jsx'));
const PasswordReset = React.lazy(() => import('./pages/PasswordReset.jsx'));
const PasswordResetDone = React.lazy(() => import('./pages/PasswordResetDone.jsx'));
const PasswordResetConfirm = React.lazy(() => import('./pages/PasswordResetConfirm.jsx'));
const PasswordResetComplete = React.lazy(() => import('./pages/PasswordResetComplete.jsx'));

// Use Vite's import.meta.env or fallback to localhost
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://shp-learner.onrender.com';

const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export default function Router({
  currentRoute,
  user,
  courses: initialCourses,
  enrollments: initialEnrollments,
  onLogin,
  navigate,
  addEnrollment
}) {
  const [courses, setCourses] = useState(initialCourses || []);
  const [enrollments, setEnrollments] = useState(initialEnrollments || []);
  const [loading, setLoading] = useState(false);

  // Fetch courses on component mount
  useEffect(() => {
    setLoading(true);
    fetch(`${BACKEND_URL}/api/courses/`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setCourses(data))
      .catch(error => {
        console.error("Failed to fetch courses:", error);
      })
      .finally(() => setLoading(false));
  }, []); // Empty dependency array means this runs once on mount

  // Fetch enrollments if user is logged in
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetch(`${BACKEND_URL}/api/enrollments/`, { credentials: 'include' })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => setEnrollments(data))
        .catch(error => {
          console.error("Failed to fetch enrollments:", error);
        })
        .finally(() => setLoading(false));
    }
  }, [user]); // Re-run when user changes

  // The enrollment logic in the original useEffect was misplaced and would try to enroll on every user change.
  // Enrollment should be triggered by an action (e.g., a button click) within the Enroll component,
  // not automatically from the Router. The `addEnrollment` prop is already there for this.

  const pathSegments = currentRoute.split('/').filter(Boolean);

  // Redirect helper component to avoid calling navigate in render
  function Redirect({ to }) {
    useEffect(() => {
      navigate(to);
    }, [to, navigate]); // Added navigate to dependency array
    return null;
  }

  // Use Redirect component for '/courses'
  if (pathSegments[0] === 'courses') {
    return <Redirect to="/" />;
  }

  // Helper functions for route matching
  const isHome = pathSegments.length === 0 || pathSegments[0] === 'index';
  const isCourseDetail = pathSegments[0] === 'course' && pathSegments[1];
  const isProfile = pathSegments[0] === 'profile';
  const isLogin = pathSegments[0] === 'login';
  const isRegister = pathSegments[0] === 'register';
  const isEnroll = pathSegments[0] === 'enroll' && pathSegments[1];
  const isFAQ = pathSegments[0] === 'faq';
  const isPasswordReset = pathSegments[0] === 'password_reset';

  let ComponentToRender;
  let componentProps = {};

  if (isHome) {
    ComponentToRender = Home;
    componentProps = { courses, navigate };
  } else if (isCourseDetail) {
    const slug = pathSegments[1];
    const course = courses.find(c => c.slug === slug);
    const isEnrolled = user
      ? (Array.isArray(enrollments) ? enrollments : []).some(
        e => e.student.username === user.username && e.course.slug === slug
      )
      : false;
    ComponentToRender = course ? CourseDetail : () => <p className="text-center text-xl mt-10">Course not found.</p>;
    componentProps = { course, isEnrolled, user, navigate };
  } else if (isProfile) {
    const userEnrollments = user
      ? (Array.isArray(enrollments) ? enrollments : []).filter(
        e => e.student.username === user.username
      )
      : [];
    ComponentToRender = user ? Profile : Login;
    componentProps = user ? { user, enrollments: userEnrollments, navigate } : { onLogin, navigate };
  } else if (isLogin) {
    ComponentToRender = Login;
    componentProps = { onLogin, navigate };
  } else if (isRegister) {
    ComponentToRender = Register;
    componentProps = { navigate };
  } else if (isEnroll) {
    const slug = pathSegments[1];
    const course = courses.find(c => c.slug === slug);
    ComponentToRender = user && course ? Enroll : Login;
    componentProps = user && course ? { course, user, addEnrollment, navigate } : { onLogin, navigate };
  } else if (isFAQ) {
    ComponentToRender = FAQ;
  } else if (isPasswordReset) {
    if (pathSegments[1] === 'done') {
      ComponentToRender = PasswordResetDone;
    } else if (pathSegments[1] && pathSegments[2]) { // For /password_reset/confirm/:uid/:token
      // These values need to be passed to the PasswordResetConfirm component
      const uid = pathSegments[1];
      const token = pathSegments[2];
      ComponentToRender = PasswordResetConfirm;
      componentProps = { navigate, uid, token };
    } else if (pathSegments[1] === 'complete') {
      ComponentToRender = PasswordResetComplete;
    } else {
      ComponentToRender = PasswordReset;
    }
    componentProps = { ...componentProps, navigate }; // Merge navigate prop
  } else {
    // Default fallback
    ComponentToRender = Home;
    componentProps = { courses, navigate };
  }

  // Show a loading indicator if data is being fetched
  if (loading) {
    return <div className="text-center text-xl mt-10">Loading data...</div>;
  }

  // Render the selected component within a Suspense boundary
  return (
    <Suspense fallback={<div className="text-center text-xl mt-10">Loading component...</div>}>
      <ComponentToRender {...componentProps} />
    </Suspense>
  );
}