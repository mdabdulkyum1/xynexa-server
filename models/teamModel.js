const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users in the team
  },
  { timestamps: true, versionKey: false }
);

const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);
export default Team;
