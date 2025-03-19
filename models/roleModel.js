const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Role name (Admin, Member, Viewer, etc.)
    permissions: [{ type: String, required: true }], // Permissions array
  },
  { timestamps: true, versionKey: false }
);

const Role = mongoose.models.Role || mongoose.model("Role", RoleSchema);

module.exports = Role;
