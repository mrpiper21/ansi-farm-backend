import mongoose, { Document, model, Schema } from "mongoose";

export interface IUser extends Document {
	email: string;
	type: "client" | "farmer";
	userName: string;
	location: string;
	createdAt: Date;
	password: string;
	profileImage?: string;
	description?: string;
	phone?: string;
	orders: mongoose.Types.ObjectId[];
}

const userSchema: Schema = new Schema({
	userName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	profileImage: {
		type: String,
	},
	password: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		enum: ["client", "farmer"],
		default: "client",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	location: {
		type: String,
	},
	description: {
		type: String,
	},
	phone: {
		type: String,
	},
	orders: [
		{
			type: Schema.Types.ObjectId,
			ref: "Order",
		},
	],
});

export default model<IUser>("User", userSchema);
