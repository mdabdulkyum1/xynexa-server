import dotenv from 'dotenv';
import Stripe from "stripe";
import User from "../models/userModel.js";
import Payment from "../models/paymentModel.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const createPaymentIntent = async (req, res) => {
  const { amount } = req.body;

  if (!amount || typeof amount !== "number") {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), 
      currency: "usd",
      payment_method_types: ["card"],
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({ error: "Payment intent creation failed" });
  }
};



export const paymentInfoUpdate = async (req, res) => {
  const { userId, price, transactionId, plan } = req.body;
console.log("user id >>>jasd;kfj ", userId);
  try {
    // Validate user existence
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Create new payment record
    const newPayment = new Payment({
      user: user._id,
      amount: Math.round(price * 100), // Store as cents if using Stripe logic
      stripePaymentId: transactionId,
      status: "succeeded",
    });

    await newPayment.save();

    // Optionally update user plan/package
    user.package = plan;
    await user.save();

    res.status(201).json({ message: "Payment recorded and user updated", payment: newPayment });
  } catch (error) {
    console.error("Payment save error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};