// routes/documentRoutes.js

import express from 'express';
import { createDocument, getDocumentsByEmail } from '../controllers/documentController.js';

const router = express.Router();

// POST route for creating a new document
router.post('/create', createDocument);
router.get('/getAllDoc', getDocumentsByEmail);

export default router;
