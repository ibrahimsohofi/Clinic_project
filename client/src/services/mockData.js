// Mock data for testing frontend without database
export const mockServices = [
  {
    id: '1',
    name: 'Initial Physiotherapy Consultation',
    description: 'Comprehensive initial assessment and treatment planning for physiotherapy patients. Includes movement analysis, pain assessment, and goal setting.',
    category: 'Physiotherapy',
    duration: '60 minutes',
    price: '$120',
    specialty: 'Physiotherapy',
    benefits: ['Comprehensive assessment', 'Personalized treatment plan', 'Movement analysis', 'Pain evaluation']
  },
  {
    id: '2',
    name: 'Physiotherapy Treatment Session',
    description: 'Individual physiotherapy treatment session focused on rehabilitation and recovery. Includes manual therapy, exercises, and patient education.',
    category: 'Physiotherapy',
    duration: '45 minutes',
    price: '$85',
    specialty: 'Physiotherapy',
    benefits: ['Pain reduction', 'Improved mobility', 'Strength building', 'Functional improvement']
  },
  {
    id: '3',
    name: 'Occupational Therapy Assessment',
    description: 'Comprehensive occupational therapy evaluation focusing on activities of daily living and functional independence.',
    category: 'Occupational Therapy',
    duration: '60 minutes',
    price: '$110',
    specialty: 'Occupational Therapy',
    benefits: ['Functional assessment', 'ADL evaluation', 'Cognitive screening', 'Environmental assessment']
  },
  {
    id: '4',
    name: 'Occupational Therapy Session',
    description: 'Individual occupational therapy session focused on improving independence in daily activities and work tasks.',
    category: 'Occupational Therapy',
    duration: '45 minutes',
    price: '$80',
    specialty: 'Occupational Therapy',
    benefits: ['Improved independence', 'Enhanced daily living skills', 'Work readiness', 'Adaptive strategies']
  },
  {
    id: '5',
    name: 'Speech Therapy Evaluation',
    description: 'Comprehensive speech and language evaluation including communication and swallowing assessment.',
    category: 'Speech Therapy',
    duration: '60 minutes',
    price: '$115',
    specialty: 'Speech Therapy',
    benefits: ['Communication assessment', 'Swallowing evaluation', 'Treatment planning', 'Goal setting']
  },
  {
    id: '6',
    name: 'Speech Therapy Session',
    description: 'Individual speech therapy session focusing on communication and/or swallowing rehabilitation.',
    category: 'Speech Therapy',
    duration: '45 minutes',
    price: '$75',
    specialty: 'Speech Therapy',
    benefits: ['Improved communication', 'Enhanced swallowing safety', 'Voice improvement', 'Language development']
  }
];

export const mockStaff = [
  {
    id: '1',
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    role: 'Doctor',
    specialty: 'Medicine',
    email: 'dr.johnson@clinic.com',
    phone: '555-0101',
    experience: 15,
    bio: 'Dr. Johnson is a board-certified rehabilitation medicine physician with 15 years of experience in comprehensive patient care and treatment planning.',
    qualifications: ['MD', 'Rehabilitation Medicine Specialist'],
    availability: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '15:00' }
    ]
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    role: 'Therapist',
    specialty: 'Physiotherapy',
    email: 'michael.chen@clinic.com',
    phone: '555-0102',
    experience: 8,
    bio: 'Michael is an experienced physiotherapist specializing in musculoskeletal rehabilitation and manual therapy techniques.',
    qualifications: ['BSc Physiotherapy', 'Manual Therapy Certification'],
    availability: [
      { dayOfWeek: 'Monday', startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 'Thursday', startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 'Friday', startTime: '08:00', endTime: '14:00' }
    ]
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    role: 'Therapist',
    specialty: 'Occupational Therapy',
    email: 'emily.rodriguez@clinic.com',
    phone: '555-0103',
    experience: 6,
    bio: 'Emily specializes in helping patients regain independence in their daily activities and work environments.',
    qualifications: ['MSc Occupational Therapy', 'ADL Assessment Specialist'],
    availability: [
      { dayOfWeek: 'Monday', startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 'Thursday', startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 'Friday', startTime: '10:00', endTime: '16:00' }
    ]
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Thompson',
    role: 'Therapist',
    specialty: 'Speech Therapy',
    email: 'david.thompson@clinic.com',
    phone: '555-0104',
    experience: 10,
    bio: 'David has extensive experience in treating communication and swallowing disorders across all age groups.',
    qualifications: ['MSc Speech-Language Pathology', 'Swallowing Disorders Specialist'],
    availability: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00' }
    ]
  }
];

export const mockAppointments = [
  {
    id: '1',
    patient: 'John Smith',
    staff: 'Michael Chen',
    service: 'Initial Physiotherapy Consultation',
    appointmentDate: '2024-08-15',
    startTime: '09:00',
    endTime: '10:00',
    status: 'Scheduled',
    reasonForVisit: 'Lower back pain assessment and treatment planning',
    patientNotes: 'Pain started 3 weeks ago after lifting heavy boxes'
  },
  {
    id: '2',
    patient: 'Maria Garcia',
    staff: 'Emily Rodriguez',
    service: 'Occupational Therapy Assessment',
    appointmentDate: '2024-08-16',
    startTime: '10:00',
    endTime: '11:00',
    status: 'Confirmed',
    reasonForVisit: 'Post-stroke rehabilitation assessment for daily living activities',
    patientNotes: 'Stroke 6 months ago, having difficulty with daily tasks'
  }
];

export const mockUsers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    role: 'patient',
    phone: '555-0201'
  },
  {
    id: '2',
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'dr.johnson@clinic.com',
    role: 'admin',
    phone: '555-0101'
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@clinic.com',
    role: 'staff',
    phone: '555-0102'
  }
];

// Demo credentials for easy testing
export const demoCredentials = {
  admin: {
    email: 'dr.johnson@clinic.com',
    password: 'password123',
    user: mockUsers[1]
  },
  staff: {
    email: 'michael.chen@clinic.com',
    password: 'password123',
    user: mockUsers[2]
  },
  patient: {
    email: 'john.smith@email.com',
    password: 'password123',
    user: mockUsers[0]
  }
};
