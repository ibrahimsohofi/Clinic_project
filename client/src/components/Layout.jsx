import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout({ children }) {
  const location = useLocation();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-200 border-b-2 border-blue-200' : 'hover:text-blue-200 transition-colors';
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex-1">
              <h1 className="text-3xl font-bold text-center hover:text-blue-200 transition-colors">
                Medical Rehabilitation Clinic
              </h1>
              <p className="text-center mt-2 text-blue-100">
                Excellence in Healthcare and Rehabilitation Services
              </p>
            </Link>

            {/* User Info and Auth Actions */}
            <div className="flex items-center space-x-4 ml-4">
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-blue-100">
                          Welcome, {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-blue-200 capitalize">
                          {user?.role}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Link
                        to="/login"
                        className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="bg-white text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm transition-colors"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-blue-700 text-white">
        <div className="container mx-auto px-4">
          <ul className="flex flex-wrap justify-center space-x-6 py-3">
            <li>
              <Link to="/" className={isActive('/')}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/services" className={isActive('/services')}>
                Services
              </Link>
            </li>
            <li>
              <Link to="/about" className={isActive('/about')}>
                About
              </Link>
            </li>
            <li>
              <Link to="/staff" className={isActive('/staff')}>
                Our Team
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/appointments" className={isActive('/appointments')}>
                    My Appointments
                  </Link>
                </li>
                {user?.role === 'patient' && (
                  <li>
                    <Link to="/appointments/book" className={isActive('/appointments/book')}>
                      Book Appointment
                    </Link>
                  </li>
                )}
                {(user?.role === 'staff' || user?.role === 'admin') && (
                  <>
                    <li>
                      <Link to="/dashboard" className={isActive('/dashboard')}>
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/patients" className={isActive('/patients')}>
                        Patients
                      </Link>
                    </li>
                  </>
                )}
              </>
            ) : (
              <li>
                <Link to="/appointments" className={isActive('/appointments')}>
                  Book Appointment
                </Link>
              </li>
            )}
            <li>
              <Link to="/contact" className={isActive('/contact')}>
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <p>Loading...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-300">
                <p>📍 123 Health Street</p>
                <p>📱 (555) 123-4567</p>
                <p>✉️ info@clinic.com</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <div className="space-y-2 text-gray-300">
                <p>Physiotherapy</p>
                <p>Occupational Therapy</p>
                <p>Speech Therapy</p>
                <p>Rehabilitation</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/services" className="block text-gray-300 hover:text-white">
                  Our Services
                </Link>
                <Link to="/staff" className="block text-gray-300 hover:text-white">
                  Meet Our Team
                </Link>
                <Link to="/about" className="block text-gray-300 hover:text-white">
                  About Us
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="block text-gray-300 hover:text-white">
                    Patient Registration
                  </Link>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Hours</h3>
              <div className="space-y-2 text-gray-300">
                <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                <p>Saturday: 9:00 AM - 2:00 PM</p>
                <p>Sunday: Closed</p>
                <p className="text-yellow-400">Emergency: 24/7</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 Medical Rehabilitation Clinic. All rights reserved.
            </p>
            <p className="mt-2 text-gray-400">
              Excellence in Healthcare and Rehabilitation Services
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
