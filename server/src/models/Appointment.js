import mongoose from 'mongoose';

const { Schema } = mongoose;

const appointmentSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient reference is required']
  },
  staff: {
    type: Schema.Types.ObjectId,
    ref: 'Staff',
    required: [true, 'Staff reference is required']
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service reference is required']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Appointment date must be in the future'
    }
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Please enter a valid time format (HH:MM)'
    }
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Please enter a valid time format (HH:MM)'
    }
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show', 'Rescheduled'],
    default: 'Scheduled'
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  appointmentType: {
    type: String,
    enum: ['Initial Consultation', 'Follow-up', 'Treatment', 'Assessment', 'Emergency'],
    default: 'Treatment'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  patientNotes: {
    type: String,
    maxlength: [500, 'Patient notes cannot exceed 500 characters']
  }, // Notes provided by patient during booking
  symptoms: [String], // Current symptoms reported by patient
  reasonForVisit: {
    type: String,
    required: [true, 'Reason for visit is required'],
    maxlength: [500, 'Reason for visit cannot exceed 500 characters']
  },
  isFirstVisit: {
    type: Boolean,
    default: false
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderDate: Date,
  confirmationRequired: {
    type: Boolean,
    default: true
  },
  confirmedAt: Date,
  confirmedBy: String, // email or phone
  cancellationReason: String,
  cancelledAt: Date,
  rescheduledFrom: {
    date: Date,
    time: String,
    reason: String
  },
  attendanceHistory: [{
    date: Date,
    status: {
      type: String,
      enum: ['Present', 'Late', 'No Show', 'Cancelled']
    },
    notes: String
  }],
  payment: {
    amount: Number,
    method: {
      type: String,
      enum: ['Cash', 'Card', 'Insurance', 'Transfer', 'Online', 'Pending']
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Partially Paid', 'Refunded', 'Failed'],
      default: 'Pending'
    },
    transactionId: String,
    paidAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for appointment duration in minutes
appointmentSchema.virtual('durationMinutes').get(function() {
  if (this.startTime && this.endTime) {
    const start = new Date(`1970-01-01T${this.startTime}:00`);
    const end = new Date(`1970-01-01T${this.endTime}:00`);
    return (end - start) / (1000 * 60);
  }
  return null;
});

// Virtual to check if appointment is today
appointmentSchema.virtual('isToday').get(function() {
  if (this.appointmentDate) {
    const today = new Date();
    const appointmentDay = new Date(this.appointmentDate);
    return today.toDateString() === appointmentDay.toDateString();
  }
  return false;
});

// Virtual to check if appointment is overdue
appointmentSchema.virtual('isOverdue').get(function() {
  if (this.status === 'Scheduled' && this.appointmentDate) {
    const appointmentDateTime = new Date(`${this.appointmentDate.toDateString()} ${this.startTime}`);
    return new Date() > appointmentDateTime;
  }
  return false;
});

// Virtual for full appointment datetime
appointmentSchema.virtual('fullDateTime').get(function() {
  if (this.appointmentDate && this.startTime) {
    return new Date(`${this.appointmentDate.toDateString()} ${this.startTime}`);
  }
  return null;
});

// Method to confirm appointment
appointmentSchema.methods.confirm = function(confirmedBy) {
  this.status = 'Confirmed';
  this.confirmedAt = new Date();
  this.confirmedBy = confirmedBy;
  return this.save();
};

// Method to cancel appointment
appointmentSchema.methods.cancel = function(reason) {
  this.status = 'Cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

// Method to reschedule appointment
appointmentSchema.methods.reschedule = function(newDate, newStartTime, newEndTime, reason) {
  this.rescheduledFrom = {
    date: this.appointmentDate,
    time: this.startTime,
    reason: reason
  };
  this.appointmentDate = newDate;
  this.startTime = newStartTime;
  this.endTime = newEndTime;
  this.status = 'Rescheduled';
  return this.save();
};

// Method to mark as completed
appointmentSchema.methods.complete = function() {
  this.status = 'Completed';
  this.attendanceHistory.push({
    date: new Date(),
    status: 'Present',
    notes: 'Appointment completed successfully'
  });
  return this.save();
};

// Static method to find appointments by date range
appointmentSchema.statics.findByDateRange = function(startDate, endDate, options = {}) {
  const query = {
    appointmentDate: {
      $gte: startDate,
      $lte: endDate
    }
  };

  if (options.staff) query.staff = options.staff;
  if (options.patient) query.patient = options.patient;
  if (options.status) query.status = options.status;

  return this.find(query)
    .populate('patient', 'firstName lastName contact.phone contact.email')
    .populate('staff', 'firstName lastName specialty')
    .populate('service', 'name durationMinutes price')
    .sort({ appointmentDate: 1, startTime: 1 });
};

// Static method to find today's appointments
appointmentSchema.statics.findTodaysAppointments = function(staffId = null) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const query = {
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  };

  if (staffId) query.staff = staffId;

  return this.find(query)
    .populate('patient', 'firstName lastName contact.phone')
    .populate('staff', 'firstName lastName')
    .populate('service', 'name durationMinutes')
    .sort({ startTime: 1 });
};

// Static method to check for conflicts
appointmentSchema.statics.checkConflict = function(staffId, date, startTime, endTime, excludeId = null) {
  const query = {
    staff: staffId,
    appointmentDate: date,
    status: { $nin: ['Cancelled', 'No Show'] },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.findOne(query);
};

// Index for faster searches and to prevent double booking
appointmentSchema.index({ staff: 1, appointmentDate: 1, startTime: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });
appointmentSchema.index({ staff: 1, status: 1 });

// Compound index to prevent double booking (unique constraint)
appointmentSchema.index(
  { staff: 1, appointmentDate: 1, startTime: 1, endTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $nin: ['Cancelled', 'No Show'] }
    }
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
