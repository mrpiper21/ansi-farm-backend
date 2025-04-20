import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  description?: string;
  price: number;
  quantity?: string;
  imageUrl?: string;
  farmer: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
	name: { type: String, required: true },
	category: {
		type: String,
		required: true,
		enum: ["fruits", "vegetables", "grains", "dairy", "herbs"],
	},
	description: { type: String },
	price: { type: Number, required: true, min: 0 },
	quantity: { type: Number, required: true, min: 0 },
	imageUrl: { type: String },
	farmer: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

// Add index for better query performance
ProductSchema.index({ category: 1, createdAt: -1 });

export default mongoose.model<IProduct>('Product', ProductSchema);