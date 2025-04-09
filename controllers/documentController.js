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

// Get documents by creator email
export const getDocumentsByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required in query"
      });
    }

    const documents = await Document.find({ docCreatorEmail: email });

    res.status(200).json({
      success: true,
      documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching documents",
      error: error.message
    });
  }
};

