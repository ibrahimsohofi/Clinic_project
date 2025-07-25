import express from 'express';
import { body, validationResult } from 'express-validator';
import { Appointment, Patient, Staff, Service } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware for appointment creation/update
const appointmentValidation = [
  body('patient')
    .notEmpty()
    .withMessage('Patient ID is required')
    .isMongoId()
    .withMessage('Invalid patient ID'),
  body('staff')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isMongoId()
    .withMessage('Invalid staff ID'),
  body('service')
    .notEmpty()
    .withMessage('Service ID is required')
    .isMongoId()
    .withMessage('Invalid service ID'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('Please provide a valid appointment date')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
    .custom((value, { req }) => {
      if (value <= req.body.startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('reasonForVisit')
    .trim()
    .notEmpty()
    .withMessage('Reason for visit is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason for visit must be between 5-500 characters'),
  body('appointmentType')
    .optional()
    .isIn(['Initial Consultation', 'Follow-up', 'Treatment', 'Assessment', 'Emergency'])
    .withMessage('Invalid appointment type'),
  body('priority')
    .optional()
    .isIn(['Low', 'Normal', 'High', 'Urgent'])
    .withMessage('Invalid priority level'),
  body('patientNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Patient notes cannot exceed 500 characters'),
  body('symptoms')
    .optional()
    .isArray()
    .withMessage('Symptoms must be an array')
];

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private (Admin, Staff - all; Patient - own only)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';
    const staffId = req.query.staff || '';
    const patientId = req.query.patient || '';
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';

    // Build query based on user role
    let query = {};

    // Patient can only see their own appointments
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else {
      // Admin and Staff can see all, but can filter by patient or staff
      if (patientId) query.patient = patientId;
      if (staffId) query.staff = staffId;
    }

    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) query.appointmentDate.$gte = new Date(startDate);
      if (endDate) query.appointmentDate.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName contact.phone contact.email')
      .populate('staff', 'firstName lastName specialty')
      .populate('service', 'name durationMinutes price category')
      .sort({ appointmentDate: 1, startTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private (Admin, Staff - all; Patient - own only)
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName dateOfBirth gender contact medicalHistory')
      .populate('staff', 'firstName lastName specialty contact')
      .populate('service', 'name description durationMinutes price category benefits');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (All authenticated users)
router.post('/', protect, appointmentValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { patient, staff, service, appointmentDate, startTime, endTime } = req.body;

    // Patients can only book appointments for themselves
    if (req.user.role === 'patient' && patient !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only book appointments for yourself'
      });
    }

    // Verify that patient, staff, and service exist
    const [patientDoc, staffDoc, serviceDoc] = await Promise.all([
      Patient.findById(patient),
      Staff.findById(staff),
      Service.findById(service)
    ]);

    if (!patientDoc) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (!staffDoc || !staffDoc.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found or inactive'
      });
    }

    if (!serviceDoc || !serviceDoc.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or inactive'
      });
    }

    // Check if staff can provide this service
    if (serviceDoc.specialtyRequired && serviceDoc.specialtyRequired !== staffDoc.specialty) {
      return res.status(400).json({
        success: false,
        message: `This service requires ${serviceDoc.specialtyRequired} specialty, but the selected staff member specializes in ${staffDoc.specialty}`
      });
    }

    // Check staff availability for the day
    const dayOfWeek = new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long' });
    const availability = staffDoc.availability.find(slot => slot.dayOfWeek === dayOfWeek);

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: `Staff member is not available on ${dayOfWeek}`
      });
    }

    // Check if the appointment time is within staff working hours
    if (startTime < availability.startTime || endTime > availability.endTime) {
      return res.status(400).json({
        success: false,
        message: `Appointment time must be between ${availability.startTime} and ${availability.endTime}`
      });
    }

    // Check for scheduling conflicts
    const conflict = await Appointment.checkConflict(staff, appointmentDate, startTime, endTime);
    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose a different time.'
      });
    }

    // Calculate duration and check if it matches service duration
    const durationMinutes = calculateDurationMinutes(startTime, endTime);
    if (Math.abs(durationMinutes - serviceDoc.durationMinutes) > 15) { // Allow 15 minutes tolerance
      return res.status(400).json({
        success: false,
        message: `Appointment duration (${durationMinutes} minutes) should match service duration (${serviceDoc.durationMinutes} minutes)`
      });
    }

    // Create the appointment
    const appointmentData = {
      ...req.body,
      // Set payment amount from service price
      payment: {
        amount: serviceDoc.price,
        status: 'Pending'
      }
    };

    const appointment = await Appointment.create(appointmentData);

    // Populate the created appointment
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName contact.phone')
      .populate('staff', 'firstName lastName specialty')
      .populate('service', 'name durationMinutes price');

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private (Admin, Staff - all; Patient - own only)
router.put('/:id', protect, appointmentValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Patients cannot update certain fields
    if (req.user.role === 'patient') {
      const allowedFields = ['patientNotes', 'symptoms', 'reasonForVisit'];
      const requestedFields = Object.keys(req.body);
      const hasUnauthorizedFields = requestedFields.some(field => !allowedFields.includes(field));

      if (hasUnauthorizedFields) {
        return res.status(403).json({
          success: false,
          message: 'Patients can only update patient notes, symptoms, and reason for visit'
        });
      }
    }

    // If updating appointment time, check for conflicts (exclude current appointment)
    if (req.body.appointmentDate || req.body.startTime || req.body.endTime) {
      const staff = req.body.staff || appointment.staff;
      const appointmentDate = req.body.appointmentDate || appointment.appointmentDate;
      const startTime = req.body.startTime || appointment.startTime;
      const endTime = req.body.endTime || appointment.endTime;

      const conflict = await Appointment.checkConflict(staff, appointmentDate, startTime, endTime, req.params.id);
      if (conflict) {
        return res.status(400).json({
          success: false,
          message: 'This time slot is already booked. Please choose a different time.'
        });
      }
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    .populate('patient', 'firstName lastName contact.phone')
    .populate('staff', 'firstName lastName specialty')
    .populate('service', 'name durationMinutes price');

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Admin, Staff - all; Patient - own only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    const { reason = 'No reason provided' } = req.body;

    // Cancel the appointment
    await appointment.cancel(reason);

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Confirm appointment
// @route   PUT /api/appointments/:id/confirm
// @access  Private (Admin, Staff - all; Patient - own only)
router.put('/:id/confirm', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this appointment'
      });
    }

    const confirmedBy = req.body.confirmedBy || req.user.email || 'system';

    await appointment.confirm(confirmedBy);

    res.status(200).json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private (Admin, Staff - all; Patient - own only)
