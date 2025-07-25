import { Link } from 'react-router-dom';

const About = () => {
  const stats = [
    { number: "15+", label: "Years of Experience" },
    { number: "5000+", label: "Patients Treated" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "Support Available" }
  ];

  const values = [
    {
      title: "Excellence in Care",
      description: "We are committed to providing the highest quality rehabilitation services using evidence-based practices and state-of-the-art equipment.",
      icon: "🏆"
    },
    {
      title: "Patient-Centered Approach",
      description: "Every treatment plan is tailored to the individual needs, goals, and circumstances of our patients.",
      icon: "❤️"
    },
    {
      title: "Continuous Innovation",
      description: "We stay current with the latest rehabilitation techniques and technologies to ensure optimal outcomes.",
      icon: "🔬"
    },
    {
      title: "Compassionate Team",
      description: "Our caring professionals are dedicated to supporting you throughout your recovery journey.",
      icon: "🤝"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">About Our Clinic</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          For over 15 years, our Medical Rehabilitation Clinic has been dedicated to helping patients
          recover, restore function, and improve their quality of life through comprehensive,
          personalized rehabilitation services.
        </p>
      </section>

      {/* Stats Section */}
      <section className="grid md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="bg-blue-600 text-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold mb-2">{stat.number}</div>
            <div className="text-blue-100">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            To provide exceptional rehabilitation services that empower individuals to achieve their
            highest level of independence and quality of life. We are committed to delivering
            evidence-based, compassionate care that addresses the unique needs of each patient
            and their families.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h2>
          <p className="text-gray-600 leading-relaxed">
            To be the leading rehabilitation clinic in our community, recognized for our innovative
            treatment approaches, exceptional patient outcomes, and unwavering commitment to
            improving lives through comprehensive rehabilitation services.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Core Values</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {values.map((value, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{value.icon}</span>
                <h3 className="text-xl font-semibold text-gray-800">{value.title}</h3>
              </div>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Facility Information */}
      <section className="bg-blue-50 rounded-lg p-8 mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Facility</h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">State-of-the-Art Equipment</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Advanced therapeutic exercise equipment</li>
              <li>• Electrical stimulation and ultrasound therapy</li>
              <li>• Hydrotherapy pool with specialized features</li>
              <li>• Occupational therapy simulation areas</li>
              <li>• Speech therapy assessment rooms</li>
              <li>• Adaptive equipment demonstration area</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Convenient Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Accessible parking and entrances</li>
              <li>• Comfortable waiting areas</li>
              <li>• Private treatment rooms</li>
              <li>• Family consultation spaces</li>
              <li>• On-site administrative services</li>
              <li>• Easy appointment scheduling</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Accreditations */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Accreditations & Certifications</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-3">🏥</div>
            <h3 className="font-semibold text-gray-800 mb-2">Joint Commission Accredited</h3>
            <p className="text-gray-600 text-sm">Recognized for quality and safety standards</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="font-semibold text-gray-800 mb-2">Licensed Professionals</h3>
            <p className="text-gray-600 text-sm">All therapists hold current state licenses</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-semibold text-gray-800 mb-2">Insurance Approved</h3>
            <p className="text-gray-600 text-sm">Accepted by major insurance providers</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-800 text-white rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Experience the Difference</h2>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Join thousands of patients who have achieved their rehabilitation goals with our expert care and personalized treatment approach.
        </p>
        <div className="space-x-4">
          <Link
            to="/appointments"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            Schedule Consultation
          </Link>
          <Link
            to="/contact"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors inline-block"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
