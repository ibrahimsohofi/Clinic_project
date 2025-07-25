import mongoose from 'mongoose';

const { Schema } = mongoose;

const serviceSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required']
  },
  category: {
    type: String,
    enum: ['Physiotherapy', 'Occupational Therapy', 'Speech Therapy', 'Rehabilitation', 'Consultation', 'Other'],
    required: [true, 'Service category is required']
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Service duration is required'],
    min: [15, 'Service duration must be at least 15 minutes'],
    max: [480, 'Service duration cannot exceed 8 hours']
  },
  price: {
    type: Number,
    required: [true, 'Service price is required'],
    min: [0, 'Price cannot be negative']
  },
  specialtyRequired: {
    type: String,
    required: false
  }, // e.g., "Physiotherapy", "Occupational Therapy"
  isActive: {
    type: Boolean,
    default: true
  },
  prerequisites: [String], // e.g., "Initial consultation required"
  contraindications: [String], // e.g., "Not suitable for acute injuries"
  benefits: [String], // e.g., "Improves mobility", "Reduces pain"
  equipment: [String], // e.g., "Exercise equipment", "Treatment table"
  sessionCount: {
    type: Number,
    default: 1,
    min: [1, 'Session count must be at least 1']
  }, // number of sessions typically required
  image: String, // URL to service image
  tags: [String] // for search and categorization
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for duration in hours
serviceSchema.virtual('durationHours').get(function() {
  return this.durationMinutes / 60;
});

// Virtual for price per minute
serviceSchema.virtual('pricePerMinute').get(function() {
  return this.price / this.durationMinutes;
});

// Method to check if a staff member can provide this service
serviceSchema.methods.canBeProvidedBy = function(staffMember) {
  if (!this.specialtyRequired) return true;
  return staffMember.specialty === this.specialtyRequired;
};

// Static method to find services by category
serviceSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

// Static method to find services within price range
serviceSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
  return this.find({
    price: { $gte: minPrice, $lte: maxPrice },
    isActive: true
  });
};

// Index for faster searches
serviceSchema.index({ name: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ specialtyRequired: 1 });
serviceSchema.index({ tags: 1 });

const Service = mongoose.model('Service', serviceSchema);

export default Service;
