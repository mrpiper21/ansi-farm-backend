import mongoose, { Document, Schema, Model } from "mongoose";

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  read: boolean;
}

const messageSchema: Schema = new Schema({
	sender: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	receiver: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	content: {
		type: String,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
	read: {
		type: Boolean,
		default: false,
	},
});

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema: Schema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

export const Message: Model<IMessage> = mongoose.model<IMessage>("Message", messageSchema);
export const Chat: Model<IChat> = mongoose.model<IChat>("Chat", chatSchema);