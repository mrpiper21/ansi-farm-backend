import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
	product: mongoose.Types.ObjectId;
	quantity: number;
	price: number;
	farmer: mongoose.Types.ObjectId;
}

export interface IOrder extends Document {
	buyer: mongoose.Types.ObjectId;
	items: IOrderItem[];
	totalAmount: number;
	status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
	farmers: mongoose.Types.ObjectId[];
	createdAt: Date;
	updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
	buyer: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	items: [
		{
			product: {
				type: Schema.Types.ObjectId,
				ref: "Product",
				required: true,
			},
			quantity: {
				type: Number,
				required: true,
				min: 1,
			},
			price: {
				type: Number,
				required: true,
				min: 0,
			},
			farmer: {
				type: Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
		},
	],
	farmers: [
		{
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	],
	totalAmount: {
		type: Number,
		required: true,
		min: 0,
	},
	status: {
		type: String,
		enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
		default: "pending",
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

OrderSchema.post("save", async function (doc) {
	const farmerIds = doc.farmers;
	await mongoose
		.model("User")
		.updateMany(
			{ _id: { $in: farmerIds } },
			{ $addToSet: { orders: doc._id } }
		);
});

OrderSchema.index({ buyer: 1, status: 1 });
OrderSchema.index({ farmers: 1, status: 1 });
OrderSchema.index({ "items.farmer": 1, status: 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);