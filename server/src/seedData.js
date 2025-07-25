import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, Patient, Staff, Service, Appointment } from './models/index.js';
import connectDB from './config/database.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Staff.deleteMany({}),
      Service.deleteMany({}),
      Appointment.deleteMany({})
    ]);

    // Create Services
    console.log('🏥 Creating services...');
    const services = await Service.create([
      {
        name: 'Initial Physiotherapy Consultation',
        description: 'Comprehensive initial assessment and treatment planning for physiotherapy patients. Includes movement analysis, pain assessment, and goal setting.',
        category: 'Physiotherapy',
        durationMinutes: 60,
        price: 120,
        specialtyRequired: 'Physiotherapy',
        sessionCount: 1,
        benefits: ['Comprehensive assessment', 'Personalized treatment plan', 'Movement analysis', 'Pain evaluation'],
        prerequisites: ['Medical clearance if required'],
        contraindications: ['Acute injuries requiring immediate medical attention'],
        equipment: ['Assessment table', 'Goniometer', 'Measuring tools'],
        tags: ['consultation', 'assessment', 'physiotherapy']
      },
      {
        name: 'Physiotherapy Treatment Session',
        description: 'Individual physiotherapy treatment session focused on rehabilitation and recovery. Includes manual therapy, exercises, and patient education.',
        category: 'Physiotherapy',
        durationMinutes: 45,
        price: 85,
        specialtyRequired: 'Physiotherapy',
        sessionCount: 8,
        benefits: ['Pain reduction', 'Improved mobility', 'Strength building', 'Functional improvement'],
        equipment: ['Treatment table', 'Exercise equipment', 'Therapeutic tools'],
        tags: ['treatment', 'rehabilitation', 'physiotherapy']
      },
      {
        name: 'Occupational Therapy Assessment',
        description: 'Comprehensive occupational therapy evaluation focusing on activities of daily living and functional independence.',
        category: 'Occupational Therapy',
        durationMinutes: 60,
        price: 110,
        specialtyRequired: 'Occupational Therapy',
        sessionCount: 1,
        benefits: ['Functional assessment', 'ADL evaluation', 'Cognitive screening', 'Environmental assessment'],
        equipment: ['Assessment tools', 'ADL equipment', 'Cognitive tests'],
        tags: ['assessment', 'ADL', 'occupational therapy']
      },
      {
        name: 'Occupational Therapy Session',
        description: 'Individual occupational therapy session focused on improving independence in daily activities and work tasks.',
        category: 'Occupational Therapy',
        durationMinutes: 45,
        price: 80,
        specialtyRequired: 'Occupational Therapy',
        sessionCount: 6,
        benefits: ['Improved independence', 'Enhanced daily living skills', 'Work readiness', 'Adaptive strategies'],
        equipment: ['Therapy equipment', 'Adaptive tools', 'Work simulation tools'],
        tags: ['therapy', 'independence', 'occupational therapy']
      },
      {
        name: 'Speech Therapy Evaluation',
        description: 'Comprehensive speech and language evaluation including communication and swallowing assessment.',
        category: 'Speech Therapy',
        durationMinutes: 60,
        price: 115,
        specialtyRequired: 'Speech Therapy',
        sessionCount: 1,
        benefits: ['Communication assessment', 'Swallowing evaluation', 'Treatment planning', 'Goal setting'],
        equipment: ['Assessment tools', 'Audio equipment', 'Swallowing materials'],
        tags: ['assessment', 'communication', 'speech therapy']
      },
      {
        name: 'Speech Therapy Session',
        description: 'Individual speech therapy session focusing on communication and/or swallowing rehabilitation.',
        category: 'Speech Therapy',
        durationMinutes: 45,
        price: 75,
        specialtyRequired: 'Speech Therapy',
        sessionCount: 10,
        benefits: ['Improved communication', 'Enhanced swallowing safety', 'Voice improvement', 'Language development'],
        equipment: ['Therapy materials', 'Communication aids', 'Swallowing tools'],
        tags: ['therapy', 'communication', 'speech therapy']
      },
      {
        name: 'Medical Consultation',
        description: 'General medical consultation with rehabilitation physician for treatment planning and medical clearance.',
        category: 'Consultation',
        durationMinutes: 30,
        price: 150,
        specialtyRequired: 'Medicine',
        sessionCount: 1,
        benefits: ['Medical assessment', 'Treatment planning', 'Prescription management', 'Referrals'],
        tags: ['consultation', 'medical', 'physician']
      },
      {
        name: 'Group Therapy Session',
        description: 'Group-based rehabilitation session focusing on social interaction and shared therapeutic goals.',
        category: 'Rehabilitation',
        durationMinutes: 60,
        price: 45,
        sessionCount: 12,
        benefits: ['Social interaction', 'Peer support', 'Group motivation', 'Cost-effective treatment'],
        equipment: ['Group therapy space', 'Shared equipment'],
        tags: ['group', 'rehabilitation', 'social']
      }
    ]);

    // Create Staff Members
    console.log('👥 Creating staff members...');
    const staff = await Staff.create([
      {
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        role: 'Doctor',
        specialty: 'Medicine',
        contact: {
          phone: '555-0101',
          email: 'dr.johnson@clinic.com'
        },
        availability: [
          { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Friday', startTime: '09:00', endTime: '15:00' }
        ],
        qualifications: ['MD', 'Rehabilitation Medicine Specialist'],
        experience: 15,
        bio: 'Dr. Johnson is a board-certified rehabilitation medicine physician with 15 years of experience in comprehensive patient care and treatment planning.'
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        role: 'Therapist',
        specialty: 'Physiotherapy',
        contact: {
          phone: '555-0102',
          email: 'michael.chen@clinic.com'
        },
        availability: [
          { dayOfWeek: 'Monday', startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 'Thursday', startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 'Friday', startTime: '08:00', endTime: '14:00' }
        ],
        qualifications: ['BSc Physiotherapy', 'Manual Therapy Certification'],
        experience: 8,
        bio: 'Michael is a experienced physiotherapist specializing in musculoskeletal rehabilitation and manual therapy techniques.'
      },
      {
        firstName: 'Emily',
        lastName: 'Rodriguez',
        role: 'Therapist',
        specialty: 'Occupational Therapy',
        contact: {
          phone: '555-0103',
          email: 'emily.rodriguez@clinic.com'
        },
        availability: [
          { dayOfWeek: 'Monday', startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 'Thursday', startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 'Friday', startTime: '10:00', endTime: '16:00' }
        ],
        qualifications: ['MSc Occupational Therapy', 'ADL Assessment Specialist'],
        experience: 6,
        bio: 'Emily specializes in helping patients regain independence in their daily activities and work environments.'
      },
      {
        firstName: 'David',
        lastName: 'Thompson',
        role: 'Therapist',
        specialty: 'Speech Therapy',
        contact: {
          phone: '555-0104',
          email: 'david.thompson@clinic.com'
        },
        availability: [
          { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00' }
        ],
        qualifications: ['MSc Speech-Language Pathology', 'Swallowing Disorders Specialist'],
        experience: 10,
        bio: 'David has extensive experience in treating communication and swallowing disorders across all age groups.'
      },
      {
        firstName: 'Lisa',
        lastName: 'Anderson',
        role: 'Admin',
        specialty: 'Administration',
        contact: {
          phone: '555-0105',
          email: 'lisa.anderson@clinic.com'
        },
        availability: [
          { dayOfWeek: 'Monday', startTime: '08:30', endTime: '17:30' },
          { dayOfWeek: 'Tuesday', startTime: '08:30', endTime: '17:30' },
          { dayOfWeek: 'Wednesday', startTime: '08:30', endTime: '17:30' },
          { dayOfWeek: 'Thursday', startTime: '08:30', endTime: '17:30' },
          { dayOfWeek: 'Friday', startTime: '08:30', endTime: '16:30' }
        ],
        qualifications: ['Healthcare Administration Certificate'],
        experience: 5,
        bio: 'Lisa manages the administrative operations of the clinic and assists patients with scheduling and inquiries.'
      }
    ]);

    // Create Users (linked to staff and some patients)
    console.log('👤 Creating users...');
    const users = await User.create([
      {
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        email: 'dr.johnson@clinic.com',
        password: await bcrypt.hash('password123', 10),
        role: 'admin',
        phone: '555-0101'
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@clinic.com',
        password: await bcrypt.hash('password123', 10),
        role: 'staff',
        phone: '555-0102'
      },
      {
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.rodriguez@clinic.com',
        password: await bcrypt.hash('password123', 10),
        role: 'staff',
        phone: '555-0103'
      },
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        password: await bcrypt.hash('password123', 10),
        role: 'patient',
        phone: '555-0201'
      },
      {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@email.com',
        password: await bcrypt.hash('password123', 10),
        role: 'patient',
        phone: '555-0202'
      }
    ]);

    // Create Patients
    console.log('🏥 Creating patients...');
    const patients = await Patient.create([
      {
        firstName: 'John',
        lastName: 'Smith',
        dateOfBirth: new Date('1980-05-15'),
        gender: 'Male',
        contact: {
          phone: '555-0201',
          email: 'john.smith@email.com',
          address: '123 Main St, Anytown, ST 12345'
        },
        medicalHistory: ['Lower back pain', 'Previous knee surgery'],
        emergencyContact: {
          name: 'Jane Smith',
          relation: 'Spouse',
          phone: '555-0202'
        }
      },
      {
        firstName: 'Maria',
        lastName: 'Garcia',
        dateOfBirth: new Date('1975-08-22'),
        gender: 'Female',
        contact: {
          phone: '555-0202',
          email: 'maria.garcia@email.com',
          address: '456 Oak Ave, Cityville, ST 67890'
        },
        medicalHistory: ['Stroke recovery', 'Hypertension'],
        emergencyContact: {
          name: 'Carlos Garcia',
          relation: 'Husband',
          phone: '555-0203'
        }
      },
      {
        firstName: 'Robert',
        lastName: 'Wilson',
        dateOfBirth: new Date('1962-12-10'),
        gender: 'Male',
        contact: {
          phone: '555-0204',
          email: 'robert.wilson@email.com',
          address: '789 Pine Rd, Townsburg, ST 54321'
        },
        medicalHistory: ['Shoulder impingement', 'Diabetes Type 2'],
        emergencyContact: {
          name: 'Susan Wilson',
          relation: 'Wife',
          phone: '555-0205'
        }
      },
      {
        firstName: 'Lisa',
        lastName: 'Brown',
        dateOfBirth: new Date('1990-03-28'),
        gender: 'Female',
        contact: {
          phone: '555-0206',
          email: 'lisa.brown@email.com',
          address: '321 Elm St, Villagetown, ST 98765'
        },
        medicalHistory: ['Sports injury', 'ACL reconstruction'],
        emergencyContact: {
          name: 'Michael Brown',
          relation: 'Brother',
          phone: '555-0207'
        }
      },
      {
        firstName: 'James',
        lastName: 'Davis',
        dateOfBirth: new Date('1955-07-14'),
        gender: 'Male',
        contact: {
          phone: '555-0208',
          email: 'james.davis@email.com',
          address: '654 Maple Dr, Hamletville, ST 13579'
        },
        medicalHistory: ['Parkinson\'s disease', 'Speech difficulties'],
        emergencyContact: {
          name: 'Patricia Davis',
          relation: 'Wife',
          phone: '555-0209'
        }
      }
    ]);

    // Create sample appointments (next week)
    console.log('📅 Creating sample appointments...');
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointments = await Appointment.create([
      {
        patient: patients[0]._id, // John Smith
        staff: staff[1]._id,      // Michael Chen (Physiotherapy)
        service: services[0]._id, // Initial Physiotherapy Consultation
        appointmentDate: nextWeek,
        startTime: '09:00',
        endTime: '10:00',
        reasonForVisit: 'Lower back pain assessment and treatment planning',
        appointmentType: 'Initial Consultation',
        priority: 'Normal',
        patientNotes: 'Pain started 3 weeks ago after lifting heavy boxes',
        symptoms: ['Lower back pain', 'Stiffness', 'Limited mobility']
      },
      {
        patient: patients[1]._id, // Maria Garcia
        staff: staff[2]._id,      // Emily Rodriguez (Occupational Therapy)
        service: services[2]._id, // Occupational Therapy Assessment
        appointmentDate: new Date(nextWeek.getTime() + 24 * 60 * 60 * 1000), // Next day
        startTime: '10:00',
        endTime: '11:00',
        reasonForVisit: 'Post-stroke rehabilitation assessment for daily living activities',
        appointmentType: 'Assessment',
        priority: 'High',
        patientNotes: 'Stroke 6 months ago, having difficulty with daily tasks',
        symptoms: ['Left side weakness', 'Difficulty with dressing', 'Balance issues']
      },
      {
        patient: patients[4]._id, // James Davis
        staff: staff[3]._id,      // David Thompson (Speech Therapy)
        service: services[4]._id, // Speech Therapy Evaluation
        appointmentDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after next
        startTime: '14:00',
        endTime: '15:00',
        reasonForVisit: 'Speech clarity and swallowing assessment related to Parkinson\'s',
        appointmentType: 'Initial Consultation',
        priority: 'Normal',
        patientNotes: 'Family reports difficulty understanding speech',
        symptoms: ['Slurred speech', 'Soft voice', 'Occasional choking while eating']
      }
    ]);

    console.log('✅ Seed data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Patients: ${patients.length}`);
    console.log(`- Staff: ${staff.length}`);
    console.log(`- Services: ${services.length}`);
    console.log(`- Appointments: ${appointments.length}`);

    console.log('\n🔑 Test Login Credentials:');
    console.log('Admin: dr.johnson@clinic.com / password123');
    console.log('Staff: michael.chen@clinic.com / password123');
    console.log('Patient: john.smith@email.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
