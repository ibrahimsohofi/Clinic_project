import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { servicesAPI } from '../services/api'
import { mockServices } from '../services/mockData'

function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await servicesAPI.getAll()
      setServices(response.data.data || [])
      setError(null)
    } catch (err) {
      console.log('API unavailable, using mock data for demo purposes')
      // Use mock data if API is unavailable
      setServices(mockServices)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading services...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchServices}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Page Header */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Services</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We offer a comprehensive range of rehabilitation services designed to help you recover,
          improve function, and enhance your quality of life.
        </p>
      </section>

      {/* Services Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{service.name}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>

              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Duration: {service.duration}</span>
                <span className="font-semibold text-blue-600">{service.price}</span>
              </div>

              <Link
                to="/appointments"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center block"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* Additional Information */}
      <section className="bg-blue-50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">What to Expect</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Initial Assessment</h3>
            <p className="text-gray-600 mb-4">
              Your first visit will include a comprehensive evaluation of your condition,
              medical history, and rehabilitation goals. This helps us create a personalized treatment plan.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Treatment Plan</h3>
            <p className="text-gray-600 mb-4">
              Based on your assessment, we'll develop a customized treatment plan with specific goals,
              timelines, and measurable outcomes to track your progress.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Ongoing Support</h3>
            <p className="text-gray-600 mb-4">
              Throughout your treatment, our team will monitor your progress, adjust your plan as needed,
              and provide education to help you maintain your improvements.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Follow-up Care</h3>
            <p className="text-gray-600 mb-4">
              After completing your treatment program, we'll provide you with home exercises
              and strategies to continue your recovery and prevent future problems.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-6">
          Contact us today to schedule your initial consultation and take the first step toward recovery.
        </p>
        <div className="space-x-4">
          <Link
            to="/appointments"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            Book Appointment
          </Link>
          <Link
            to="/contact"
            className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  )
}

export default Services
