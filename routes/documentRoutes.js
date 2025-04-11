import express from "express";
import {
  createDocument,
  getDocumentsByEmail,
  updateDocument,
  deleteDocument,
 
  getDocumentById,
} from "../controllers/documentController.js";

const router = express.Router();

// POST route for creating a new document
router.post("/create", createDocument);
router.get("/getAllDoc", getDocumentsByEmail);

router.put("/update/:id", updateDocument);

router.delete("/delete/:id", deleteDocument);
router.get("/document/:id", getDocumentById);

export default router;
