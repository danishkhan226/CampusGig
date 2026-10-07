import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Review must be associated with an order'],
      unique: true,
      index: true
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Review must be associated with a service'],
      index: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must have a reviewer/buyer'],
      index: true
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must have an associated seller'],
      index: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a star rating between 1 and 5'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars']
    },
    comment: {
      type: String,
      required: [true, 'Please provide feedback in your review'],
      trim: true,
      minlength: [5, 'Review comment must be at least 5 characters'],
      maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    },
    sellerReply: {
      message: {
        type: String,
        trim: true,
        maxlength: [1000, 'Seller reply cannot exceed 1000 characters']
      },
      repliedAt: {
        type: Date
      }
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for optimal queries
reviewSchema.index({ serviceId: 1, createdAt: -1 });
reviewSchema.index({ sellerId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
