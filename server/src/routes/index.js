import express from 'express';
import patientsRouter from './patients.js';
import staffRouter from './staff.js';
import servicesRouter from './services.js';
import appointmentsRouter from './appointments.js';
import authRouter from './auth.js';

const router = express.Router();

// API Routes
router.use('/auth', authRouter);
router.use('/patients', patientsRouter);
router.use('/staff', staffRouter);
router.use('/services', servicesRouter);
router.use('/appointments', appointmentsRouter);

// API Info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Medical Rehabilitation Clinic API',
    version: '1.0.0',
    endpoints: {
      patients: {
        'GET /api/patients': 'Get all patients',
        'GET /api/patients/:id': 'Get patient by ID',
        'POST /api/patients': 'Create new patient',
        'PUT /api/patients/:id': 'Update patient',
        'DELETE /api/patients/:id': 'Delete patient'
      },
      staff: {
        'GET /api/staff': 'Get all staff members',
        'GET /api/staff/:id': 'Get staff member by ID',
        'POST /api/staff': 'Create new staff member',
        'PUT /api/staff/:id': 'Update staff member',
        'DELETE /api/staff/:id': 'Deactivate staff member'
      },
      services: {
        'GET /api/services': 'Get all services',
        'GET /api/services/:id': 'Get service by ID',
        'POST /api/services': 'Create new service',
        'PUT /api/services/:id': 'Update service',
        'DELETE /api/services/:id': 'Delete service'
      },
      appointments: {
        'GET /api/appointments': 'Get all appointments',
        'GET /api/appointments/:id': 'Get appointment by ID',
        'POST /api/appointments': 'Create new appointment',
        'PUT /api/appointments/:id': 'Update appointment',
        'DELETE /api/appointments/:id': 'Cancel appointment'
      }
    }
  });
});

export default router;
