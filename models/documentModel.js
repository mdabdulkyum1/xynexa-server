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
  }
});

const Document = mongoose.model('Document', documentSchema);

// Default export
export default Document;
