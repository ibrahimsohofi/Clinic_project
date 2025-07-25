import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 rounded-lg mb-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to Medical Rehabilitation Clinic
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Leading the way in comprehensive rehabilitation services with personalized care,
            cutting-edge treatments, and a compassionate team dedicated to your recovery journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Register Today
                </Link>
                <Link
                  to="/appointments"
                  className="bg-blue-700 border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                >
                  Book Appointment
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/appointments"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  {user?.role === 'patient' ? 'My Appointments' : 'View Appointments'}
                </Link>
                <Link
                  to="/services"
                  className="bg-blue-700 border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                >
                  Our Services
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
            <div className="text-gray-600">Years of Experience</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl font-bold text-green-600 mb-2">5,000+</div>
            <div className="text-gray-600">Patients Treated</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
            <div className="text-gray-600">Patient Satisfaction</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600">Emergency Support</div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Specialized Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We offer comprehensive rehabilitation services tailored to help you regain independence,
            improve functionality, and enhance your quality of life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🏃‍♂️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Physiotherapy</h3>
            <p className="text-gray-600 mb-6">
              Comprehensive physical therapy services to restore movement, reduce pain, and prevent future injuries.
              Our expert physiotherapists use evidence-based treatments for optimal recovery.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>• Manual therapy and mobilization</li>
              <li>• Exercise prescription and training</li>
              <li>• Sports injury rehabilitation</li>
              <li>• Post-surgical recovery</li>
            </ul>
            <Link
              to="/services"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Learn More →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🤲</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Occupational Therapy</h3>
            <p className="text-gray-600 mb-6">
              Helping patients regain independence in daily activities and work-related tasks.
              Our OTs focus on adaptive strategies and environmental modifications.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>• Activities of daily living training</li>
              <li>• Cognitive rehabilitation</li>
              <li>• Work hardening programs</li>
              <li>• Assistive technology assessment</li>
            </ul>
            <Link
              to="/services"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Learn More →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🗣️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Speech Therapy</h3>
            <p className="text-gray-600 mb-6">
              Specialized treatment for communication and swallowing disorders.
              Our speech-language pathologists provide comprehensive evaluation and therapy.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>• Speech and language therapy</li>
              <li>• Swallowing disorder treatment</li>
              <li>• Voice therapy and training</li>
              <li>• Cognitive communication therapy</li>
            </ul>
            <Link
              to="/services"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-100 rounded-lg p-12 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Our Clinic?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to providing exceptional care through innovative treatments,
            experienced professionals, and personalized rehabilitation programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👨‍⚕️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Expert Team</h3>
            <p className="text-gray-600">
              Board-certified specialists with years of experience in rehabilitation medicine.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏥</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Modern Facilities</h3>
            <p className="text-gray-600">
              State-of-the-art equipment and comfortable treatment environments for optimal care.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Personalized Care</h3>
            <p className="text-gray-600">
              Individualized treatment plans tailored to your specific needs and goals.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-orange-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏰</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Flexible Scheduling</h3>
            <p className="text-gray-600">
              Convenient appointment times that work with your schedule and lifestyle.
            </p>
          </div>
        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Patients Say</h2>
          <p className="text-xl text-gray-600">Real stories from real patients about their recovery journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-yellow-500 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-gray-600 mb-6">
              "The physiotherapy team helped me recover completely from my knee surgery.
              Their personalized approach and constant encouragement made all the difference."
            </p>
            <div className="text-sm text-gray-500">
              <strong>Sarah M.</strong> - Knee Surgery Recovery
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-yellow-500 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-gray-600 mb-6">
              "After my stroke, the occupational therapy team helped me regain my independence.
              I can now perform daily activities I thought I'd never do again."
            </p>
            <div className="text-sm text-gray-500">
              <strong>Robert L.</strong> - Stroke Recovery
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-yellow-500 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-gray-600 mb-6">
              "The speech therapist was amazing in helping my father with his communication after his accident.
              Professional, patient, and truly caring."
            </p>
            <div className="text-sm text-gray-500">
              <strong>Maria G.</strong> - Family Member
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="bg-red-600 text-white rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Medical Emergency?</h2>
        <p className="text-xl mb-6">
          For immediate medical assistance, call our emergency line or go to your nearest emergency room.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="tel:911"
            className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
          >
            Call 911
          </a>
          <a
            href="tel:555-123-4567"
            className="bg-red-700 border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
          >
            Call Our Emergency Line: (555) 123-4567
          </a>
        </div>
      </section>

      {/* Quick Actions for Authenticated Users */}
      {isAuthenticated && (
        <section className="mt-16 bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/appointments"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-center"
            >
              <div className="text-3xl mb-2">📅</div>
              <h3 className="font-semibold text-gray-800">
                {user?.role === 'patient' ? 'My Appointments' : 'Manage Appointments'}
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                {user?.role === 'patient'
                  ? 'View and manage your upcoming appointments'
                  : 'View and manage patient appointments'
                }
              </p>
            </Link>

            {user?.role === 'patient' && (
              <Link
                to="/appointments/book"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-center"
              >
                <div className="text-3xl mb-2">🗓️</div>
                <h3 className="font-semibold text-gray-800">Book New Appointment</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Schedule a new appointment with our specialists
                </p>
              </Link>
            )}

            <Link
              to="/contact"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-center"
            >
              <div className="text-3xl mb-2">📞</div>
              <h3 className="font-semibold text-gray-800">Contact Us</h3>
              <p className="text-sm text-gray-600 mt-2">
                Get in touch with our team for questions or support
              </p>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
