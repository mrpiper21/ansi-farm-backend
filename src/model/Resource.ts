// models/Resource.js
import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['crops', 'soil', 'pests', 'irrigation'],
    index: true
  },
  contentType: {
    type: String,
    required: true,
    enum: ['video', 'article'],
    default: 'article'
  },
  // Fields for video content
  videoUrl: {
    type: String,
    required: function() { return this.contentType === 'video'; },
    trim: true
  },
  thumbnail: {
    type: String,
    required: function() { return this.contentType === 'video'; },
    trim: true
  },
  duration: {
    type: String,
    required: function() { return this.contentType === 'video'; },
    trim: true
  },
  // Fields for article content
  imageUrl: {
    type: String,
    required: function() { return this.contentType === 'article'; },
    trim: true
  },
  content: {
    type: String,
    required: function() { return this.contentType === 'article'; },
    trim: true
  },
  // Common fields
  savedCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
resourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now() as any;
  next();
});

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;