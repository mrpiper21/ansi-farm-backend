// models/Tip.ts
import mongoose, { Schema, Document } from "mongoose";

interface ITip extends Document {
  id: string;
  type: 'article' | 'video';
  title: string;
  content: string;
  category: 'soil' | 'irrigation' | 'crops' | 'pests';
  imageUrl?: string;
  videoUrl?: string;
  thumbnail?: string;
  duration?: string;
  createdAt: Date;
}

const tipSchema: Schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['article', 'video'] as const 
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['soil', 'irrigation', 'crops', 'pests'] as const 
  },
  imageUrl: { 
    type: String, 
    required: function(this: ITip) { return this.type === 'article'; } 
  },
  videoUrl: { 
    type: String, 
    required: function(this: ITip) { return this.type === 'video'; } 
  },
  thumbnail: { 
    type: String, 
    required: function(this: ITip) { return this.type === 'video'; } 
  },
  duration: { 
    type: String, 
    required: function(this: ITip) { return this.type === 'video'; } 
  },
  createdAt: { type: Date, default: Date.now }
});

const Tip = mongoose.model<ITip>('Tip', tipSchema);
export default Tip;