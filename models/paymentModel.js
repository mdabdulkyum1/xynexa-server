// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: [3, "Name must be at least 3 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
  },
  amount: {
    type: Number,
    required: true,
    min: [100, "Minimum amount is 100 cents"],
  },
  stripePaymentId: String,
  status: {
    type: String,
    enum: ["pending", "succeeded", "failed"],
    default: "pending",
  },
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
