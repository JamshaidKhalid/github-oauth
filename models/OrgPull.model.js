const mongoose = require("mongoose");

const OrgPullSchema = new mongoose.Schema({
  integrationId: { type: mongoose.Schema.Types.ObjectId },
  orgName: String,
  repoName: String,
  number: Number,
  title: String,
  user: Object,
  state: String,
  merged: Boolean,
  htmlUrl: String,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("OrgPull", OrgPullSchema, "org-pulls");
