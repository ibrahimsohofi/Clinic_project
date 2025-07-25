import express from 'express';
import { body, validationResult } from 'express-validator';
import { Service } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware for service creation/update
const serviceValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Service name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2-100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Service description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Service description must be between 10-1000 characters'),
  body('category')
    .isIn(['Physiotherapy', 'Occupational Therapy', 'Speech Therapy', 'Rehabilitation', 'Consultation', 'Other'])
    .withMessage('Invalid service category'),
  body('durationMinutes')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('sessionCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Session count must be at least 1'),
  body('specialtyRequired')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialty must be between 2-100 characters'),
  body('prerequisites')
    .optional()
    .isArray()
    .withMessage('Prerequisites must be an array'),
  body('contraindications')
    .optional()
    .isArray()
    .withMessage('Contraindications must be an array'),
  body('benefits')
    .optional()
    .isArray()
    .withMessage('Benefits must be an array'),
  body('equipment')
    .optional()
    .isArray()
    .withMessage('Equipment must be an array'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

// @desc    Get all services
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const isActive = req.query.active !== undefined ? req.query.active === 'true' : true;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Number.MAX_VALUE;

    // Build search query
    let query = {
      isActive,
      price: { $gte: minPrice, $lte: maxPrice }
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) {
      query.category = category;
    }

    const services = await Service.find(query)
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Service.countDocuments(query);

    // Get unique categories for filtering
    const categories = await Service.distinct('category', { isActive: true });

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      filters: {
        categories
      },
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (!service.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Service is not available'
      });
    }

    // Get related services in the same category
    const relatedServices = await Service.find({
      category: service.category,
      _id: { $ne: service._id },
      isActive: true
    }).limit(5);

    res.status(200).json({
      success: true,
      data: service,
      relatedServices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), serviceValidation, async (req, res) => {
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

    // Check if service with same name already exists
    const existingService = await Service.findOne({
      name: req.body.name,
      isActive: true
    });

    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'Service with this name already exists'
      });
    }

    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), serviceValidation, async (req, res) => {
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

    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if name is being changed and if it conflicts
    if (req.body.name && req.body.name !== service.name) {
      const existingService = await Service.findOne({
        name: req.body.name,
        _id: { $ne: req.params.id },
        isActive: true
      });

      if (existingService) {
        return res.status(400).json({
          success: false,
          message: 'Service with this name already exists'
        });
      }
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Delete/Deactivate service
// @route   DELETE /api/services/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if service has active appointments before deletion
    const { Appointment } = await import('../models/index.js');
    const activeAppointments = await Appointment.countDocuments({
      service: req.params.id,
      status: { $nin: ['Cancelled', 'No Show', 'Completed'] },
      appointmentDate: { $gte: new Date() }
    });

    if (activeAppointments > 0) {
      // Soft delete - deactivate instead of hard delete
      service.isActive = false;
      await service.save();

      return res.status(200).json({
        success: true,
        message: `Service deactivated successfully (${activeAppointments} active appointments found)`
      });
    }

    // Hard delete if no active appointments
    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get services by category
// @route   GET /api/services/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const services = await Service.find({
      category: { $regex: category, $options: 'i' },
      isActive: true
    })
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

    const total = await Service.countDocuments({
      category: { $regex: category, $options: 'i' },
      isActive: true
    });

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get services statistics
// @route   GET /api/services/stats
// @access  Private (Admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalServices = await Service.countDocuments({ isActive: true });
    const servicesByCategory = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgDuration: { $avg: '$durationMinutes' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const priceStats = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    // Get most popular services (based on appointment count)
    const { Appointment } = await import('../models/index.js');
    const popularServices = await Appointment.aggregate([
      {
        $group: {
          _id: '$service',
          appointmentCount: { $sum: 1 }
        }
      },
      { $sort: { appointmentCount: -1 } },
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
          category: '$serviceDetails.category',
          appointmentCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalServices,
        servicesByCategory,
        priceStats: priceStats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 },
        popularServices
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Search services
// @route   GET /api/services/search/:query
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchQuery = {
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
        { benefits: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    const services = await Service.find(searchQuery)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Service.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      searchQuery: query,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get compatible staff for a service
// @route   GET /api/services/:id/compatible-staff
// @access  Public
router.get('/:id/compatible-staff', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service || !service.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or inactive'
      });
    }

    const { Staff } = await import('../models/index.js');

    let query = { isActive: true };

    // If service requires specific specialty, filter by it
    if (service.specialtyRequired) {
      query.specialty = service.specialtyRequired;
    }

    const compatibleStaff = await Staff.find(query)
      .select('firstName lastName specialty experience profileImage availability')
      .sort({ experience: -1, lastName: 1 });

    res.status(200).json({
      success: true,
      service: {
        id: service._id,
        name: service.name,
        specialtyRequired: service.specialtyRequired
      },
      count: compatibleStaff.length,
      data: compatibleStaff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
