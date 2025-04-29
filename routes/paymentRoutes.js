// routes/paymentRoutes.js
import express from 'express';
const router = express.Router();
import  { createPaymentIntent , paymentInfoUpdate} from "../controllers/paymentController.js";

router.post("/create-payment-intent", createPaymentIntent);
router.post("/payments", paymentInfoUpdate); 


export default router;
