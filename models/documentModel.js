// models/documentModel.js

import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  docCreatorEmail: {
    type: String,
    required: true
  },
  docCreator_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true // <-- Automatically adds createdAt & updatedAt
});

const Document = mongoose.model('Document', documentSchema);

// Default export for ESM
export default Document;
