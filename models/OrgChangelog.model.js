const mongoose = require("mongoose");

const OrgChangelogSchema = new mongoose.Schema({
  integrationId: { type: mongoose.Schema.Types.ObjectId },
  orgName: String,
  repoName: String,
  issueNumber: Number,
  body: String,
  user: Object,
  createdAt: Date
}, { timestamps: true });

module.exports = mongoose.model("OrgChangelog", OrgChangelogSchema, "org-changelogs");
