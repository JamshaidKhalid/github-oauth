const mongoose = require("mongoose");

const OrgRepoSchema = new mongoose.Schema({
  integrationId: { type: mongoose.Schema.Types.ObjectId },
  orgName: String,
  repoId: Number,
  name: String,
  fullName: String,
  private: Boolean,
  description: String,
  language: String,
  defaultBranch: String,
  htmlUrl: String
}, { timestamps: true });

module.exports = mongoose.model("OrgRepo", OrgRepoSchema, "org-repos");
