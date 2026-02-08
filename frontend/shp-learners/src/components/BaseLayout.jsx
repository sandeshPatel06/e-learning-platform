import React, { useState, useContext } from 'react';
import { UserContext } from '../App.jsx';
import logo from '../assets/logo.png';

function BaseLayout({ children }) {
  const { user, handleLogout, navigate } = useContext(UserContext);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      {/* Navbar */}
      <nav className="bg-blue-900 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center relative">
          <a
            className="flex items-center text-white text-xl md:text-2xl font-bold rounded-lg px-2 py-1 md:px-3 md:py-2 transition-colors duration-300 hover:bg-blue-800"
            href="#"
            onClick={() => navigate('/')}
          >
            <img src={logo} alt="Logo" className="w-8 h-8 md:w-10 md:h-10 mr-2 rounded-full" />
            SHP-Learner
          </a>

          {/* Mobile menu toggle button */}
          <button
            className="text-white text-2xl cursor-pointer md:hidden focus:outline-none"
            aria-label="Toggle navigation"
            onClick={toggleNav}
          >
            ☰
          </button>

          {/* Navigation menu */}
          <ul
            className={`
              ${isNavOpen ? 'flex' : 'hidden'}
              flex-col absolute top-full left-0 w-full bg-blue-900 shadow-lg z-50
              md:flex md:flex-row md:static md:w-auto md:bg-transparent md:shadow-none md:space-x-8
              py-2 md:py-0 px-4 md:px-0
            `}
          >
            <li>
              <a
                href="#"
                onClick={() => { navigate('/'); setIsNavOpen(false); }}
                className="block py-2 px-4 text-white hover:text-blue-200 transition-colors duration-300 md:inline-block rounded-lg hover:bg-blue-800 text-base md:text-lg"
              >
                Home
              </a>
            </li>
            {user ? (
              <>
                {!user.is_staff && (
                  <li>
                    <a
                      href="#"
                      onClick={() => { navigate('/profile'); setIsNavOpen(false); }}
                      className="block py-2 px-4 text-white hover:text-blue-200 transition-colors duration-300 md:inline-block rounded-lg hover:bg-blue-800 text-base md:text-lg"
                    >
                      Profile
                    </a>
                  </li>
                )}
                <li>
                  <a
                    href="#"
                    onClick={() => { handleLogout(); setIsNavOpen(false); }}
                    className="block py-2 px-4 text-white hover:text-blue-200 transition-colors duration-300 md:inline-block rounded-lg hover:bg-blue-800 text-base md:text-lg"
                  >
                    Logout
                  </a>
                </li>
              </>
            ) : (
              <li>
                <a
                  href="#"
                  onClick={() => { navigate('/login'); setIsNavOpen(false); }}
                  className="block py-2 px-4 text-white hover:text-blue-200 transition-colors duration-300 md:inline-block rounded-lg hover:bg-blue-800 text-base md:text-lg"
                >
                  Login
                </a>
              </li>
            )}

            {user && user.is_staff && (
              <li>
                <a
                  href="#"
                  onClick={() => { alert('Admin link clicked!'); setIsNavOpen(false); }}
                  className="block py-2 px-4 text-white hover:text-blue-200 transition-colors duration-300 md:inline-block rounded-lg hover:bg-blue-800 text-base md:text-lg"
                >
                  Admin
                </a>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6 flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-10 mt-auto shadow-inner">
        <div className="footer-container container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 px-4">
          {/* About */}
          <div className="footer-about">
            <h4 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-yellow-400 text-blue-900 px-2 py-1 rounded-lg font-black">SHP</span>
              About Us
            </h4>
            <p className="text-gray-300 text-base leading-relaxed">
              SHP-Learnering Platform is dedicated to providing high-quality courses to help you enhance your skills and achieve your career goals.<br />
              <span className="inline-block mt-2 font-semibold text-yellow-300">Join us to start learning today!</span>
            </p>
          </div>

          {/* Links */}
          <div className="footer-links">
            <h4 className="text-2xl font-bold mb-4">Quick Links</h4>
            <ul>
              <li className="mb-2">
                <a href="#" onClick={() => navigate('/')} className="text-gray-300 hover:text-yellow-300 transition-colors duration-300 text-base font-medium">Home</a>
              </li>
              <li className="mb-2">
                <a href="https://wa.me/9399613606" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-yellow-300 transition-colors duration-300 text-base font-medium">Contact Us</a>
              </li>
              <li className="mb-2">
                <a href="#" onClick={() => navigate('/faq')} className="text-gray-300 hover:text-yellow-300 transition-colors duration-300 text-base font-medium">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <h4 className="text-2xl font-bold mb-4">Contact Us</h4>
            <div className="space-y-2">
              <p className="text-gray-300 text-base flex items-center">
                <i className="fas fa-envelope mr-2 text-yellow-300"></i>
                <a href="mailto:sandeshpatel.sp.93@gmail.com" className="hover:text-yellow-300 transition-colors duration-300">sandeshpatel.sp.93@gmail.com</a>
              </p>
              <p className="text-gray-300 text-base flex items-center">
                <i className="fas fa-phone-alt mr-2 text-yellow-300"></i>
                <a href="tel:+919399613606" className="hover:text-yellow-300 transition-colors duration-300">+91 9399613606</a>
              </p>
              <p className="text-gray-300 text-base flex items-center">
                <i className="fas fa-map-marker-alt mr-2 text-yellow-300"></i>
                420 Kareli St, MP Narsinghpur, India
              </p>
            </div>
          </div>

          {/* Social Media */}
          <div className="footer-social">
            <h4 className="text-2xl font-bold mb-4">Follow Us</h4>
            <div className="social-icons flex space-x-5 mt-2">
              <a href="https://x.com/SandeshPat007?t=teYEP7w9aNZYSYKc0sF7dQ&s=09" className="text-gray-300 hover:text-yellow-300 transition-colors duration-300 text-3xl" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
              <a href="https://www.linkedin.com/in/sandesh-patel07" className="text-gray-300 hover:text-yellow-300 transition-colors duration-300 text-3xl" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
              <a href="https://www.instagram.com/sandesh_patel007" className="text-gray-300 hover:text-yellow-300 transition-colors duration-300 text-3xl" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
            </div>
            <div className="mt-4">
              <span className="inline-block bg-yellow-400 text-blue-900 px-3 py-1 rounded-full font-bold text-xs">#KeepLearning</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom text-center text-gray-400 mt-10 border-t border-blue-800 pt-5 px-4">
          <p className="text-base">
            &copy; {new Date().getFullYear()} <span className="font-bold text-yellow-300">SHP-Learnering Platform</span>. All Rights Reserved |
            <a href="#" className="text-gray-400 hover:text-yellow-300 transition-colors duration-300 ml-2">Privacy Policy</a> |
            <a href="#" className="text-gray-400 hover:text-yellow-300 transition-colors duration-300 ml-2">Terms of Service</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default BaseLayout;
