import { useState, useEffect } from 'react';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample staff data - TODO: Replace with API call
  const sampleStaff = [
    {
      id: 1,
      firstName: "Dr. Sarah",
      lastName: "Johnson",
      role: "Doctor",
      specialty: "Physical Medicine & Rehabilitation",
      qualifications: ["MD", "Board Certified PM&R"],
      experience: "15 years",
      description: "Dr. Johnson specializes in comprehensive rehabilitation medicine with expertise in neurological and musculoskeletal disorders.",
      availability: [
        { dayOfWeek: "Monday", startTime: "08:00", endTime: "17:00" },
        { dayOfWeek: "Tuesday", startTime: "08:00", endTime: "17:00" },
        { dayOfWeek: "Wednesday", startTime: "08:00", endTime: "17:00" },
        { dayOfWeek: "Thursday", startTime: "08:00", endTime: "17:00" },
        { dayOfWeek: "Friday", startTime: "08:00", endTime: "16:00" }
      ]
    },
    {
      id: 2,
      firstName: "Michael",
      lastName: "Chen",
      role: "Therapist",
      specialty: "Physiotherapy",
      qualifications: ["PT", "DPT", "OCS"],
      experience: "10 years",
      description: "Michael specializes in orthopedic rehabilitation, sports injuries, and post-surgical recovery with advanced manual therapy techniques.",
      availability: [
        { dayOfWeek: "Monday", startTime: "09:00", endTime: "18:00" },
        { dayOfWeek: "Tuesday", startTime: "09:00", endTime: "18:00" },
        { dayOfWeek: "Wednesday", startTime: "09:00", endTime: "18:00" },
        { dayOfWeek: "Thursday", startTime: "09:00", endTime: "18:00" },
        { dayOfWeek: "Friday", startTime: "09:00", endTime: "17:00" }
      ]
    },
    {
      id: 3,
      firstName: "Emily",
      lastName: "Rodriguez",
      role: "Therapist",
      specialty: "Occupational Therapy",
      qualifications: ["OTR/L", "MS"],
      experience: "8 years",
      description: "Emily helps patients regain independence in daily activities with expertise in cognitive rehabilitation and adaptive equipment.",
      availability: [
        { dayOfWeek: "Monday", startTime: "08:30", endTime: "17:30" },
        { dayOfWeek: "Tuesday", startTime: "08:30", endTime: "17:30" },
        { dayOfWeek: "Wednesday", startTime: "08:30", endTime: "17:30" },
        { dayOfWeek: "Thursday", startTime: "08:30", endTime: "17:30" },
        { dayOfWeek: "Friday", startTime: "08:30", endTime: "16:30" }
      ]
    },
    {
      id: 4,
      firstName: "David",
      lastName: "Williams",
      role: "Therapist",
      specialty: "Speech Therapy",
      qualifications: ["SLP", "CCC", "MS"],
      experience: "12 years",
      description: "David specializes in speech, language, and swallowing disorders for both adults and children with comprehensive treatment approaches.",
      availability: [
        { dayOfWeek: "Monday", startTime: "09:00", endTime: "17:00" },
        { dayOfWeek: "Tuesday", startTime: "09:00", endTime: "17:00" },
        { dayOfWeek: "Wednesday", startTime: "09:00", endTime: "17:00" },
        { dayOfWeek: "Friday", startTime: "09:00", endTime: "17:00" },
        { dayOfWeek: "Saturday", startTime: "09:00", endTime: "14:00" }
      ]
    }
  ];

  useEffect(() => {
    // TODO: Replace with actual API call
    // fetchStaff();

    // Simulate API call
    setTimeout(() => {
      setStaff(sampleStaff);
      setLoading(false);
    }, 1000);
  }, []);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Doctor': return '👨‍⚕️';
      case 'Therapist': return '🏥';
      default: return '👥';
    }
  };

  const formatAvailability = (availability) => {
    return availability.map(slot =>
      `${slot.dayOfWeek}: ${slot.startTime} - ${slot.endTime}`
    ).join(', ');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading our team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our experienced and compassionate team of healthcare professionals is dedicated to helping you achieve your rehabilitation goals with personalized, evidence-based care.
        </p>
      </div>

      {/* Team Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-blue-600 text-white rounded-lg p-6 text-center">
          <div className="text-3xl font-bold mb-2">{staff.length}</div>
          <div className="text-blue-100">Healthcare Professionals</div>
        </div>
        <div className="bg-green-600 text-white rounded-lg p-6 text-center">
          <div className="text-3xl font-bold mb-2">50+</div>
          <div className="text-green-100">Years Combined Experience</div>
        </div>
        <div className="bg-purple-600 text-white rounded-lg p-6 text-center">
          <div className="text-3xl font-bold mb-2">100%</div>
          <div className="text-purple-100">Licensed & Certified</div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {staff.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
                {getRoleIcon(member.role)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">
                  {member.firstName} {member.lastName}
                </h3>
                <p className="text-blue-600 font-semibold">{member.specialty}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {member.qualifications.map((qual, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      {qual}
                    </span>
                  ))}
                </div>
                <p className="text-gray-500 text-sm mt-1">{member.experience} experience</p>
              </div>
            </div>

            <p className="text-gray-600 mt-4 leading-relaxed">{member.description}</p>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Availability</h4>
              <div className="space-y-1">
                {member.availability.map((slot, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{slot.dayOfWeek}</span>
                    <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex space-x-3">
              <a
                href="/appointments"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold"
              >
                Book Appointment
              </a>
              <button
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Team Credentials */}
      <div className="mt-12 bg-blue-50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Team's Credentials</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Education & Training</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Advanced degrees from accredited institutions</li>
              <li>• Ongoing continuing education requirements</li>
              <li>• Specialized certification programs</li>
              <li>• Clinical residencies and fellowships</li>
              <li>• Regular skills assessment and training</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Professional Standards</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Current state professional licenses</li>
              <li>• Professional association memberships</li>
              <li>• Evidence-based practice protocols</li>
              <li>• Regular peer review processes</li>
              <li>• Patient safety and ethics training</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staff;
