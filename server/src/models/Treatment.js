import mongoose from 'mongoose';

const { Schema } = mongoose;

const treatmentSchema = new Schema({
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
  appointment: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false // Some treatments might not be pre-scheduled
  },
  date: {
    type: Date,
    required: [true, 'Treatment date is required']
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
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'No Show'],
    default: 'Scheduled'
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  clinicalNotes: {
    assessment: String,
    intervention: String,
    progress: String,
    recommendations: String
  },
  outcome: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'No Change', 'Deteriorated'],
    required: function() {
      return this.status === 'Completed';
    }
  },
  painLevelBefore: {
    type: Number,
    min: [0, 'Pain level must be between 0 and 10'],
    max: [10, 'Pain level must be between 0 and 10']
  },
  painLevelAfter: {
    type: Number,
    min: [0, 'Pain level must be between 0 and 10'],
    max: [10, 'Pain level must be between 0 and 10']
  },
  nextAppointment: {
    recommended: {
      type: Boolean,
      default: false
    },
    suggestedDate: Date,
    notes: String
  },
  attachments: [{
    filename: String,
    url: String,
    type: {
      type: String,
      enum: ['image', 'document', 'report', 'other']
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  billing: {
    amount: Number,
    paid: {
      type: Boolean,
      default: false
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'Insurance', 'Transfer', 'Other']
    },
    paymentDate: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for treatment duration in minutes
treatmentSchema.virtual('durationMinutes').get(function() {
  if (this.startTime && this.endTime) {
    const start = new Date(`1970-01-01T${this.startTime}:00`);
    const end = new Date(`1970-01-01T${this.endTime}:00`);
    return (end - start) / (1000 * 60);
  }
  return null;
});

// Virtual for pain improvement
treatmentSchema.virtual('painImprovement').get(function() {
  if (this.painLevelBefore !== undefined && this.painLevelAfter !== undefined) {
    return this.painLevelBefore - this.painLevelAfter;
  }
  return null;
});

// Virtual to check if treatment is overdue
treatmentSchema.virtual('isOverdue').get(function() {
  if (this.status === 'Scheduled' && this.date) {
    return new Date() > this.date;
  }
  return false;
});

// Method to complete treatment
treatmentSchema.methods.complete = function(outcome, notes) {
  this.status = 'Completed';
  this.outcome = outcome;
  if (notes) this.notes = notes;
  return this.save();
};

// Method to cancel treatment
treatmentSchema.methods.cancel = function(reason) {
  this.status = 'Cancelled';
  this.notes = this.notes ? `${this.notes}\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
  return this.save();
};

// Static method to find treatments by patient
treatmentSchema.statics.findByPatient = function(patientId) {
  return this.find({ patient: patientId })
    .populate('staff', 'firstName lastName specialty')
    .populate('service', 'name duration price')
    .sort({ date: -1 });
};

// Static method to find treatments by staff member
treatmentSchema.statics.findByStaff = function(staffId, startDate, endDate) {
  const query = { staff: staffId };
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }
  return this.find(query)
    .populate('patient', 'firstName lastName')
    .populate('service', 'name duration')
    .sort({ date: 1 });
};

// Index for faster searches
treatmentSchema.index({ patient: 1, date: -1 });
treatmentSchema.index({ staff: 1, date: 1 });
treatmentSchema.index({ service: 1 });
treatmentSchema.index({ date: 1 });
treatmentSchema.index({ status: 1 });

const Treatment = mongoose.model('Treatment', treatmentSchema);

export default Treatment;
