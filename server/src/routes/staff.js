import express from 'express';
import { body, validationResult } from 'express-validator';
import { Staff } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware for staff creation/update
const staffValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2-50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2-50 characters'),
  body('role')
    .isIn(['Doctor', 'Therapist', 'Admin'])
    .withMessage('Role must be Doctor, Therapist, or Admin'),
  body('specialty')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialty must be between 2-100 characters'),
  body('contact.phone')
    .optional()
    .matches(/\d{10,15}/)
    .withMessage('Please provide a valid phone number'),
  body('contact.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('experience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Experience must be a non-negative integer'),
  body('availability')
    .optional()
    .isArray()
    .withMessage('Availability must be an array'),
  body('availability.*.dayOfWeek')
    .optional()
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day of week'),
  body('availability.*.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('availability.*.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
];

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Public (basic info) / Private (full info)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const specialty = req.query.specialty || '';
    const isActive = req.query.active !== undefined ? req.query.active === 'true' : true;

    // Build search query
    let query = { isActive };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (specialty) {
      query.specialty = { $regex: specialty, $options: 'i' };
    }

    // Different data based on authentication
    let selectFields = 'firstName lastName role specialty experience profileImage';

    // If authenticated, provide more details
    if (req.headers.authorization) {
      try {
        // Import auth middleware functions
        const { optionalAuth } = await import('../middleware/auth.js');
        // Apply optional auth to get user context
        await new Promise((resolve, reject) => {
          optionalAuth(req, res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
          selectFields = '-__v'; // Return all fields except __v
        }
      } catch (error) {
        // Continue with basic fields if auth fails
      }
    }

    const staff = await Staff.find(query)
      .select(selectFields)
      .sort({ lastName: 1, firstName: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Staff.countDocuments(query);

    res.status(200).json({
      success: true,
      count: staff.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single staff member
// @route   GET /api/staff/:id
// @access  Public (basic info) / Private (full info)
router.get('/:id', async (req, res) => {
  try {
    let selectFields = 'firstName lastName role specialty experience profileImage bio qualifications';

    // If authenticated staff/admin, provide full details
    if (req.headers.authorization) {
      try {
        const { optionalAuth } = await import('../middleware/auth.js');
        await new Promise((resolve, reject) => {
          optionalAuth(req, res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
          selectFields = '-__v';
        }
      } catch (error) {
        // Continue with basic fields
      }
    }

    const staff = await Staff.findById(req.params.id).select(selectFields);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    if (!staff.isActive && (!req.user || req.user.role === 'patient')) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Create new staff member
// @route   POST /api/staff
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), staffValidation, async (req, res) => {
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

    // Check if staff with same email already exists
    if (req.body.contact?.email) {
      const existingStaff = await Staff.findOne({ 'contact.email': req.body.contact.email });
      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: 'Staff member with this email already exists'
        });
      }
    }

    // Validate availability times
    if (req.body.availability) {
      for (const slot of req.body.availability) {
        if (slot.startTime >= slot.endTime) {
          return res.status(400).json({
            success: false,
            message: 'Start time must be before end time for all availability slots'
          });
        }
      }
    }

    const staff = await Staff.create(req.body);

    res.status(201).json({
      success: true,
      data: staff
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private (Admin or own profile)
router.put('/:id', protect, staffValidation, async (req, res) => {
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

    let staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Allow admin or own profile update
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this staff member'
      });
    }

    // Check if email is being changed and if it conflicts
    if (req.body.contact?.email && req.body.contact.email !== staff.contact?.email) {
      const existingStaff = await Staff.findOne({
        'contact.email': req.body.contact.email,
        _id: { $ne: req.params.id }
      });
      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: 'Staff member with this email already exists'
        });
      }
    }

    // Validate availability times
    if (req.body.availability) {
      for (const slot of req.body.availability) {
        if (slot.startTime >= slot.endTime) {
          return res.status(400).json({
            success: false,
            message: 'Start time must be before end time for all availability slots'
          });
        }
      }
    }

    // Non-admin users cannot change certain sensitive fields
    if (req.user.role !== 'admin') {
      delete req.body.role;
      delete req.body.isActive;
    }

    staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Deactivate staff member
// @route   DELETE /api/staff/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Soft delete - deactivate instead of hard delete
    staff.isActive = false;
    await staff.save();

    res.status(200).json({
      success: true,
      message: 'Staff member deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get staff member's appointments
// @route   GET /api/staff/:id/appointments
// @access  Private (Admin or own appointments)
router.get('/:id/appointments', protect, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Allow admin or own appointments
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these appointments'
      });
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const { Appointment } = await import('../models/index.js');

    const appointments = await Appointment.findByDateRange(startDate, endDate, { staff: req.params.id });

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

// @desc    Get staff member's schedule
// @route   GET /api/staff/:id/schedule
// @access  Private (Admin or own schedule)
router.get('/:id/schedule', protect, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Allow admin or own schedule
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this schedule'
      });
    }

    const date = req.query.date ? new Date(req.query.date) : new Date();
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

    // Get availability for the day
    const availability = staff.availability.find(slot => slot.dayOfWeek === dayOfWeek);

    if (!availability) {
      return res.status(200).json({
        success: true,
        message: 'Staff member is not available on this day',
        data: {
          date,
          dayOfWeek,
          available: false,
          availability: null,
          appointments: []
        }
      });
    }

    // Get appointments for the day
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const { Appointment } = await import('../models/index.js');

    const appointments = await Appointment.find({
      staff: req.params.id,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ['Cancelled', 'No Show'] }
    })
    .populate('patient', 'firstName lastName')
    .populate('service', 'name durationMinutes')
    .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      data: {
        date,
        dayOfWeek,
        available: true,
        availability,
        appointments,
        appointmentCount: appointments.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update staff availability
// @route   PUT /api/staff/:id/availability
// @access  Private (Admin or own availability)
router.put('/:id/availability', protect, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Allow admin or own availability update
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this availability'
      });
    }

    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Availability must be an array'
      });
    }

    // Validate availability times
    for (const slot of availability) {
      if (!['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(slot.dayOfWeek)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid day of week'
        });
      }

      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.startTime) ||
          !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.endTime)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid time format. Use HH:MM'
        });
      }

      if (slot.startTime >= slot.endTime) {
        return res.status(400).json({
          success: false,
          message: 'Start time must be before end time'
        });
      }
    }

    staff.availability = availability;
    await staff.save();

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get available time slots for a staff member
// @route   GET /api/staff/:id/available-slots
// @access  Public
router.get('/:id/available-slots', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff || !staff.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found or inactive'
      });
    }

    const date = req.query.date ? new Date(req.query.date) : new Date();
    const serviceDuration = parseInt(req.query.duration) || 60; // minutes

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

    // Get availability for the day
    const availability = staff.availability.find(slot => slot.dayOfWeek === dayOfWeek);

    if (!availability) {
      return res.status(200).json({
        success: true,
        data: {
          date,
          availableSlots: []
        }
      });
    }

    // Get existing appointments for the day
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const { Appointment } = await import('../models/index.js');

    const appointments = await Appointment.find({
      staff: req.params.id,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ['Cancelled', 'No Show'] }
    }).sort({ startTime: 1 });

    // Calculate available slots
    const availableSlots = [];
    const startTime = availability.startTime;
    const endTime = availability.endTime;

    // Convert times to minutes for easier calculation
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    let currentMinutes = startMinutes;

    while (currentMinutes + serviceDuration <= endMinutes) {
      const slotStart = minutesToTime(currentMinutes);
      const slotEnd = minutesToTime(currentMinutes + serviceDuration);

      // Check if this slot conflicts with any existing appointment
      const hasConflict = appointments.some(appointment => {
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

    res.status(200).json({
      success: true,
      data: {
        date,
        dayOfWeek,
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
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export default router;
