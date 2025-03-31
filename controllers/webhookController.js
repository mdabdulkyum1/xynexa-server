import User from "../models/User.js";

export const handleClerkWebhook = async (req, res) => {
  try {
    const { data } = req.body;
    console.log("Webhook Data:", data);

    if (data?.object === "session" && data?.status === "ended") {
      await User.findOneAndUpdate(
        { clerkId: data.user_id },
        { status: "Offline" }
      );

      req.io.emit("update-status", { clerkId: data.user_id, status: "Offline" });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


