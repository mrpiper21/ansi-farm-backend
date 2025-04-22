import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const farmerCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600
  }
});

// Hash code before saving
farmerCodeSchema.pre('save', async function(next) {
  if (this.isModified('code')) {
    const salt = await bcrypt.genSalt(10);
    this.code = await bcrypt.hash(this.code, salt);
  }
  next();
});

const FarmerCode = mongoose.model('FarmerCode', farmerCodeSchema);
export default FarmerCode