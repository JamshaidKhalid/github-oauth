const mongoose = require("mongoose");

const OrgIssueSchema = new mongoose.Schema({
  integrationId: { type: mongoose.Schema.Types.ObjectId },
  orgName: String,
  repoName: String,
  number: Number,
  title: String,
  user: Object,
  state: String,
  labels: Array,
  htmlUrl: String,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("OrgIssue", OrgIssueSchema, "org-issues");
