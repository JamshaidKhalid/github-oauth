const mongoose = require("mongoose");

const OrgCommitSchema = new mongoose.Schema({
  integrationId: { type: mongoose.Schema.Types.ObjectId },
  orgName: String,
  repoName: String,
  sha: String,
  author: Object,
  committer: Object,
  message: String,
  url: String,
  date: Date
}, { timestamps: true });

module.exports = mongoose.model("OrgCommit", OrgCommitSchema, "org-commits");
