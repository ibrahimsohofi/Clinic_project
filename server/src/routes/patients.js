import express from 'express';
import { body, validationResult } from 'express-validator';
import { Patient } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware for patient creation/update
const patientValidation = [
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
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const today = new Date();
      const dob = new Date(value);
      if (dob >= today) {
        throw new Error('Date of birth must be in the past');
      }
      return true;
    }),
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('contact.phone')
    .optional()
    .matches(/\d{10,15}/)
    .withMessage('Please provide a valid phone number'),
  body('contact.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Staff and Admin)
router.get('/', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Build search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { 'contact.email': { $regex: search, $options: 'i' } },
          { 'contact.phone': { $regex: search, $options: 'i' } }
        ]
      };
    }

    const patients = await Patient.find(query)
      .select('-medicalHistory') // Exclude sensitive data in list view
      .sort({ lastName: 1, firstName: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Patient.countDocuments(query);

    res.status(200).json({
      success: true,
      count: patients.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private (Staff, Admin, or own data)
router.get('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Allow access to own data or if user is staff/admin
    if (req.user.role === 'patient' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this patient data'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private (Staff and Admin)
router.post('/', protect, authorize('staff', 'admin'), patientValidation, async (req, res) => {
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

    // Check if patient with same email already exists
    if (req.body.contact?.email) {
      const existingPatient = await Patient.findOne({ 'contact.email': req.body.contact.email });
      if (existingPatient) {
        return res.status(400).json({
          success: false,
          message: 'Patient with this email already exists'
        });
      }
    }

    const patient = await Patient.create(req.body);

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private (Staff, Admin, or own data)
router.put('/:id', protect, patientValidation, async (req, res) => {
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

    let patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Allow update of own data or if user is staff/admin
    if (req.user.role === 'patient' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this patient data'
      });
    }

    // Check if email is being changed and if it conflicts with existing patient
    if (req.body.contact?.email && req.body.contact.email !== patient.contact?.email) {
      const existingPatient = await Patient.findOne({
        'contact.email': req.body.contact.email,
        _id: { $ne: req.params.id }
      });
      if (existingPatient) {
        return res.status(400).json({
          success: false,
          message: 'Patient with this email already exists'
        });
      }
    }

    patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // TODO: Check if patient has active appointments before deletion
    // For now, we'll allow deletion but in production you might want to soft delete

    await Patient.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get patient's appointments
// @route   GET /api/patients/:id/appointments
// @access  Private (Staff, Admin, or own data)
router.get('/:id/appointments', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Allow access to own data or if user is staff/admin
    if (req.user.role === 'patient' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this patient data'
      });
    }

    // Import Appointment model dynamically to avoid circular dependency
    const { Appointment } = await import('../models/index.js');

    const appointments = await Appointment.find({ patient: req.params.id })
      .populate('staff', 'firstName lastName specialty')
      .populate('service', 'name durationMinutes price')
      .sort({ appointmentDate: -1 });

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

// @desc    Get patient's treatments
// @route   GET /api/patients/:id/treatments
// @access  Private (Staff, Admin, or own data)
router.get('/:id/treatments', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Allow access to own data or if user is staff/admin
    if (req.user.role === 'patient' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this patient data'
      });
    }

    // Import Treatment model dynamically to avoid circular dependency
    const { Treatment } = await import('../models/index.js');

    const treatments = await Treatment.find({ patient: req.params.id })
      .populate('staff', 'firstName lastName specialty')
      .populate('service', 'name durationMinutes')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: treatments.length,
      data: treatments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update patient medical history
// @route   PUT /api/patients/:id/medical-history
// @access  Private (Staff and Admin only)
router.put('/:id/medical-history', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { medicalHistory } = req.body;

    if (!Array.isArray(medicalHistory)) {
      return res.status(400).json({
        success: false,
        message: 'Medical history must be an array'
      });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { medicalHistory },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
