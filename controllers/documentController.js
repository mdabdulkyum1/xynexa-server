// controllers/documentController.js

import Document from '../models/documentModel.js';

// Create a new document
export const createDocument = async (req, res) => {
  try {
    const { title, content, docCreatorEmail } = req.body;
    console.log(req.body); // Log the request body for debugging
    const newDocument = new Document({ title, content, docCreatorEmail });
    await newDocument.save();
    res.status(201).json(newDocument);
  } catch (error) {
    res.status(500).json({ message: 'Error creating document', error });
  }
};
