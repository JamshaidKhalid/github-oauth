const mongoose = require("mongoose");

const GithubOrganizationSchema = new mongoose.Schema({
  integrationId: { type: mongoose.Schema.Types.ObjectId, ref: "GithubIntegration" },
  orgId: Number,
  login: String,
  avatarUrl: String,
  description: String,
  url: String
}, { timestamps: true });

module.exports = mongoose.model("GithubOrganization", GithubOrganizationSchema, "github-organizations");