router.put('/:id/reschedule', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this appointment'
      });
    }

    const { newDate, newStartTime, newEndTime, reason = 'Rescheduled by request' } = req.body;

    if (!newDate || !newStartTime || !newEndTime) {
      return res.status(400).json({
        success: false,
        message: 'New date, start time, and end time are required'
      });
    }

    // Validate new appointment time
    if (new Date(newDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'New appointment date cannot be in the past'
      });
    }

    if (newStartTime >= newEndTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be before end time'
      });
    }

    // Check for conflicts with new time
    const conflict = await Appointment.checkConflict(
      appointment.staff,
      new Date(newDate),
      newStartTime,
      newEndTime,
      req.params.id
    );

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'The new time slot is already booked. Please choose a different time.'
      });
    }

    await appointment.reschedule(new Date(newDate), newStartTime, newEndTime, reason);

    const updatedAppointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName')
      .populate('staff', 'firstName lastName')
      .populate('service', 'name durationMinutes');

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Complete appointment
// @route   PUT /api/appointments/:id/complete
// @access  Private (Staff and Admin only)
router.put('/:id/complete', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    await appointment.complete();

    res.status(200).json({
      success: true,
      message: 'Appointment marked as completed',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get today's appointments
// @route   GET /api/appointments/today
// @access  Private (Staff and Admin)
router.get('/today', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const staffId = req.query.staff || (req.user.role === 'staff' ? req.user.id : null);

    const appointments = await Appointment.findTodaysAppointments(staffId);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Private (Admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [
      totalAppointments,
      monthlyAppointments,
      todayAppointments,
      statusStats,
      serviceStats
    ] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      Appointment.countDocuments({
        appointmentDate: {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999))
        }
      }),
      Appointment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Appointment.aggregate([
        {
          $group: {
            _id: '$service',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'services',
            localField: '_id',
            foreignField: '_id',
            as: 'serviceDetails'
          }
        },
        { $unwind: '$serviceDetails' },
        {
          $project: {
            _id: '$serviceDetails._id',
            name: '$serviceDetails.name',
            count: 1
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAppointments,
        monthlyAppointments,
        todayAppointments,
        statusStats,
        topServices: serviceStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get available time slots
// @route   GET /api/appointments/available-slots
// @access  Public
router.get('/available-slots', async (req, res) => {
  try {
    const { staff, service, date } = req.query;

    if (!staff || !service || !date) {
      return res.status(400).json({
        success: false,
        message: 'Staff ID, service ID, and date are required'
      });
    }

    // Get service duration
    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Use the staff route to get available slots
    const staffDoc = await Staff.findById(staff);
    if (!staffDoc) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Get availability for the day
    const availability = staffDoc.availability.find(slot => slot.dayOfWeek === dayOfWeek);

    if (!availability) {
      return res.status(200).json({
        success: true,
        data: {
          date: appointmentDate,
          availableSlots: []
        }
      });
    }

    // Get existing appointments for the day
    const startOfDay = new Date(appointmentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(appointmentDate.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      staff: staff,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ['Cancelled', 'No Show'] }
    }).sort({ startTime: 1 });

    // Calculate available slots
    const availableSlots = calculateAvailableSlots(
      availability.startTime,
      availability.endTime,
      serviceDoc.durationMinutes,
      appointments
    );

    res.status(200).json({
      success: true,
      data: {
        date: appointmentDate,
        dayOfWeek,
        service: {
          name: serviceDoc.name,
          duration: serviceDoc.durationMinutes
        },
        staff: {
          name: `${staffDoc.firstName} ${staffDoc.lastName}`,
          specialty: staffDoc.specialty
        },
        availability,
        existingAppointments: appointments.length,
        availableSlots
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Helper functions
function calculateDurationMinutes(startTime, endTime) {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  return (end - start) / (1000 * 60);
}

function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function calculateAvailableSlots(startTime, endTime, serviceDuration, existingAppointments) {
  const availableSlots = [];
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  let currentMinutes = startMinutes;

  while (currentMinutes + serviceDuration <= endMinutes) {
    const slotStart = minutesToTime(currentMinutes);
    const slotEnd = minutesToTime(currentMinutes + serviceDuration);

    // Check if this slot conflicts with any existing appointment
    const hasConflict = existingAppointments.some(appointment => {
      const apptStart = timeToMinutes(appointment.startTime);
      const apptEnd = timeToMinutes(appointment.endTime);

      return (currentMinutes < apptEnd && currentMinutes + serviceDuration > apptStart);
    });

    if (!hasConflict) {
      availableSlots.push({
        startTime: slotStart,
        endTime: slotEnd
      });
    }

    currentMinutes += 30; // 30-minute intervals
  }

  return availableSlots;
}

export default router;
