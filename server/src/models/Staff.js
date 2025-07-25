import mongoose from 'mongoose';

const { Schema } = mongoose;

const staffSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['Doctor', 'Therapist', 'Admin'],
    required: [true, 'Role is required']
  },
  specialty: {
    type: String,
    required: function() {
      return this.role === 'Doctor' || this.role === 'Therapist';
    }
  }, // e.g., Physiotherapy, Occupational Therapy
  contact: {
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /\d{10,15}/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    },
    email: {
      type: String,
      lowercase: true,
      validate: {
        validator: function(v) {
          return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email'
      }
    }
  },
  availability: [{
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Please enter a valid time format (HH:MM)'
      }
    }, // e.g., "09:00"
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Please enter a valid time format (HH:MM)'
      }
    }    // e.g., "17:00"
  }],
  qualifications: [String],
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative']
  }, // years of experience
  bio: String,
  profileImage: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
staffSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual to get available days
staffSchema.virtual('availableDays').get(function() {
  return this.availability.map(slot => slot.dayOfWeek);
});

// Method to check if staff is available on a specific day and time
staffSchema.methods.isAvailable = function(dayOfWeek, time) {
  const availability = this.availability.find(slot => slot.dayOfWeek === dayOfWeek);
  if (!availability) return false;

  return time >= availability.startTime && time <= availability.endTime;
};

// Index for faster searches
staffSchema.index({ firstName: 1, lastName: 1 });
staffSchema.index({ role: 1 });
staffSchema.index({ specialty: 1 });
staffSchema.index({ 'contact.email': 1 });

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;
