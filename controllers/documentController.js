// controllers/documentController.js

import Document from '../models/documentModel.js';

// Create a new document
export const createDocument = async (req, res) => {
  try {
    const { title, content, docCreatorEmail, docCreator_id } = req.body;

    const newDocument = new Document({
      title,
      content,
      docCreatorEmail,
      docCreator_id
    });

    await newDocument.save();

    res.status(201).json({
      success: true,
      message: "Document created successfully",
      document: newDocument
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating document",
      error: error.message
    });
  }
};
