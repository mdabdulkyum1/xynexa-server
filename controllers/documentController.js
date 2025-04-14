import Document from '../models/documentModel.js';

// Create a new document
export const createDocument = async (req, res) => {
  try {
    const { title, content, docCreatorEmail, docCreator_id } = req.body;

    const newDocument = new Document({
      title,
      content,
      docCreatorEmail,
      docCreator_id,
    });

    await newDocument.save();

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      document: newDocument,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating document',
      error: error.message,
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
        message: 'Email is required in query',
      });
    }

    const documents = await Document.find({ docCreatorEmail: email });

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message,
    });
  }
};

// Update a document by ID
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );

    if (!updatedDocument) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      document: updatedDocument,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating document',
      error: error.message,
    });
  }
};

// Delete a document by ID
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDocument = await Document.findByIdAndDelete(id);

    if (!deletedDocument) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message,
    });
  }
};


// Get a document by id
export const getDocumentById = async (req, res) => {
    try{
        const {id} = req.params;
        const document = await Document.findById(id);

        if(!document) {
            return res.status(404).json({
                success: false,
                message:"Document not found."
            })
        }

        res.status(200).json({
            success: true,
            document
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message: "Error fetching document by ID",
            error: error.message
        })
    }
}