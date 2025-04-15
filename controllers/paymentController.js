// controllers/paymentController.js
import Stripe from "stripe";
import Payment from "../models/paymentModel.js";
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// @desc   Create Stripe Payment Intent
// @route  POST /api/payments/create-intent
// @access Public
export  const createPaymentIntent = async (req, res) => {
  const { name, email, amount } = req.body;

  try {
    // Step 1: Validate and Save to DB
    const payment = new Payment({ name, email, amount });
    await payment.validate(); // Mongoose validation
    await payment.save();

    // Step 2: Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      receipt_email: email,
      metadata: {
        paymentId: payment._id.toString(),
      },
    });

    // Step 3: Update with Stripe ID
    payment.stripePaymentId = paymentIntent.id;
    await payment.save();

    res.status(200).json({ clientSecret: paymentIntent.client_secret, paymentIntent });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(400).json({ error: error.message });
  }
};


