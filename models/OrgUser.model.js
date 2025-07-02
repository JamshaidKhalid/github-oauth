const mongoose = require("mongoose");

const OrgUserSchema = new mongoose.Schema({
  integrationId: { type: mongoose.Schema.Types.ObjectId },
  orgName: String,
  login: String,
  userId: Number,
  avatarUrl: String,
  htmlUrl: String,
  role: String
}, { timestamps: true });

module.exports = mongoose.model("OrgUser", OrgUserSchema, "org-users");
