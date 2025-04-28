// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
     
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
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
