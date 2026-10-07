import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Service must have an associated seller'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a service title'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed service description'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters long'],
      maxlength: [2500, 'Description cannot exceed 2500 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a service category'],
      enum: {
        values: [
          'Development',
          'Design',
          'Writing',
          'Video',
          'Marketing',
          'Academic Projects',
          'Data',
          'Other'
        ],
        message: 'Invalid service category'
      },
      index: true
    },
    skills: {
      type: [String],
      default: [],
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Please specify a starting price in INR'],
      min: [50, 'Price must be at least ₹50'],
      index: true
    },
    deliveryDays: {
      type: Number,
      required: [true, 'Please specify delivery duration in days'],
      min: [1, 'Delivery time must be at least 1 day'],
      max: [90, 'Delivery time cannot exceed 90 days'],
      index: true
    },
    images: {
      type: [String],
      default: []
    },
    requirements: {
      type: String,
      default: '',
      maxlength: [1000, 'Requirements cannot exceed 1000 characters']
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    views: {
      type: Number,
      default: 0
    },
    ordersCount: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Text index for keyword search on title, description, and skills
serviceSchema.index(
  { title: 'text', description: 'text', skills: 'text' },
  { weights: { title: 5, skills: 3, description: 1 } }
);

// Compound indexes for optimal marketplace filtering and sorting
serviceSchema.index({ category: 1, price: 1, rating: -1, isActive: 1 });
serviceSchema.index({ sellerId: 1, isActive: 1 });
serviceSchema.index({ createdAt: -1 });

const Service = mongoose.model('Service', serviceSchema);

export default Service;
